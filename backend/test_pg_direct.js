const { Client } = require('pg');
require('dotenv').config({ path: './backend/.env' });

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    console.error('DATABASE_URL not found in .env');
    process.exit(1);
}

console.log('Testing connection to:', connectionString.replace(/:[^:]+@/, ':****@'));

const client = new Client({
    connectionString: connectionString,
});

client.connect()
    .then(() => {
        console.log('Successfully connected to Supabase!');
        return client.query('SELECT NOW()');
    })
    .then(res => {
        console.log('Database time:', res.rows[0]);
        return client.end();
    })
    .catch(err => {
        console.error('Connection error:', err.stack);
        process.exit(1);
    });
