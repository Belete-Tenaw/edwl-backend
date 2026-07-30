const axios = require('axios');

async function testLiveLogin() {
    try {
        const response = await axios.post('https://edwl-backend.onrender.com/api/auth/login', {
            username_or_email: 'EDWL2026',
            password: 'TdwBel291965',
            role: 'ADMIN'
        });
        console.log("LOGIN SUCCESSFUL:");
        console.log(response.data);
    } catch (error) {
        console.log("LOGIN FAILED:");
        if (error.response) {
            console.log("Status:", error.response.status);
            console.log("Data:", error.response.data);
        } else {
            console.log(error.message);
        }
    }
}

testLiveLogin();
