const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

async function testRegistration() {
    console.log("Starting Registration Simulation...");
    const formData = new FormData();

    // Mock Seeker Data
    formData.append('fullName', 'Simulated Seeker');
    formData.append('gender', 'FEMALE');
    formData.append('age', '25');
    formData.append('maritalStatus', 'SINGLE');
    formData.append('phone', '09' + Math.floor(Math.random() * 100000000));
    formData.append('email', `sim_${Date.now()}@example.com`);
    formData.append('password', 'securePassword123');
    formData.append('bio', 'I am a simulated worker');
    formData.append('skills', JSON.stringify(['Cleaning', 'Cooking']));
    formData.append('languages', JSON.stringify(['Amharic', 'English']));
    formData.append('experienceYears', '2');
    formData.append('expectedSalary', '2500');
    formData.append('preferredLocation', 'Addis Ababa');
    formData.append('preferredArrangement', 'LIVE_IN');

    // Create dummy files if they don't exist
    const dummyPhoto = path.join(__dirname, 'dummy_photo.png');
    const dummyId = path.join(__dirname, 'dummy_id.png');
    fs.writeFileSync(dummyPhoto, 'fake image data');
    fs.writeFileSync(dummyId, 'fake id data');

    formData.append('profilePhoto', fs.createReadStream(dummyPhoto));
    formData.append('idDocument', fs.createReadStream(dummyId));

    try {
        const response = await axios.post('http://localhost:5000/api/auth/seeker/register', formData, {
            headers: formData.getHeaders()
        });
        console.log("✅ Registration Successful:", response.data);
    } catch (error) {
        console.error("❌ Registration Failed!");
        if (error.response) {
            console.error("Status:", error.response.status);
            console.error("Data:", JSON.stringify(error.response.data, null, 2));
        } else {
            console.error("Error Message:", error.message);
        }
    } finally {
        // Cleanup dummy files
        if (fs.existsSync(dummyPhoto)) fs.unlinkSync(dummyPhoto);
        if (fs.existsSync(dummyId)) fs.unlinkSync(dummyId);
    }
}

testRegistration();
