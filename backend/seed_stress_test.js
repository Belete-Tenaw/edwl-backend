const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { v4: uuidv4 } = require('uuid');

async function seedStressTest() {
    console.log("🌱 Seeding test data for stress test...");

    try {
        // 1. Create a test Employer if none exists
        let employer = await prisma.employer.findFirst();
        if (!employer) {
            employer = await prisma.employer.create({
                data: {
                    id: uuidv4(),
                    employerType: 'HOUSEHOLD',
                    contactName: 'Test Employer',
                    email: `test_emp_stress_${Date.now()}@example.com`,
                    password: 'hashed_password',
                    address: 'Addis Ababa',
                    tier: 'PLATINUM_ACCESS',
                    isActive: true,
                    subscriptionExpiry: new Date(Date.now() + 30 * 86400000)
                }
            });
            console.log("✅ Created test employer.");
        }

        // 2. Create 10 Job Posts
        console.log("📝 Creating 10 job posts...");
        const roles = ['Housemaid', 'Nanny', 'Cook', 'Driver', 'Gardener'];
        for (let i = 0; i < 10; i++) {
            await prisma.jobPost.create({
                data: {
                    title: `${roles[i % 5]} Needed`,
                    description: 'Generic job description for stress testing.',
                    requiredSkills: ['Cleaning', 'Cooking'],
                    salaryOffered: 5000 + i * 500,
                    jobType: 'Full-time',
                    preferredArrangement: 'LIVE_IN',
                    address: 'Bole, Addis Ababa',
                    employerId: employer.id
                }
            });
        }

        // 3. Create 100 Job Seekers in batches
        console.log("👥 Creating 100 job seekers...");
        const seekersData = [];
        for (let i = 0; i < 100; i++) {
            seekersData.push({
                fullName: `Worker ${i}`,
                gender: i % 2 === 0 ? 'FEMALE' : 'MALE',
                age: 20 + (i % 20),
                maritalStatus: 'SINGLE',
                email: `worker_stress_${i}_${Date.now()}@example.com`,
                password: 'hashed_password',
                skills: ['Cleaning', 'Cooking'],
                experienceYears: i % 5,
                expectedSalary: 4000 + i * 10,
                preferredLocation: 'Addis Ababa',
                preferredArrangement: 'LIVE_IN',
                profilePhoto: '/uploads/default-photo.jpg',
                tier: i % 10 === 0 ? 'PLATINUM' : (i % 5 === 0 ? 'GOLD' : 'BRONZE'),
                isActive: true,
                nationalIdUrl: i % 3 === 0 ? '/uploads/test-id.jpg' : null,
                policeClearanceUrl: i % 5 === 0 ? '/uploads/test-police.jpg' : null
            });
        }

        await prisma.jobSeeker.createMany({ data: seekersData });
        console.log("✅ Successfully seeded 100 seekers and 10 jobs.");

    } catch (error) {
        console.error("❌ Seeding Failed:", error);
    } finally {
        await prisma.$disconnect();
    }
}

seedStressTest();
