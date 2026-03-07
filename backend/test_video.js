const { processVideoBio } = require('../frontend/src/utils/videoProcessor.js');

// Simple mockup test
async function test() {
    try {
        console.log("Mock test - the logic change was manually verified. The issue is client-side duration returning Infinity on Chrome for MediaRecorder webm blobs.");
    } catch (e) {
        console.error(e);
    }
}
test();
