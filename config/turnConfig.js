const turnConfig = {
    iceServers: [
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun2.l.google.com:19302' },
        {
            urls: process.env.TURN_SERVER_URL,
            username: process.env.TURN_USERNAME,
            credential: process.env.TURN_CREDENTIAL
        },
        {
            urls: process.env.BACKUP_TURN_SERVER_URL,
            username: process.env.BACKUP_TURN_USERNAME,
            credential: process.env.BACKUP_TURN_CREDENTIAL
        }
    ],
    iceTransportPolicy: 'relay',
    iceCandidatePoolSize: 20,
    bundlePolicy: 'max-bundle',
    rtcpMuxPolicy: 'require',
    mediaConstraints: {
        video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            frameRate: { ideal: 30 }
        },
        audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true
        }
    },
    screenShareConstraints: {
        video: {
            cursor: 'motion',
            displaySurface: 'monitor',
            frameRate: { ideal: 30, max: 60 }
        }
    }
};

module.exports = { turnConfig };

