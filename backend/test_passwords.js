const { Client } = require('pg');
const passwords = ['admin123', 'password', 'postgres', 'root', '123456'];

async function testConnection() {
    for (const pw of passwords) {
        const client = new Client({
            user: 'postgres',
            host: '127.0.0.1',
            database: 'postgres',
            password: pw,
            port: 5432,
        });
        try {
            await client.connect();
            console.log('SUCCESS: Password is', pw);
            await client.end();
            return pw;
        } catch (err) {
            console.log('FAILED: Password', pw, 'Error:', err.message);
        }
    }
}

testConnection();
