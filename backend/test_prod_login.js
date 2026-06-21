const axios = require('axios');

async function testLogin() {
    try {
        console.log('Testing login against production API...');
        const response = await axios.post('https://edwl-backend.onrender.com/api/auth/admin/login', {
            username: process.env.TEST_ADMIN_USER || 'REPLACE_WITH_USERNAME',
            password: process.env.TEST_ADMIN_PASSWORD || 'REPLACE_WITH_PASSWORD'
        });

        console.log('Login successful:');
        console.log('Status:', response.status);
    } catch (error) {
        console.error('Login failed with status:', error.response?.status);
        console.error('Response data:', error.response?.data);
    }
}

testLogin();
