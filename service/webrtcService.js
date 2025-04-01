import { io } from 'socket.io-client';
import SimplePeer from 'simple-peer';

class WebRTCService {
    constructor() {
        this.socket = null;
        this.peer = null;
        this.localStream = null;
        this.remoteStream = null;
        this.roomId = null;
        this.isInterviewer = false;
        this.onCandidateJoined = null;
        this.onConnectionStateChange = null;
    }

    async initialize(roomId, isInterviewer) {
        this.roomId = roomId;
        this.isInterviewer = isInterviewer;

        const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';
        this.socket = io(socketUrl);

        // Set up socket listeners
        this.setupSocketListeners();

        try {
            // Get user media
            this.localStream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: true
            });

            // Join or create room based on role
            if (isInterviewer) {
                await this.createRoom();
            } else {
                await this.joinRoom();
            }

            return this.localStream;
        } catch (error) {
            console.error('Initialization error:', error);
            throw error;
        }
    }

    setupSocketListeners() {
        // Handle candidate joining (for interviewer)
        this.socket.on('candidate-joined', ({ candidateId }) => {
            console.log('Candidate joined:', candidateId);
            if (this.isInterviewer) {
                this.initiatePeerConnection();
                if (this.onCandidateJoined) {
                    this.onCandidateJoined(candidateId);
                }
            }
        });

        // Handle connection state changes
        this.socket.on('connection-state', (state) => {
            if (this.onConnectionStateChange) {
                this.onConnectionStateChange(state);
            }
        });

        // Handle offers
        this.socket.on('offer', async ({ offer }) => {
            try {
                if (!this.peer) {
                    this.peer = this.createPeer(false);
                }
                await this.peer.signal(offer);
            } catch (error) {
                console.error('Error handling offer:', error);
            }
        });

        // Handle answers
        this.socket.on('answer', async ({ answer }) => {
            try {
                if (this.peer) {
                    await this.peer.signal(answer);
                }
            } catch (error) {
                console.error('Error handling answer:', error);
            }
        });

        // Handle ICE candidates
        this.socket.on('ice-candidate', async ({ candidate }) => {
            try {
                if (this.peer) {
                    await this.peer.signal(candidate);
                }
            } catch (error) {
                console.error('Error handling ICE candidate:', error);
            }
        });

        // Handle disconnection
        this.socket.on('participant-disconnected', () => {
            if (this.peer) {
                this.peer.destroy();
                this.peer = null;
            }
            if (this.onParticipantDisconnected) {
                this.onParticipantDisconnected();
            }
        });
    }

    createPeer(initiator = false) {
        const peer = new SimplePeer({
            initiator,
            stream: this.localStream,
            trickle: true,
            config: {
                iceServers: [
                    { urls: 'stun:stun.l.google.com:19302' },
                    { urls: 'stun:stun1.l.google.com:19302' }
                ]
            }
        });

        peer.on('signal', data => {
            if (data.type === 'offer') {
                this.socket.emit('offer', data, this.roomId);
            } else if (data.type === 'answer') {
                this.socket.emit('answer', data, this.roomId);
            } else if (data.candidate) {
                this.socket.emit('ice-candidate', data, this.roomId);
            }
        });

        peer.on('stream', stream => {
            this.remoteStream = stream;
            if (this.onStreamChange) {
                this.onStreamChange(stream);
            }
        });

        peer.on('connect', () => {
            console.log('Peer connection established');
            if (this.onConnectionStateChange) {
                this.onConnectionStateChange('connected');
            }
        });

        return peer;
    }

    async createRoom() {
        return new Promise((resolve, reject) => {
            this.socket.emit('create-room', this.roomId, (response) => {
                if (response.success) {
                    resolve();
                } else {
                    reject(new Error(response.error));
                }
            });
        });
    }

    async joinRoom() {
        return new Promise((resolve, reject) => {
            this.socket.emit('join-room', this.roomId, (response) => {
                if (response.success) {
                    resolve();
                } else {
                    reject(new Error(response.error));
                }
            });
        });
    }
    async startScreenShare() {
        try {
            this.screenStream = await navigator.mediaDevices.getDisplayMedia({
                video: true
            });

            // Replace video track in peer connection
            const videoTrack = this.screenStream.getVideoTracks()[0];
            const sender = this.peer.getSenders().find(sender => sender.track.kind === 'video');

            if (sender) {
                sender.replaceTrack(videoTrack);
            }

            this.screenStream.getVideoTracks()[0].onended = () => {
                this.stopScreenShare();
            };

            console.log('Screen sharing started');
        } catch (error) {
            console.error('Error starting screen share:', error);
            throw error;
        }
    }

    // 🆕 Stop Screen Share
    async stopScreenShare() {
        if (this.screenStream) {
            const videoTrack = this.localStream.getVideoTracks()[0];
            const sender = this.peer.getSenders().find(sender => sender.track.kind === 'video');

            if (sender) {
                sender.replaceTrack(videoTrack);
            }

            this.screenStream.getTracks().forEach(track => track.stop());
            this.screenStream = null;

            console.log('Screen sharing stopped');
        }
    }

    // 🆕 Cleanup Method
    cleanup() {
        console.log('Cleaning up peer connection and streams');

        if (this.peer) {
            this.peer.destroy();
            this.peer = null;
        }

        if (this.localStream) {
            this.localStream.getTracks().forEach(track => track.stop());
            this.localStream = null;
        }

        if (this.screenStream) {
            this.screenStream.getTracks().forEach(track => track.stop());
            this.screenStream = null;
        }

        if (this.remoteStream) {
            this.remoteStream = null;
        }

        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }


    // ... previous methods (startScreenShare, stopScreenShare, cleanup)
}

export default new WebRTCService();