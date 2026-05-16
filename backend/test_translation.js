const prisma = require('./src/utils/prisma');
const messageController = require('./src/controllers/messageController');

async function testTranslationFlow() {
    console.log('--- Starting Real-Time Translation Test ---');

    let employer = await prisma.employer.findFirst();
    let jobSeeker = await prisma.jobSeeker.findFirst();

    if (!employer || !jobSeeker) {
        console.error('No users found in DB.');
        process.exit(1);
    }

    await prisma.employer.update({
        where: { id: employer.id },
        data: { subscriptionExpiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) }
    });

    console.log(`Sending message from Employer (${employer.contactName}) to JobSeeker (${jobSeeker.fullName})...`);

    const mockReq = {
        user: { id: employer.id, role: 'EMPLOYER' },
        body: {
            receiverId: jobSeeker.id,
            receiverType: 'JOB_SEEKER',
            content: 'Hello, can you start working tomorrow morning?',
            targetLang: 'am'
        },
        app: {
            get: () => null // Mocking socket.io
        }
    };

    const mockRes = {
        status: (code) => ({
            json: (data) => {
                console.log(`\nResponse Code: ${code}`);
                if (data.error) {
                    console.error('Error:', data.error);
                } else {
                    console.log('Original Text:', data.content);
                    console.log('Translated Text:', data.translatedText);
                    console.log('Detected Language:', data.detectedLanguage);
                    
                    if (data.translatedText.includes('[AM]')) {
                        console.log('✅ Translation Mock successful!');
                    }
                }
            }
        })
    };

    await messageController.sendMessage(mockReq, mockRes);
    process.exit();
}

testTranslationFlow();
