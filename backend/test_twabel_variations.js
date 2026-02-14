const { Client } = require('pg');

async function testPassword(password) {
    const client = new Client({
        user: 'postgres.seqeximptkufzdeoprxr',
        host: 'aws-1-eu-west-1.pooler.supabase.com',
        database: 'postgres',
        password: password,
        port: 6543,
        ssl: { rejectUnauthorized: false }
    });

    try {
        console.log(`Testing: ${password}`);
        await client.connect();
        console.log(`✅ SUCCESS: ${password} works!`);
        await client.end();
        return true;
    } catch (err) {
        console.log(`❌ FAIL: ${password} - ${err.message}`);
        return false;
    }
}

async function run() {
    await testPassword('twabel');
    await testPassword('Twabel2025');
    await testPassword('twabel2025');
}

run();
