const { mockDeep, mockReset } = require('jest-mock-extended');
const prisma = require('../utils/prisma');

jest.mock('../utils/prisma', () => ({
    __esModule: true,
    default: mockDeep(),
}));

beforeEach(() => {
    mockReset(prismaMock);
});

const prismaMock = prisma;
module.exports = { prismaMock };
