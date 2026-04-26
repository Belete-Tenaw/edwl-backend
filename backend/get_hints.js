const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
p.employer.findMany({ take: 5, select: { email: true, contactName: true, passwordHint: true } })
  .then(r => { console.log(JSON.stringify(r, null, 2)); return p.$disconnect(); });
