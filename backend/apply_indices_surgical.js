const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function applyIndices() {
  const client = new Client({
    connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL
  });

  try {
    await client.connect();
    console.log('Connected to Supabase.');

    const sqlPath = path.join(__dirname, 'prisma', 'apply_indices.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log('Executing indices SQL...');
    await client.query(sql);
    console.log('Indices applied successfully!');

  } catch (err) {
    console.error('Error applying indices:', err.message);
  } finally {
    await client.end();
  }
}

applyIndices();
