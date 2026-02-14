const { Client } = require('pg');
// URL Encoded password: Bel@#$%2025 -> Bel%40%23%24%252025
const password = encodeURIComponent("Bel@#$%2025");
const connectionString = `postgresql://postgres.seqeximptkufzdeoprxr:${password}@aws-1-eu-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true`;

async function test() {
    console.log('Testing with password:', "Bel@#$%2025");
    console.log('Encoded password segment:', password);

    const client = new Client({ connectionString });
    try {
        await client.connect();
        console.log('✅ SUCCESS: Connected to database!');
        const res = await client.query('SELECT current_user, now()');
        console.log('QUERY RESULT:', res.rows[0]);
        await client.end();
    } catch (err) {
        console.error('❌ FAILURE: Could not connect to database');
        console.error('Error details:', err.message);
    }
}

test();
