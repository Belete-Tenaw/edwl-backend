const request = require('supertest');
const app = require('../server');
const prisma = require('../utils/prisma');
const jwt = require('jsonwebtoken');

jest.mock('../utils/prisma', () => ({
    jobSeeker: {
        findUnique: jest.fn(),
    },
    employer: {
        findUnique: jest.fn(),
    },
    viewLog: {
        count: jest.fn(),
        create: jest.fn(),
    },
    jobPost: {
        findUnique: jest.fn(),
    }
}));

describe('Freemium Limits', () => {
    const token = jwt.sign({ id: 'user-123', role: 'JOB_SEEKER' }, process.env.JWT_SECRET || 'test_secret');

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should allow viewing if under limit', async () => {
        prisma.jobSeeker.findUnique.mockResolvedValue({ id: 'user-123', tier: 'FREEMIUM' });
        prisma.viewLog.count.mockResolvedValue(2); // 2 views today
        prisma.jobPost.findUnique.mockResolvedValue({
            id: 'job-1',
            employer: { phone: '123', email: 'test@test.com' }
        });

        const res = await request(app)
            .get('/api/jobs/job-1')
            .set('Authorization', `Bearer ${token}`);

        expect(res.statusCode).toEqual(200);
        expect(res.body.employer.phone).toEqual('********'); // Verify masking
    });

    it('should block viewing if limit reached', async () => {
        prisma.jobSeeker.findUnique.mockResolvedValue({ id: 'user-123', tier: 'FREEMIUM' });
        prisma.viewLog.count.mockResolvedValue(5); // 5 views already

        const res = await request(app)
            .get('/api/jobs/job-1')
            .set('Authorization', `Bearer ${token}`);

        expect(res.statusCode).toEqual(403);
        expect(res.body.error).toEqual('Daily limit reached');
    });

    it('should not block subscribers', async () => {
        prisma.jobSeeker.findUnique.mockResolvedValue({ id: 'user-123', tier: 'SUBSCRIBER' });
        prisma.jobPost.findUnique.mockResolvedValue({
            id: 'job-1',
            employer: { phone: '123', email: 'test@test.com' }
        });

        const res = await request(app)
            .get('/api/jobs/job-1')
            .set('Authorization', `Bearer ${token}`);

        expect(res.statusCode).toEqual(200);
        expect(res.body.employer.phone).toEqual('123'); // No masking for subscribers
    });
});
