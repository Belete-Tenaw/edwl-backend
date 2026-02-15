const { Client } = require('pg');

async function listTables() {
    const client = new Client({
        connectionString: 'postgresql://postgres.seqeximptkufzdeoprxr:EdwlBackend291965@aws-1-eu-west-1.pooler.supabase.com:5432/postgres',
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        const res = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);

        const tables = res.rows.map(r => r.table_name);
        console.log(`TOTAL TABLES: ${tables.length}`);
        console.log(`LIST: ${tables.join(', ')}`);

        await client.end();
    } catch (err) {
        console.error('Error:', err.message);
    }
}

listTables();
