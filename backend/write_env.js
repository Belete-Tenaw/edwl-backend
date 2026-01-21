const fs = require('fs');
const content = 'DATABASE_URL="postgresql://postgres:admin123@localhost:5432/edwl_db?schema=public"\n' +
    'JWT_SECRET="super_secret_key_123"\n' +
    'PORT=5000\n' +
    'NODE_ENV=development\n';
fs.writeFileSync('.env', content, { encoding: 'utf8' });
console.log('.env file written successfully');
