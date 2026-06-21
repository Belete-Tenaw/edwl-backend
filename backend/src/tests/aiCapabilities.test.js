const request = require('supertest');
const app = require('../server');
const prisma = require('../utils/prisma');
const jwt = require('jsonwebtoken');

jest.mock('../utils/prisma', () => ({
    jobSeeker: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
    },
    jobPost: {
        findUnique: jest.fn(),
    },
    hiringRequirement: {
        findUnique: jest.fn(),
    },
    auditLog: {
        create: jest.fn(),
    }
}));

describe('State of the Art AI Features - Matchmaking & Safety Moderation', () => {
    const token = jwt.sign({ id: 'seeker-123', role: 'JOB_SEEKER' }, process.env.JWT_SECRET || 'test_secret');

    beforeEach(() => {
        jest.clearAllMocks();
        prisma.jobSeeker.findUnique.mockResolvedValue({ id: 'seeker-123', isActive: true, tier: 'BRONZE' });
    });

    describe('GET /api/ai/match/rank/:jobId', () => {
        it('should rank workers according to precision matching compatibility', async () => {
            const mockJob = {
                id: 'job-123',
                requiredSkills: ['Nanny', 'Cooking'],
                requirements: { skills: ['Nanny', 'Cooking'], languages: ['Amharic'] }
            };

            const mockWorkers = [
                {
                    id: 'worker-1',
                    fullName: 'Lensa Kebede',
                    skills: ['Nanny', 'Cooking'],
                    experienceYears: 5,
                    behaviorScore: 95,
                    languages: ['Amharic'],
                    userTrainings: [{ id: 't-1' }, { id: 't-2' }]
                },
                {
                    id: 'worker-2',
                    fullName: 'Marta Hailu',
                    skills: ['Nanny'],
                    experienceYears: 1,
                    behaviorScore: 70,
                    languages: ['Amharic'],
                    userTrainings: []
                }
            ];

            prisma.jobPost.findUnique.mockResolvedValue(mockJob);
            prisma.jobSeeker.findMany.mockResolvedValue(mockWorkers);
            // Mock individual seeker includes in calculatePrecisionMatch
            prisma.jobSeeker.findUnique
                .mockResolvedValueOnce({ id: 'seeker-123', isActive: true, tier: 'BRONZE' }) // for auth
                .mockResolvedValueOnce({ ...mockWorkers[0], userTrainings: [{ id: 't-1' }, { id: 't-2' }] }) // for Lensas score
                .mockResolvedValueOnce({ ...mockWorkers[1], userTrainings: [] }); // for Martas score

            const res = await request(app)
                .get('/api/ai/match/rank/job-123')
                .set('Authorization', `Bearer ${token}`);

            expect(res.statusCode).toEqual(200);
            expect(res.body.length).toBe(2);
            // First worker should have higher compatibility score than second
            expect(res.body[0].worker.fullName).toEqual('Lensa Kebede');
            expect(res.body[0].match.score).toBeGreaterThan(res.body[1].match.score);
        });
    });

    describe('POST /api/ai/safety/check-text', () => {
        it('should detect coercion and potential human trafficking indicators', async () => {
            const maliciousText = 'You cannot leave the house without my permission and I will keep your passport.';
            
            prisma.auditLog.create.mockResolvedValue({});

            const res = await request(app)
                .post('/api/ai/safety/check-text')
                .set('Authorization', `Bearer ${token}`)
                .send({ text: maliciousText, userId: 'employer-456' });

            expect(res.statusCode).toEqual(200);
            expect(res.body.isFlagged).toBe(true);
            expect(res.body.flags).toContain('POTENTIAL_TRAFFICKING_OR_COERCION');
            expect(prisma.auditLog.create).toHaveBeenCalled();
        });

        it('should detect underpayment exploitation signals below standard living wage thresholds', async () => {
            const exploitativeText = 'I want to offer no days off and pay 1000 ETB per month.';

            prisma.auditLog.create.mockResolvedValue({});

            const res = await request(app)
                .post('/api/ai/safety/check-text')
                .set('Authorization', `Bearer ${token}`)
                .send({ text: exploitativeText, userId: 'employer-456' });

            expect(res.statusCode).toEqual(200);
            expect(res.body.isFlagged).toBe(true);
            expect(res.body.flags).toContain('FINANCIAL_EXPLOITATION_OR_UNDERPAYMENT');
        });

        it('should pass benign, polite professional communication clean of flags', async () => {
            const cleanText = 'Hello, I have 3 years of childcare experience and looking forward to working with you.';

            const res = await request(app)
                .post('/api/ai/safety/check-text')
                .set('Authorization', `Bearer ${token}`)
                .send({ text: cleanText, userId: 'seeker-123' });

            expect(res.statusCode).toEqual(200);
            expect(res.body.isFlagged).toBe(false);
            expect(res.body.flags.length).toBe(0);
            expect(prisma.auditLog.create).not.toHaveBeenCalled();
        });
    });
});
