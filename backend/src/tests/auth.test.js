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
            .post('/api/auth/seeker/register')
            .field('fullName', 'Test User')
            .field('gender', 'MALE')
            .field('age', 25)
            .field('phone', '0911234567')
            .field('email', 'test@example.com')
            .field('password', 'password123')
            .field('experienceYears', 2)
            .field('expectedSalary', 5000)
            .field('preferredLocation', 'Addis Ababa')
            .field('preferredArrangement', 'LIVE_IN')
            .field('maritalStatus', 'SINGLE')
            .attach('profilePhoto', Buffer.from('fake image'), 'profile.jpg');

        expect(res.statusCode).toEqual(201);
        expect(res.body).toHaveProperty('token');
    });
});
