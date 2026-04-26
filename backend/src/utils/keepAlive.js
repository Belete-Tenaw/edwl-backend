const axios = require('axios');

/**
 * Pings the server at a regular interval to keep it alive.
 * @param {string} url - The URL to ping.
 * @param {number} intervalMs - Interval in milliseconds (default: 14 minutes for Render).
 */
const keepAlive = (url, intervalMs = 14 * 60 * 1000) => {
    if (!url) {
        console.warn('Keep-alive URL not provided. Skipping...');
        return;
    }

    

    setInterval(async () => {
        try {
            const res = await axios.get(url);
// pinged
        } catch (err) {
            console.error(`Keep-alive ping failed: ${err.message}`);
        }
    }, intervalMs);
};

module.exports = keepAlive;

