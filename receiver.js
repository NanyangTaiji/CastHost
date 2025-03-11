// Configure debug mode - set to true during development, false in production
const DEBUG = true;

// Debug logging helper
function log(message) {
    if (!DEBUG) return;

    console.log(message);
    const debugElement = document.getElementById('debug');
    if (debugElement) {
        debugElement.style.display = 'block';
        debugElement.innerHTML += message + '<br>';

        // Limit debug lines
        const lines = debugElement.innerHTML.split('<br>');
        if (lines.length > 20) {
            debugElement.innerHTML = lines.slice(lines.length - 20).join('<br>');
        }
    }
}

// Initialize Cast Receiver
const context = cast.framework.CastReceiverContext.getInstance();
const playerManager = context.getPlayerManager();

// Custom message namespace for AV Sync
const NAMESPACE = 'urn:x-cast:com.example.avsync';

// Create video and audio elements
        const videoElement = document.createElement('video');
videoElement.id = 'videoPlayer';
videoElement.style.width = '100%';
videoElement.style.height = '100%';
        document.body.appendChild(videoElement);

const audioElement = document.createElement('audio');
audioElement.id = 'audioPlayer';
        document.body.appendChild(audioElement);

// Track sync status
let syncActive = false;
let syncInterval = null;

// Handle incoming stream URLs
context.addCustomMessageListener(NAMESPACE, event => {
    log('Received message: ' + JSON.stringify(event.data));
    
    const {videoUrl, audioUrl} = event.data;

    if (videoUrl && audioUrl) {
        log('Loading video: ' + videoUrl);
        log('Loading audio: ' + audioUrl);

        // Stop existing sync if running
        disableSync();

        // Set sources
        videoElement.src = videoUrl;
        audioElement.src = audioUrl;

        // Prepare elements
        videoElement.load();
        audioElement.load();

        // Setup sync once media is loaded
        videoElement.oncanplay = () => {
                log('Video can play');
        if (audioElement.readyState >= 3) {
            enableSync();
        }
        };

        audioElement.oncanplay = () => {
                log('Audio can play');
        if (videoElement.readyState >= 3) {
            enableSync();
        }
        };

        // Start playing
        videoElement.play().catch(e => log('Video play error: ' + e.message));
    } else {
        log('Error: Missing video or audio URL');
    }
});

function enableSync() {
    if (syncActive) return;

    log('Enabling AV sync');
    syncActive = true;

    // Sync playback state
    videoElement.onplay = () => {
            log('Video play event');
    audioElement.play().catch(e => log('Audio play error: ' + e.message));
    };

    videoElement.onpause = () => {
            log('Video pause event');
    audioElement.pause();
    };

    // Sync seeking
    videoElement.onseeked = () => {
            log('Video seek event: ' + videoElement.currentTime);
    audioElement.currentTime = videoElement.currentTime;
    };

    // Handle buffering
    videoElement.onwaiting = () => {
            log('Video buffering');
    audioElement.pause();
    };

    videoElement.onplaying = () => {
            log('Video playing');
    audioElement.play().catch(e => log('Audio play error: ' + e.message));
    audioElement.currentTime = videoElement.currentTime;
    };

    // Monitor and correct drift
    syncInterval = setInterval(() => {
        const drift = Math.abs(videoElement.currentTime - audioElement.currentTime);
    if (drift > 0.1) { // More than 100ms drift
        log(`Correcting drift of ${drift.toFixed(3)}s`);
        audioElement.currentTime = videoElement.currentTime;
    }
    }, 1000);

    // Start playing both
    videoElement.play().catch(e => log('Video play error: ' + e.message));
}

function disableSync() {
    if (!syncActive) return;

    log('Disabling AV sync');
    syncActive = false;

    // Clear sync interval
    if (syncInterval) {
        clearInterval(syncInterval);
        syncInterval = null;
    }

    // Remove event listeners
    videoElement.onplay = null;
    videoElement.onpause = null;
    videoElement.onseeked = null;
    videoElement.onwaiting = null;
    videoElement.onplaying = null;

    // Stop playback
    videoElement.pause();
    audioElement.pause();

    // Reset sources
    videoElement.src = '';
    audioElement.src = '';
}

// Handle system events
context.addEventListener(cast.framework.system.EventType.SENDER_DISCONNECTED, () => {
log('Sender disconnected');
disableSync();
});

// Start receiver
log('Starting receiver');
context.start();