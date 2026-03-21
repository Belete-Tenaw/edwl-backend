const axios = require('axios');
const API_URL = 'http://localhost:5000/api'; // Adjust if needed

async function runTests() {
    console.log('--- Starting Backend Verification ---');

    try {
        // 1. Check duplicate check endpoint
        console.log('\n[Test 1] Testing /check-duplicate...');
        const dupCheck = await axios.get(`${API_URL}/auth/check-duplicate?identifier=test@example.com&role=seeker`);
        console.log('Response:', dupCheck.data);

        // 2. Test Forgot Password (send reset code)
        // Note: This requires a user to exist in the DB.
        console.log('\n[Test 2] Testing /forgot-password...');
        try {
            const forgotResp = await axios.post(`${API_URL}/auth/forgot-password`, { identifier: 'test@example.com' });
            console.log('Response:', forgotResp.data);
        } catch (e) {
            console.log('Expected failure if user doesn\'t exist:', e.response?.data || e.message);
        }

        console.log('\n--- Verification Script Completed ---');
    } catch (error) {
        console.error('Verification failed:', error.message);
    }
}

runTests();
