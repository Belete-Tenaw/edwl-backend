const prisma = require('./src/utils/prisma');
const academyController = require('./src/controllers/academyController');

async function testAcademyFlow() {
    console.log('--- Starting Academy Flow Test ---');

    let jobSeeker = await prisma.jobSeeker.findFirst();

    if (!jobSeeker) {
        console.error('No jobSeeker found in DB. Run seeds first.');
        process.exit(1);
    }

    // 1. Create a mock training module
    let module = await prisma.trainingModule.findFirst({ where: { title: 'First Aid Basic' } });
    if (!module) {
        module = await prisma.trainingModule.create({
            data: {
                title: 'First Aid Basic',
                description: 'Learn basic first aid to handle emergencies.',
                category: 'Health & Safety',
                points: 100
            }
        });
        console.log('Created training module:', module.id);
    }

    try {
        console.log(`\nStep 1: Completing Module for Worker (${jobSeeker.fullName})...`);
        
        let completedCert;
        const mockReq = {
            user: { id: jobSeeker.id, role: 'JOB_SEEKER' },
            body: { moduleId: module.id, score: 90 }
        };
        const mockRes = {
            status: (code) => ({
                json: (data) => {
                    console.log(`Response Code: ${code}`);
                    if (data.message) console.log('Message:', data.message);
                    if (data.cert) {
                        completedCert = data.cert;
                    } else if (data.error || !data.message.includes('success')) {
                        console.error('Error:', data);
                    }
                }
            })
        };

        await academyController.completeModule(mockReq, mockRes);

        if (!completedCert) {
            throw new Error('Module completion failed');
        }

        console.log('\nStep 2: Verifying JobSeeker Profile Updates...');
        const updatedJobSeeker = await prisma.jobSeeker.findUnique({ where: { id: jobSeeker.id } });
        
        console.log('Reward Points:', updatedJobSeeker.rewardPoints);
        console.log('Certificates:', updatedJobSeeker.certificates);

        if (!updatedJobSeeker.certificates.includes('First Aid Basic Certified')) {
            throw new Error('Certificate was not appended to the worker profile');
        }

        console.log('\n✅ End-to-End Academy Flow Success!');
    } catch (err) {
        console.error('\n❌ Test Failed:', err.message);
    } finally {
        process.exit();
    }
}

testAcademyFlow();
