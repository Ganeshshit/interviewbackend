const turnConfig = {
    iceServers: [
        // STUN servers
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun2.l.google.com:19302' },
        
        // Primary TURN server
        {
            urls: process.env.TURN_SERVER_URL || 'turn:your-turn-server.com',
            username: process.env.TURN_USERNAME || 'your-username',
            credential: process.env.TURN_CREDENTIAL || 'your-credential'
        },
        
        // Backup TURN servers
        {
            urls: process.env.BACKUP_TURN_SERVER_URL,
            username: process.env.BACKUP_TURN_USERNAME,
            credential: process.env.BACKUP_TURN_CREDENTIAL
        }
    ],
    iceTransportPolicy: process.env.NODE_ENV === 'production' ? 'relay' : 'all',
    bundlePolicy: 'max-bundle',
    rtcpMuxPolicy: 'require',
    iceConnectionTimeoutInSeconds: 30,
    iceCandidatePoolSize: 15,
    
    // Additional media constraints
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
    
    // Screen sharing constraints
    screenShareConstraints: {
        video: {
            cursor: 'always',
            displaySurface: 'monitor',
            logicalSurface: true,
            width: { ideal: 1920 },
            height: { ideal: 1080 },
            frameRate: { max: 30 }
        }
    }
};

// Add connection quality thresholds
const connectionQualityThresholds = {
    excellent: {
        rtt: 100,      // Round trip time in ms
        packetLoss: 1, // Packet loss percentage
        bandwidth: 2000 // Required bandwidth in kbps
    },
    good: {
        rtt: 200,
        packetLoss: 3,
        bandwidth: 1000
    },
    poor: {
        rtt: 300,
        packetLoss: 5,
        bandwidth: 500
    }
};

module.exports = {
    turnConfig,
    connectionQualityThresholds
};
