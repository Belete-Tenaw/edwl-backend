/**
 * Video Processing Utility for zero-cost architecture.
 * Limits duration to 20 minutes and file size to 200MB.
 */

export const processVideoBio = async (file) => {
    return new Promise((resolve, reject) => {
        if (!file.type.startsWith('video/')) {
            return reject(new Error('Selected file is not a video.'));
        }

        const MAX_SIZE = 200 * 1024 * 1024; // 200MB
        const MAX_DURATION = 1200; // 20 minutes (1200 seconds)

        // 1. Initial Size Check (Quick fail for massive files)
        if (file.size > 200 * 1024 * 1024) { // Hard cap before duration check
            return reject(new Error('Video is too large. Max size for upload is 200MB. Please choose a smaller file.'));
        }

        const video = document.createElement('video');
        video.preload = 'metadata';

        video.onloadedmetadata = () => {
            window.URL.revokeObjectURL(video.src);
            let duration = video.duration;

            // Chrome webm recording bug: duration is Infinity
            if (duration === Infinity) {
                // Fallback for blob recordings without metadata
                duration = MAX_DURATION; 
            }

            if (duration > MAX_DURATION) {
                return reject(new Error(`Video bio must be 20 minutes or shorter. Your video is ${Math.round(duration)}s.`));
            }

            // 2. Final Size Check
            if (file.size > MAX_SIZE) {
                return reject(new Error(`Video file size (${(file.size / (1024 * 1024)).toFixed(1)}MB) exceeds 200MB limit. Please try recording at a lower resolution.`));
            }

            resolve({
                file,
                duration,
                isValid: true
            });
        };

        video.onerror = () => {
            URL.revokeObjectURL(video.src); // Clean up on error path too
            reject(new Error('Failed to load video metadata. The file might be corrupted or in an unsupported format.'));
        };

        video.src = URL.createObjectURL(file);
    });
};

/**
 * Helper to check if a browser supports recording.
 */
export const checkRecordingSupport = () => {
    return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
};
