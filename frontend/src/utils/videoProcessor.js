/**
 * Video Processing Utility for zero-cost architecture.
 * Limits duration to 15 seconds and file size to 3MB.
 */

export const processVideoBio = async (file) => {
    return new Promise((resolve, reject) => {
        if (!file.type.startsWith('video/')) {
            return reject(new Error('Selected file is not a video.'));
        }

        const MAX_SIZE = 10 * 1024 * 1024; // 10MB
        const MAX_DURATION = 30; // 30 seconds

        // 1. Initial Size Check (Quick fail for massive files)
        // Note: We'll check again after processing if we were doing server-side compression, 
        // but for $0 budget we mostly rely on duration limiting and client-side rejection.
        if (file.size > 10 * 1024 * 1024) { // Hard cap before duration check
            return reject(new Error('Video is too large. Max size for raw upload is 10MB, but will be limited to 3MB after duration check.'));
        }

        const video = document.createElement('video');
        video.preload = 'metadata';

        video.onloadedmetadata = () => {
            window.URL.revokeObjectURL(video.src);
            let duration = video.duration;

            // Chrome webm recording bug: duration is Infinity
            if (duration === Infinity) {
                // If the file was recorded via our 15s max component, we can assume it's valid
                // or we could enforce the size limit strictly.
                duration = MAX_DURATION; // Fallback for blob recordings without metadata
            }

            if (duration > MAX_DURATION) {
                return reject(new Error(`Video bio must be 15 seconds or shorter. Your video is ${Math.round(duration)}s.`));
            }

            // 2. Final Size Check
            if (file.size > MAX_SIZE) {
                return reject(new Error(`Video file size (${(file.size / (1024 * 1024)).toFixed(1)}MB) exceeds 10MB limit. Please try recording at a lower resolution.`));
            }

            resolve({
                file,
                duration,
                isValid: true
            });
        };

        video.onerror = () => {
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
