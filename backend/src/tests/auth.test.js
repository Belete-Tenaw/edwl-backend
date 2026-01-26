const request = require('supertest');
const app = require('../server');
const prisma = require('../utils/prisma');

jest.mock('../utils/prisma', () => ({
    jobSeeker: {
        findFirst: jest.fn(),
        create: jest.fn(),
    },
    auditLog: {
        create: jest.fn()
    }
}));

describe('Auth Endpoints', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should register a new job seeker', async () => {
        prisma.jobSeeker.findFirst.mockResolvedValue(null);
        prisma.jobSeeker.create.mockResolvedValue({
            id: '123',
            fullName: 'Test User',
            email: 'test@example.com',
            role: 'JOB_SEEKER'
        });

        const res = await request(app)
            .post('/api/auth/register/seeker')
            .send({
                fullName: 'Test User',
                gender: 'MALE',
                age: 25,
                phone: '0911234567',
                email: 'test@example.com',
                password: 'password123',
                experienceYears: 2,
                expectedSalary: 5000,
                preferredLocation: 'Addis Ababa',
                preferredArrangement: 'LIVE_IN',
                maritalStatus: 'SINGLE'
            });

        expect(res.statusCode).toEqual(201);
        expect(res.body).toHaveProperty('token');
    });
});
