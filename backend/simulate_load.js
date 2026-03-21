const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function simulateLoad() {
    console.log("🚀 Starting Stress Test Simulation...");

    try {
        // 1. Check current Seeker count
        const seekerCount = await prisma.jobSeeker.count();
        console.log(`📊 Current JobSeekers in DB: ${seekerCount}`);

        // 2. Measure Matching Performance
        console.log("⏱️ Measuring Matching Algorithm Performance...");
        const job = await prisma.jobPost.findFirst();
        if (!job) {
            console.log("⚠️ No job post found to test matching. Skipping.");
        } else {
            const start = Date.now();
            const matches = await prisma.$queryRaw`SELECT * FROM match_seekers_for_job(${job.id}::UUID)`;
            const duration = Date.now() - start;
            console.log(`✅ Matching for 1 job across ${seekerCount} seekers took: ${duration}ms`);
            console.log(`🎯 Matches found: ${matches.length}`);

            if (duration < 200) {
                console.log("💎 PERFORMANCE: IDEAL (< 200ms)");
            } else if (duration < 500) {
                console.log("⚠️ PERFORMANCE: ACCEPTABLE (< 500ms)");
            } else {
                console.log("🛑 PERFORMANCE: BOTTLENECK (> 500ms)");
            }
        }

        // 3. Measure Message Retrieval Performance
        console.log("⏱️ Measuring Message Retrieval Performance...");
        const mStart = Date.now();
        const messageCount = await prisma.message.count();
        const mDuration = Date.now() - mStart;
        console.log(`✅ Message count (${messageCount} total) took: ${mDuration}ms`);

    } catch (error) {
        console.error("❌ Simulation Failed:", error);
    } finally {
        await prisma.$disconnect();
    }
}

simulateLoad();
