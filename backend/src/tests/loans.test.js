const request = require('supertest');
const jwt = require('jsonwebtoken');

// ─── Mock all external dependencies ──────────────────────────────────────────

jest.mock('../services/notificationService', () => ({
    init: jest.fn(),
    notify: jest.fn().mockResolvedValue({}),
}));

jest.mock('../services/telegramService', () => ({
    notifyAdmin: jest.fn().mockResolvedValue({}),
    sendMessage: jest.fn().mockResolvedValue({}),
}));

jest.mock('../services/auditService', () => ({
    logAction: jest.fn().mockResolvedValue({}),
}));

jest.mock('../utils/prisma', () => {
    const mockPrisma = {
        jobSeeker: {
            findUnique: jest.fn(),
            findMany: jest.fn(),
        },
        microLoan: {
            create: jest.fn(),
            findMany: jest.fn(),
        },
        escrowContract: {
            findMany: jest.fn(),
        },
        employer: {
            findUnique: jest.fn(),
        },
        admin: {
            findUnique: jest.fn(),
        },
        agency: {
            findUnique: jest.fn(),
        },
        auditLog: {
            create: jest.fn().mockResolvedValue({}),
        },
        $transaction: jest.fn((cb) => cb(mockPrisma)),
    };
    return mockPrisma;
});

const app = require('../server');
const prisma = require('../utils/prisma');

// ─── Test Suite ───────────────────────────────────────────────────────────────

describe('MicroLoan Eligibility & Constraint Engine', () => {
    // PLATINUM seeker JWT
    const platinumSeekerToken = jwt.sign(
        { id: 'seeker-platinum-001', role: 'JOB_SEEKER' },
        process.env.JWT_SECRET || 'test_secret'
    );

    // Non-platinum seeker JWT
    const basicSeekerToken = jwt.sign(
        { id: 'seeker-basic-002', role: 'JOB_SEEKER' },
        process.env.JWT_SECRET || 'test_secret'
    );

    // Common mock data
    const platinumSeekerWithEscrow = {
        id: 'seeker-platinum-001',
        tier: 'PLATINUM',
        behaviorScore: 90,
        escrowContracts: [
            { id: 'escrow-001', status: 'FUNDED', amount: 10000 },
        ],
    };

    beforeEach(() => {
        jest.clearAllMocks();

        // Auth middleware stubs
        prisma.employer.findUnique.mockResolvedValue(null);
        prisma.admin.findUnique.mockResolvedValue(null);
        prisma.agency.findUnique.mockResolvedValue(null);

        // Default: return platinum seeker for auth lookups
        prisma.jobSeeker.findUnique.mockResolvedValue({
            id: 'seeker-platinum-001',
            role: 'JOB_SEEKER',
            isActive: true,
        });
    });

    // ── Eligibility Checks ────────────────────────────────────────────────────

    describe('POST /api/loans/request — Eligibility Rules', () => {
        it('should reject a non-PLATINUM seeker with 403', async () => {
            // Auth lookup returns a basic-tier seeker
            prisma.jobSeeker.findUnique
                .mockResolvedValueOnce({ id: 'seeker-basic-002', role: 'JOB_SEEKER', isActive: true }) // auth
                .mockResolvedValueOnce({                                                                   // business logic
                    id: 'seeker-basic-002',
                    tier: 'SILVER',
                    behaviorScore: 85,
                    escrowContracts: [],
                });

            const res = await request(app)
                .post('/api/loans/request')
                .set('Authorization', `Bearer ${basicSeekerToken}`)
                .send({ amount: 2000 });

            expect(res.statusCode).toBe(403);
            expect(res.body.error).toMatch(/platinum/i);
        });

        it('should reject a PLATINUM seeker whose behavior score is below 80 (403)', async () => {
            prisma.jobSeeker.findUnique
                .mockResolvedValueOnce({ id: 'seeker-platinum-001', role: 'JOB_SEEKER', isActive: true })
                .mockResolvedValueOnce({
                    id: 'seeker-platinum-001',
                    tier: 'PLATINUM',
                    behaviorScore: 60, // too low
                    escrowContracts: [{ id: 'escrow-001', status: 'FUNDED', amount: 10000 }],
                });

            const res = await request(app)
                .post('/api/loans/request')
                .set('Authorization', `Bearer ${platinumSeekerToken}`)
                .send({ amount: 2000 });

            expect(res.statusCode).toBe(403);
            expect(res.body.error).toMatch(/80\+/i);
        });
    });

    // ── Amount Cap ────────────────────────────────────────────────────────────

    describe('POST /api/loans/request — 50% Escrow Cap', () => {
        it('should reject a loan request that exceeds 50% of total locked escrow (400)', async () => {
            prisma.jobSeeker.findUnique
                .mockResolvedValueOnce({ id: 'seeker-platinum-001', role: 'JOB_SEEKER', isActive: true })
                .mockResolvedValueOnce({
                    ...platinumSeekerWithEscrow,
                    // Total escrow = 10,000 ETB → max loan = 5,000 ETB
                });

            const res = await request(app)
                .post('/api/loans/request')
                .set('Authorization', `Bearer ${platinumSeekerToken}`)
                .send({ amount: 6000 }); // exceeds 50% cap

            expect(res.statusCode).toBe(400);
            expect(res.body.error).toMatch(/50%/i);
        });

        it('should approve a loan exactly at the 50% cap boundary (201)', async () => {
            prisma.jobSeeker.findUnique
                .mockResolvedValueOnce({ id: 'seeker-platinum-001', role: 'JOB_SEEKER', isActive: true })
                .mockResolvedValueOnce(platinumSeekerWithEscrow);

            prisma.microLoan.create.mockResolvedValue({
                id: 'loan-001',
                jobSeekerId: 'seeker-platinum-001',
                amount: 5000,
                status: 'APPROVED',
                dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            });

            const res = await request(app)
                .post('/api/loans/request')
                .set('Authorization', `Bearer ${platinumSeekerToken}`)
                .send({ amount: 5000 }); // exactly 50% of 10,000

            expect(res.statusCode).toBe(201);
            expect(res.body.message).toMatch(/approved/i);
            expect(res.body.loan.status).toBe('APPROVED');
            expect(prisma.microLoan.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: expect.objectContaining({
                        jobSeekerId: 'seeker-platinum-001',
                        amount: 5000,
                        status: 'APPROVED',
                    }),
                })
            );
        });
    });

    // ── Success Path ──────────────────────────────────────────────────────────

    describe('POST /api/loans/request — Happy Path', () => {
        it('should auto-approve and disburse a valid loan for an eligible PLATINUM worker (201)', async () => {
            prisma.jobSeeker.findUnique
                .mockResolvedValueOnce({ id: 'seeker-platinum-001', role: 'JOB_SEEKER', isActive: true })
                .mockResolvedValueOnce(platinumSeekerWithEscrow);

            prisma.microLoan.create.mockResolvedValue({
                id: 'loan-002',
                jobSeekerId: 'seeker-platinum-001',
                amount: 3000,
                status: 'APPROVED',
                escrowContractId: 'escrow-001',
                dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            });

            const res = await request(app)
                .post('/api/loans/request')
                .set('Authorization', `Bearer ${platinumSeekerToken}`)
                .send({ amount: 3000 });

            expect(res.statusCode).toBe(201);
            expect(res.body.loan.status).toBe('APPROVED');
            // Collateral should be linked to the first active escrow
            expect(res.body.loan.escrowContractId).toBe('escrow-001');
        });
    });

    // ── Loan History ──────────────────────────────────────────────────────────

    describe('GET /api/loans — Loan History', () => {
        it("should return the authenticated seeker's loan history", async () => {
            prisma.microLoan.findMany.mockResolvedValue([
                { id: 'loan-001', amount: 5000, status: 'APPROVED' },
                { id: 'loan-002', amount: 3000, status: 'REPAID' },
            ]);

            const res = await request(app)
                .get('/api/loans/')
                .set('Authorization', `Bearer ${platinumSeekerToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveLength(2);
            expect(res.body[1].status).toBe('REPAID');
        });
    });
});
