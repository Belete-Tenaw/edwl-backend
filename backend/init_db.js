const { Client } = require('pg');

async function initDb() {
    const client = new Client({
        user: 'postgres',
        host: 'localhost',
        database: 'postgres',
        password: 'admin123',
        port: 5432,
    });

    try {
        await client.connect();
        console.log('Connected to PostgreSQL as "postgres" user.');

        const res = await client.query("SELECT 1 FROM pg_database WHERE datname='edwl_db'");
        if (res.rowCount === 0) {
            await client.query('CREATE DATABASE edwl_db');
            console.log('Database "edwl_db" created successfully.');
        } else {
            console.log('Database "edwl_db" already exists.');
        }
        await client.end();
    } catch (err) {
        console.error('Error initializing database:', err.message);
    }
}

initDb();
