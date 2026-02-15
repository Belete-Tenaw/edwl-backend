const { Client } = require('pg');

async function testDirect() {
    const client = new Client({
        connectionString: 'postgresql://postgres.seqeximptkufzdeoprxr:EdwlBackend291965@aws-1-eu-west-1.pooler.supabase.com:5432/postgres',
        ssl: { rejectUnauthorized: false }
    });

    try {
        console.log('Testing direct connection (port 5432)...');
        await client.connect();
        console.log('✅ SUCCESS: Direct connection established!');
        await client.end();
    } catch (err) {
        console.error('❌ FAILURE:', err.message);
    }
}

testDirect();
