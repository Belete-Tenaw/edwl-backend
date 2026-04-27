/**
 * AI Trust Engine Unit Tests
 * Tests the automated tier progression and behavior scoring logic.
 */

// Mock all external dependencies BEFORE requiring the module
jest.mock('../utils/prisma', () => ({
    jobSeeker: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        update: jest.fn(),
    },
}));

jest.mock('../services/notificationService', () => ({
    createInAppNotification: jest.fn().mockResolvedValue({}),
}));

jest.mock('../services/telegramService', () => ({
    sendMessage: jest.fn().mockResolvedValue({}),
}));

const prisma = require('../utils/prisma');
const aiTrustEngine = require('../services/aiTrustEngine');

describe('AI Trust Engine - evaluateWorker', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        prisma.jobSeeker.update.mockResolvedValue({});
    });

    it('should return null if worker is not found', async () => {
        prisma.jobSeeker.findUnique.mockResolvedValue(null);
        const result = await aiTrustEngine.evaluateWorker('non-existent-id');
        expect(result).toBeNull();
    });

    it('should compute a behavior score from digital footprint', async () => {
        prisma.jobSeeker.findUnique.mockResolvedValue({
            id: 'w1',
            fullName: 'Test Worker',
            tier: 'BRONZE',
            isFaydaVerified: true,      // +20
            nationalIdUrl: 'url1',      // +10
            policeClearanceUrl: null,
            healthCertificateUrl: null,
            profilePhoto: 'photo.jpg',  // +5
            completedJobs: 0,
            behaviorScore: 50,
            reviewsReceived: [],
            telegramChatId: null,
        });

        const result = await aiTrustEngine.evaluateWorker('w1');
        // footprintScore = 20 + 10 + 5 = 35, reviewScore = 0, completedJobs bonus = 0
        expect(result.finalBehaviorScore).toBe(35);
        expect(result.upgraded).toBe(false);
        expect(result.newTier).toBe('BRONZE');
    });

    it('should automatically upgrade BRONZE -> SILVER when conditions are met', async () => {
        prisma.jobSeeker.findUnique.mockResolvedValue({
            id: 'w2',
            fullName: 'Silver Candidate',
            tier: 'BRONZE',
            isFaydaVerified: true,      // +20
            nationalIdUrl: 'url1',      // +10
            policeClearanceUrl: 'url2', // +15
            healthCertificateUrl: null,
            profilePhoto: 'photo.jpg',  // +5
            completedJobs: 5,           // +10 (5 * 2)
            behaviorScore: 0,
            reviewsReceived: [
                { rating: 5 },
                { rating: 4.5 },
                { rating: 5 },
            ],
            telegramChatId: null,
        });

        const result = await aiTrustEngine.evaluateWorker('w2');
        // footprintScore = 20+10+15+5 = 50, reviewScore = 30 (avg>=4.5, count>=3), completedJobs = 10
        // total = 90, capped at 100 => 90
        expect(result.finalBehaviorScore).toBe(90);
        expect(result.upgraded).toBe(true);
        expect(result.newTier).toBe('SILVER');
        expect(prisma.jobSeeker.update).toHaveBeenCalledWith({
            where: { id: 'w2' },
            data: { behaviorScore: 90, tier: 'SILVER' },
        });
    });

    it('should automatically upgrade SILVER -> GOLD when conditions are met', async () => {
        prisma.jobSeeker.findUnique.mockResolvedValue({
            id: 'w3',
            fullName: 'Gold Candidate',
            tier: 'SILVER',
            isFaydaVerified: true,
            nationalIdUrl: 'url1',
            policeClearanceUrl: 'url2', // required for Gold
            healthCertificateUrl: 'url3',
            profilePhoto: 'photo.jpg',
            completedJobs: 5, // >= 3 required
            behaviorScore: 70,
            reviewsReceived: [
                { rating: 5 },
                { rating: 5 },
                { rating: 5 },
            ],
            telegramChatId: null,
        });

        const result = await aiTrustEngine.evaluateWorker('w3');
        // footprint = 20+10+15+5+5=55, review=30, completed=10 => 95
        expect(result.finalBehaviorScore).toBe(95);
        expect(result.upgraded).toBe(true);
        expect(result.newTier).toBe('GOLD');
    });

    it('should NOT upgrade SILVER -> GOLD if behavior score is below threshold', async () => {
        prisma.jobSeeker.findUnique.mockResolvedValue({
            id: 'w4',
            fullName: 'Low Score Worker',
            tier: 'SILVER',
            isFaydaVerified: false,
            nationalIdUrl: null,
            policeClearanceUrl: 'url2',
            healthCertificateUrl: null,
            profilePhoto: null,
            completedJobs: 3,
            behaviorScore: 30,
            reviewsReceived: [{ rating: 3.5 }], // below 4.0
            telegramChatId: null,
        });

        const result = await aiTrustEngine.evaluateWorker('w4');
        // footprint = 15, review=0, completed = 6 => 21
        expect(result.finalBehaviorScore).toBe(21);
        expect(result.upgraded).toBe(false);
        expect(result.newTier).toBe('SILVER');
    });

    it('should cap behavior score at 100', async () => {
        prisma.jobSeeker.findUnique.mockResolvedValue({
            id: 'w5',
            fullName: 'Perfect Worker',
            tier: 'BRONZE',
            isFaydaVerified: true,
            nationalIdUrl: 'url1',
            policeClearanceUrl: 'url2',
            healthCertificateUrl: 'url3',
            profilePhoto: 'photo.jpg',
            completedJobs: 100, // very high
            behaviorScore: 50,
            reviewsReceived: [{ rating: 5 }, { rating: 5 }, { rating: 5 }],
            telegramChatId: null,
        });

        const result = await aiTrustEngine.evaluateWorker('w5');
        expect(result.finalBehaviorScore).toBe(100); // Capped
    });
});

describe('AI Trust Engine - runNightlyBatchVetting', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        prisma.jobSeeker.update.mockResolvedValue({});
    });

    it('should process all eligible workers and count upgrades', async () => {
        prisma.jobSeeker.findMany.mockResolvedValue([
            { id: 'w1' },
            { id: 'w2' },
        ]);

        // Mock evaluateWorker for each worker via findUnique
        prisma.jobSeeker.findUnique
            .mockResolvedValueOnce({
                id: 'w1', fullName: 'Worker A', tier: 'BRONZE',
                isFaydaVerified: true, nationalIdUrl: 'url1',
                policeClearanceUrl: 'url2', healthCertificateUrl: null,
                profilePhoto: 'p.jpg', completedJobs: 5, behaviorScore: 0,
                reviewsReceived: [{ rating: 5 }, { rating: 5 }, { rating: 5 }],
                telegramChatId: null,
            })
            .mockResolvedValueOnce({
                id: 'w2', fullName: 'Worker B', tier: 'BRONZE',
                isFaydaVerified: false, nationalIdUrl: null,
                policeClearanceUrl: null, healthCertificateUrl: null,
                profilePhoto: null, completedJobs: 0, behaviorScore: 0,
                reviewsReceived: [],
                telegramChatId: null,
            });

        // Should not throw
        await expect(aiTrustEngine.runNightlyBatchVetting()).resolves.not.toThrow();
        expect(prisma.jobSeeker.findMany).toHaveBeenCalledTimes(1);
    });

    it('should handle an empty worker list gracefully', async () => {
        prisma.jobSeeker.findMany.mockResolvedValue([]);
        await expect(aiTrustEngine.runNightlyBatchVetting()).resolves.not.toThrow();
    });
});
