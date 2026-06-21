const axios = require('axios');

async function testLogin() {
    const url = 'https://edwl-backend.onrender.com/api/auth/admin/login';
    const credentials = {
        username: 'EDWL2026',
        password: process.env.TEST_ADMIN_PASSWORD || 'REPLACE_WITH_PASSWORD'
    };

    console.log(`Attempting login at: ${url}`);
    try {
        const response = await axios.post(url, credentials);
        console.log('✅ Login Successful!');
        console.log('Response:', JSON.stringify(response.data, null, 2));
    } catch (error) {
        console.log('❌ Login Failed!');
        if (error.response) {
            console.log(`Status: ${error.response.status}`);
            console.log('Data:', JSON.stringify(error.response.data, null, 2));
        } else {
            console.log('Error Message:', error.message);
        }
    }
}

testLogin();
