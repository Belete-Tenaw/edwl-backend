const axios = require('axios');

async function testLogin() {
    try {
        console.log('Testing login against production API...');
        const response = await axios.post('https://edwl-backend.onrender.com/api/auth/admin/login', {
            username: 'EDWL2026',
            password: 'TwaBel2026'
        });

        console.log('Login successful:');
        console.log('Status:', response.status);
    } catch (error) {
        console.error('Login failed with status:', error.response?.status);
        console.error('Response data:', error.response?.data);
    }
}

testLogin();
