
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createTestData() {
  try {
    console.log('--- CREATING TEST DATA FOR MATCHING ---');
    
    // 1. Get or Create an employer
    let employer = await prisma.employer.findFirst();
    if (!employer) {
      console.log('No employer found. Creating a test one...');
      employer = await prisma.employer.create({
        data: {
          contactName: 'Test Employer',
          phone: '+251911111111',
          email: 'test@example.com',
          password: 'hashedpassword',
          address: 'Bole, Addis Ababa',
          employerType: 'HOUSEHOLD'
        }
      });
    }
    console.log(`Using Employer: ${employer.id}`);

    // 2. Create a job
    const job = await prisma.jobPost.create({
      data: {
        title: 'Elite Chef Needed',
        description: 'Looking for a high-quality chef for a private household.',
        requiredSkills: ['Cooking', 'Safety', 'English'],
        locationWoreda: 'Bole',
        locationRegion: 'Addis Ababa',
        address: 'Bole near Edna Mall',
        salaryOffered: 15000,
        jobType: 'Full-time',
        preferredArrangement: 'LIVE_IN',
        employer: { 
          connect: { 
             id: employer.id
          }
        }
      }
    });
    console.log(`Job Created: ${job.id}`);

    // 3. Create/Update Seekers
    console.log('Updating/Creating seekers...');
    const seekerData = [
      { 
        fullName: 'Fast Chef', 
        skills: ['Cooking', 'Cleaning'], 
        locationWoreda: 'Bole', 
        behaviorScore: 95, 
        rating: 4.8, 
        tier: 'FREE', 
        password: 'hashedpassword',
        phone: '+251911111111',
        age: 25,
        experienceYears: 5,
        expectedSalary: 12000,
        profilePhoto: 'none',
        idDocument: 'none',
        nationalIdFayda: 'none'
      },
      { 
        fullName: 'Slow Walker', 
        skills: ['Cooking'], 
        locationWoreda: 'Yeka', 
        behaviorScore: 60, 
        rating: 3.5, 
        tier: 'FREE',
        password: 'hashedpassword',
        phone: '+251922222222',
        age: 30,
        experienceYears: 2,
        expectedSalary: 8000,
        profilePhoto: 'none',
        idDocument: 'none',
        nationalIdFayda: 'none'
      },
      { 
        fullName: 'Elite Pro Chef', 
        skills: ['Cooking', 'Safety', 'English'], 
        locationWoreda: 'Bole', 
        behaviorScore: 98, 
        rating: 5.0, 
        tier: 'PLATINUM',
        password: 'hashedpassword',
        phone: '+251933333333',
        age: 35,
        experienceYears: 10,
        expectedSalary: 25000,
        profilePhoto: 'none',
        idDocument: 'none',
        nationalIdFayda: 'none'
      }
    ];

    for (const s of seekerData) {
      await prisma.jobSeeker.upsert({
        where: { phone: s.phone },
        update: {
          behaviorScore: s.behaviorScore,
          rating: s.rating,
          tier: s.tier,
          locationWoreda: s.locationWoreda,
          skills: s.skills
        },
        create: s
      });
    }
    console.log('Seekers synced.');

  } catch (err) {
    console.error('Error creating test data:', err);
  } finally {
    await prisma.$disconnect();
  }
}

createTestData();
