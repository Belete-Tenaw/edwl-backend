const { Client } = require('pg');

async function listTables() {
    const client = new Client({
        connectionString: 'postgresql://postgres.seqeximptkufzdeoprxr:EdwlBackend291965@aws-1-eu-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true',
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        console.log('Connected to database. Fetching tables...');
        const res = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);

        if (res.rows.length === 0) {
            console.log('No tables found in public schema.');
        } else {
            console.log('Tables found:');
            res.rows.forEach(row => console.log(` - ${row.table_name}`));
        }

        await client.end();
    } catch (err) {
        console.error('Error:', err.message);
    }
}

listTables();
