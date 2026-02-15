const { Client } = require('pg');

async function listTables() {
    const client = new Client({
        connectionString: 'postgresql://postgres.seqeximptkufzdeoprxr:EdwlBackend291965@aws-1-eu-west-1.pooler.supabase.com:5432/postgres',
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        const res = await client.query(`
      SELECT table_name, table_schema 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);

        console.log('EXACT TABLE NAMES:');
        res.rows.forEach(r => console.log(` - "${r.table_name}"`));

        await client.end();
    } catch (err) {
        console.error('Error:', err.message);
    }
}

listTables();
