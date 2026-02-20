const { Client } = require('pg');

async function testDirectHost() {
    const client = new Client({
        connectionString: 'postgresql://postgres:EdwlBackend291965@db.seqeximptkufzdeoprxr.supabase.co:5432/postgres',
        ssl: { rejectUnauthorized: false }
    });

    try {
        console.log('Testing direct host connection...');
        await client.connect();
        console.log('✅ SUCCESS: Direct host connection established!');
        await client.end();
    } catch (err) {
        console.error('❌ FAILURE:', err.message);
    }
}

testDirectHost();
