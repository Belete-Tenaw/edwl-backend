
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testMatch() {
  try {
    console.log('--- TESTING SMART MATCH SQL FUNCTION ---');
    
    // 1. Find a test job
    const job = await prisma.jobPost.findFirst();
    if (!job) {
      console.log('No job found to test matching. Please create one.');
      return;
    }
    
    console.log(`Testing with Job: ${job.title} (ID: ${job.id})`);
    console.log(`Preferred Woreda: ${job.locationWoreda}`);
    console.log(`Required Skills: ${job.requiredSkills}`);

    // 2. Call the match function
    const matches = await prisma.$queryRawUnsafe(
      `SELECT * FROM match_seekers_for_job('${job.id}'::uuid) LIMIT 5`
    );

    console.log(`\nFound ${matches.length} matches:`);
    matches.forEach((m, i) => {
      console.log(`${i+1}. ${m.fullName} | Match: ${m.match_score}%`);
      console.log(`   - Behavior: ${m.behaviorScore} | Woreda: ${m.locationWoreda}`);
      console.log(`   - Rating: ${m.rating} | Tier: ${m.tier}`);
      console.log(`   - Skills Match: ${m.skills_match_count}`);
    });

  } catch (err) {
    console.error('Error during match test:', err);
  } finally {
    await prisma.$disconnect();
  }
}

testMatch();
