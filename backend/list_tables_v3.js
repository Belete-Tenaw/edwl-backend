const { Client } = require('pg');
require('dotenv').config();

async function listTables() {
  const client = new Client({
    connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL
  });

  try {
    await client.connect();
    console.log('Connected to database.');
    
    const res = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);

    console.log('Tables found:');
    res.rows.forEach(row => console.log(`- ${row.table_name}`));
    
    if (res.rows.length === 0) {
      console.log('No tables found in public schema.');
    }

  } catch (err) {
    console.error('Error connecting to database:', err.message);
  } finally {
    await client.end();
  }
}

listTables();
