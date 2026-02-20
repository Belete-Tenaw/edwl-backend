const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

async function applySql() {
    const client = new Client({
        connectionString: 'postgresql://postgres.seqeximptkufzdeoprxr:EdwlBackend291965@aws-1-eu-west-1.pooler.supabase.com:5432/postgres',
        ssl: { rejectUnauthorized: false }
    });

    try {
        console.log('Connecting to Supabase...');
        await client.connect();
        console.log('✅ Connected!');

        const sqlPath = path.join(__dirname, 'prisma', 'edwl_supabase_setup.sql');
        console.log(`Reading SQL from ${sqlPath}...`);
        const sql = fs.readFileSync(sqlPath, 'utf8');

        console.log('Executing SQL...');
        await client.query(sql);
        console.log('✅ SQL applied successfully!');

        await client.end();
    } catch (err) {
        console.error('❌ FAILURE:', err.message);
        process.exit(1);
    }
}

applySql();
