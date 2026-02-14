const { Client } = require('pg');
const connectionString = "postgresql://postgres.seqeximptkufzdeoprxr:admin123@aws-1-eu-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true";

async function test() {
    const client = new Client({ connectionString });
    try {
        await client.connect();
        console.log('SUCCESS: Connected to database');
        const res = await client.query('SELECT 1');
        console.log('QUERY RESULT:', res.rows[0]);
        await client.end();
    } catch (err) {
        console.error('FAILURE: Could not connect to database');
        console.error(err.message);
    }
}

test();
