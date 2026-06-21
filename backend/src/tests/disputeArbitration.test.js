const request = require('supertest');
const jwt = require('jsonwebtoken');

// All mocks must be defined inline inside jest.mock() factory 
// because Jest hoists these calls above variable declarations.

jest.mock('../services/pensionService', () => ({
    depositToPension: jest.fn().mockResolvedValue({}),
    createPensionAccount: jest.fn().mockResolvedValue({}),
}));

jest.mock('../services/notificationService', () => ({
    init: jest.fn(),
    notify: jest.fn().mockResolvedValue({}),
}));

jest.mock('../services/telegramService', () => ({
    notifyAdmin: jest.fn().mockResolvedValue({}),
    sendMessage: jest.fn().mockResolvedValue({}),
}));

jest.mock('../utils/prisma', () => ({
    dispute: {
        findUnique: jest.fn(),
        update: jest.fn(),
        findMany: jest.fn().mockResolvedValue([]),
    },
    escrowContract: {
        update: jest.fn(),
    },
    contract: {
        update: jest.fn(),
    },
    jobSeeker: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
    },
    employer: {
        findUnique: jest.fn(),
    },
    message: {
        findMany: jest.fn(),
    },
    auditLog: {
        create: jest.fn().mockResolvedValue({}),
    },
    admin: {
        findUnique: jest.fn(),
    },
    $transaction: jest.fn((cb) => {
        const prisma = require('../utils/prisma');
        return cb(prisma);
    }),
}));

const app = require('../server');
const prisma = require('../utils/prisma');
const pensionService = require('../services/pensionService');
const notificationService = require('../services/notificationService');
const telegramService = require('../services/telegramService');

describe('AI Dispute Mediation & Arbitration Engine', () => {
    const adminToken = jwt.sign({ id: 'admin-123', role: 'ADMIN' }, process.env.JWT_SECRET || 'test_secret');

    beforeEach(() => {
        jest.clearAllMocks();
        // Auth middleware mock - returns admin user
        prisma.admin = prisma.admin || {};
        prisma.admin.findUnique = jest.fn().mockResolvedValue({ 
            id: 'admin-123', 
            role: 'SUPERADMIN',
            isActive: true 
        });
        prisma.jobSeeker.findUnique.mockResolvedValue(null);
    });

    describe('AI Conflict Mediation Calculations', () => {
        it('should correctly suggest 100/0 split for high-trust workers with proof of completion', async () => {
            const aiService = require('../services/aiService');

            prisma.dispute.findUnique.mockResolvedValue({
                id: 'dispute-123',
                reason: 'Escrow payment dispute',
                description: 'The worker completed the job and wants payment release.',
                contract: {
                    salary: 5000,
                    jobSeeker: { id: 'seeker-123', behaviorScore: 92, fullName: 'Abebe Bikila' },
                    employer: { id: 'employer-456', behaviorScore: 88, contactName: 'Chala Desta' },
                    escrowContracts: [{ workerConfirmed: true }],
                    terms: []
                }
            });

            prisma.message.findMany.mockResolvedValue([
                { content: 'I am done with the cooking and nanny work today.', senderJSId: 'seeker-123' }
            ]);

            prisma.dispute.update.mockResolvedValue({
                id: 'dispute-123',
                aiSuggestedResolution: '[SPLIT: 100/0] test',
                aiConfidenceScore: 0.94,
                autoMediated: false
            });

            const result = await aiService.mediateConflict('dispute-123');

            expect(result.error).toBeUndefined();
            expect(result.recommendedSplit).toBeDefined();
            expect(result.recommendedSplit.workerPercent).toBe(100);
            expect(result.recommendedSplit.employerPercent).toBe(0);
            expect(result.suggestion).toContain('[SPLIT: 100/0]');
            expect(result.confidence).toBeGreaterThanOrEqual(0.9);
        });

        it('should suggest 0/100 split for safety/abuse disputes', async () => {
            const aiService = require('../services/aiService');

            prisma.dispute.findUnique.mockResolvedValue({
                id: 'dispute-safety',
                reason: 'harassment and abuse reported',
                description: 'The employer threatened violence against the worker.',
                contract: {
                    salary: 3000,
                    jobSeeker: { id: 'seeker-123', behaviorScore: 80, fullName: 'Abebe Bikila' },
                    employer: { id: 'employer-456', behaviorScore: 30, contactName: 'Chala Desta' },
                    escrowContracts: [{}],
                    terms: []
                }
            });

            prisma.message.findMany.mockResolvedValue([]);
            prisma.dispute.update.mockResolvedValue({
                id: 'dispute-safety',
                autoMediated: true
            });

            const result = await aiService.mediateConflict('dispute-safety');

            expect(result.recommendedSplit.workerPercent).toBe(0);
            expect(result.recommendedSplit.employerPercent).toBe(100);
            expect(result.actionType).toBe('AUTO_TERMINATE');
            expect(result.confidence).toBeGreaterThanOrEqual(0.99);
        });

        it('should fallback to 50/50 split for ambiguous disputes', async () => {
            const aiService = require('../services/aiService');

            prisma.dispute.findUnique.mockResolvedValue({
                id: 'dispute-ambig',
                reason: 'Vague complaint',
                description: 'I do not like the mood.',
                contract: {
                    salary: 2000,
                    jobSeeker: { id: 'seeker-123', behaviorScore: 50, fullName: 'Abebe Bikila' },
                    employer: { id: 'employer-456', behaviorScore: 50, contactName: 'Chala Desta' },
                    escrowContracts: [{}],
                    terms: []
                }
            });

            prisma.message.findMany.mockResolvedValue([]);
            prisma.dispute.update.mockResolvedValue({
                id: 'dispute-ambig',
                autoMediated: false
            });

            const result = await aiService.mediateConflict('dispute-ambig');

            expect(result.recommendedSplit.workerPercent).toBe(50);
            expect(result.recommendedSplit.employerPercent).toBe(50);
            expect(result.suggestion).toContain('[SPLIT: 50/50]');
        });
    });
});
