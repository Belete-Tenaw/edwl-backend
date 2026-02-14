const { Client } = require('pg');

async function test() {
    const client = new Client({
        user: 'postgres.seqeximptkufzdeoprxr',
        host: 'aws-1-eu-west-1.pooler.supabase.com',
        database: 'postgres',
        password: 'Twabel',
        port: 6543,
        ssl: { rejectUnauthorized: false }
    });

    try {
        console.log('Testing connection with suggested password: Twabel');
        await client.connect();
        console.log('✅ SUCCESS: Connected to database!');
        const res = await client.query('SELECT current_user, now()');
        console.log('RESULT:', res.rows[0]);
        await client.end();
    } catch (err) {
        console.error('❌ FAILURE:', err.message);
    }
}

test();
