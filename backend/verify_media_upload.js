const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const API_URL = 'http://localhost:5000/api/auth/seeker/register';

async function verifyRegistrationFiles() {
    console.log("🚀 Starting Backend Media Upload Verification...");

    const form = new FormData();
    
    // Core details
    form.append('fullName', 'Media Test Seeker');
    form.append('phone', '+251911999999');
    form.append('email', `test_media_${Date.now()}@example.com`);
    form.append('password', 'password123');
    form.append('gender', 'FEMALE');
    form.append('age', '25');
    form.append('maritalStatus', 'SINGLE');
    form.append('experienceYears', '2');
    form.append('expectedSalary', '5000');
    form.append('preferredLocation', 'Addis Ababa');
    form.append('skills', JSON.stringify(['Cleaning', 'Cooking']));
    form.append('languages', JSON.stringify(['Amharic', 'English']));

    // 1. Mock Profile Photo (Small Image)
    // We'll create a tiny buffer or use a small file if available
    const smallImage = Buffer.from('mock image data'); 
    form.append('profilePhoto', smallImage, {
        filename: 'profile.jpg',
        contentType: 'image/jpeg',
    });

    // 2. Mock ID Document (PDF or Image)
    const idDoc = Buffer.from('mock id data');
    form.append('idDocument', idDoc, {
        filename: 'id.pdf',
        contentType: 'application/pdf',
    });

    // 3. Mock Video Bio (This is the critical one)
    // We'll use a slightly larger buffer but well within 15MB
    // Using a webm type with codecs to test our backend fix
    const videoData = Buffer.alloc(1024 * 1024); // 1MB mock video
    form.append('videoBio', videoData, {
        filename: 'video_bio.webm',
        contentType: 'video/webm',
    });

    try {
        const response = await axios.post(API_URL, form, {
            headers: {
                ...form.getHeaders(),
            },
        });

        console.log("✅ Registration Successful!");
        console.log("Response:", response.data);
        return true;
    } catch (error) {
        console.error("❌ Registration Failed!");
        if (error.response) {
            console.error("Status:", error.response.status);
            console.error("Data:", error.response.data);
        } else {
            console.error("Message:", error.message);
        }
        return false;
    }
}

verifyRegistrationFiles();
