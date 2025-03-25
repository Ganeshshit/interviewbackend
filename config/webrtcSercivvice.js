import { io } from 'socket.io-client';
import { turnConfig } from '../config/turnConfig';

class WebRTCService {
    constructor() {
        this.socket = null;
        this.localStream = null;
        this.screenStream = null;
        this.peerConnections = new Map();
        this.onStreamCallbacks = [];
        this.onScreenShareCallbacks = [];
        this.isScreenSharing = false;
    }

    async initialize(serverUrl) {
        this.socket = io(serverUrl);
        this.setupSocketListeners();
    }

    setupSocketListeners() {
        this.socket.on('user-joined', this.handleUserJoined.bind(this));
        this.socket.on('user-left', this.handleUserLeft.bind(this));
        this.socket.on('signal', this.handleSignal.bind(this));
        this.socket.on('start-screen-share', this.handleStartScreenShare.bind(this));
        this.socket.on('stop-screen-share', this.handleStopScreenShare.bind(this));
    }

    async startCall(roomId, isInterviewer = false) {
        try {
            const stream = await navigator.mediaDevices.getUserMedia(turnConfig.mediaConstraints);
            this.localStream = stream;
            this.socket.emit('join-room', { roomId, isInterviewer });
            return stream;
        } catch (error) {
            console.error('Error starting call:', error);
            throw error;
        }
    }

    async startScreenShare(roomId) {
        try {
            const screenStream = await navigator.mediaDevices.getDisplayMedia(
                turnConfig.screenShareConstraints
            );

            this.screenStream = screenStream;
            this.isScreenSharing = true;

            // Notify other participants
            this.socket.emit('start-screen-share', { roomId });

            // Handle stream end
            screenStream.getVideoTracks()[0].onended = () => {
                this.stopScreenShare(roomId);
            };

            return screenStream;
        } catch (error) {
            console.error('Error sharing screen:', error);
            throw error;
        }
    }

    stopScreenShare(roomId) {
        if (this.screenStream) {
            this.screenStream.getTracks().forEach(track => track.stop());
            this.screenStream = null;
            this.isScreenSharing = false;
            this.socket.emit('stop-screen-share', { roomId });
        }
    }

    async createPeerConnection(userId, isScreenShare = false) {
        const peerConnection = new RTCPeerConnection(turnConfig);

        // Add local streams
        const stream = isScreenShare ? this.screenStream : this.localStream;
        stream.getTracks().forEach(track => {
            peerConnection.addTrack(track, stream);
        });

        // Handle ICE candidates
        peerConnection.onicecandidate = (event) => {
            if (event.candidate) {
                this.socket.emit('signal', {
                    type: 'ice-candidate',
                    candidate: event.candidate,
                    userId
                });
            }
        };

        // Handle connection state changes
        peerConnection.onconnectionstatechange = () => {
            console.log('Connection state:', peerConnection.connectionState);
        };

        // Handle remote streams
        peerConnection.ontrack = (event) => {
            const [remoteStream] = event.streams;
            this.handleRemoteStream(remoteStream, userId, isScreenShare);
        };

        this.peerConnections.set(userId, peerConnection);
        return peerConnection;
    }

    handleRemoteStream(stream, userId, isScreenShare) {
        const callbacks = isScreenShare ?
            this.onScreenShareCallbacks :
            this.onStreamCallbacks;

        callbacks.forEach(callback => callback(stream, userId));
    }

    // Event listeners
    onStream(callback) {
        this.onStreamCallbacks.push(callback);
    }

    onScreenShare(callback) {
        this.onScreenShareCallbacks.push(callback);
    }

    // Cleanup
    endCall() {
        if (this.localStream) {
            this.localStream.getTracks().forEach(track => track.stop());
        }
        if (this.screenStream) {
            this.screenStream.getTracks().forEach(track => track.stop());
        }
        this.peerConnections.forEach(pc => pc.close());
        this.peerConnections.clear();
        this.socket?.disconnect();
    }
}

export default new WebRTCService();