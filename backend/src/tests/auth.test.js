const request = require('supertest');
const app = require('../server');
const prisma = require('../utils/prisma');

jest.mock('../utils/prisma', () => ({
    jobSeeker: {
        findFirst: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
    },
    employer: {
        findUnique: jest.fn(),
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
        prisma.jobSeeker.findUnique.mockResolvedValue(null);
        prisma.employer.findUnique.mockResolvedValue(null);
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
            .field('occupationCategory', 'OTHER')
            .field('customOccupation', 'Spa Assistant')
            .field('skills', JSON.stringify(['cleaning', 'other']))
            .field('languages', JSON.stringify(['amharic', 'english']))
            .attach('profilePhoto', Buffer.from('fake image'), 'profile.jpg')
            .attach('idDocument', Buffer.from('fake id'), 'id.jpg');

        expect(res.statusCode).toEqual(201);
        expect(res.body).toHaveProperty('token');
        expect(res.body.user).toEqual(expect.objectContaining({
            id: '123',
            name: 'Test User',
            role: 'JOB_SEEKER'
        }));
        expect(prisma.jobSeeker.create).toHaveBeenCalledWith(expect.objectContaining({
            data: expect.objectContaining({
                occupationCategory: 'OTHER',
                customOccupation: 'Spa Assistant',
                skills: ['cleaning', 'other'],
                languages: ['amharic', 'english']
            })
        }));
    });
});
