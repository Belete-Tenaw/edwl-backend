const { Client } = require('pg');

async function testPassword(password, user) {
    const encodedPassword = encodeURIComponent(password);
    const connectionString = `postgresql://${user}:${encodedPassword}@aws-1-eu-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true`;

    console.log(`Testing: User=${user}, Password=${password}`);
    const client = new Client({ connectionString });
    try {
        await client.connect();
        console.log('✅ SUCCESS!');
        await client.end();
        return true;
    } catch (err) {
        console.log('❌ FAIL:', err.message);
        return false;
    }
}

async function run() {
    const pass = "Bel@#$%2025";
    const projectRef = "seqeximptkufzdeoprxr";

    await testPassword(pass, `postgres.${projectRef}`);
    await testPassword(pass, "postgres");

    // Try without symbols just in case
    await testPassword("Bel2025", `postgres.${projectRef}`);

    // Try with just @
    await testPassword("Bel@2025", `postgres.${projectRef}`);
}

run();
