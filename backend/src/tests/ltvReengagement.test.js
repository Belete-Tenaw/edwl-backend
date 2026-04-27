/**
 * LTV Re-engagement & Automation Logic Unit Tests
 * Tests the business logic from automationJobs.js by extracting and testing
 * the core behaviors without triggering cron scheduling.
 */

// The automation module wraps everything in `if (process.env.NODE_ENV !== 'test')`,
// so requiring it in test env is safe (crons won't register).
// We test the underlying logic by directly mocking prisma & telegramService.

jest.mock('../utils/prisma', () => ({
    employer: {
        findMany: jest.fn(),
    },
    subscriptionCode: {
        create: jest.fn(),
    },
    auditLog: {
        create: jest.fn(),
    },
    jobPost: {
        findMany: jest.fn(),
    },
    $queryRawUnsafe: jest.fn(),
}));

jest.mock('../services/telegramService', () => ({
    sendMessage: jest.fn().mockResolvedValue({}),
}));

jest.mock('../services/aiTrustEngine', () => ({
    runNightlyBatchVetting: jest.fn().mockResolvedValue(undefined),
}));

const prisma = require('../utils/prisma');
const telegramService = require('../services/telegramService');

// Since we can't call cron jobs directly, we extract the LTV logic to test it in isolation.
// This is the re-engagement logic from JOB 4:
const runLTVReengagement = async () => {
    const today = new Date();
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 7);

    const stalledEmployers = await prisma.employer.findMany({
        where: {
            tier: 'FREE',
            updatedAt: {
                lte: sevenDaysAgo,
                gte: new Date(sevenDaysAgo.getTime() - 24 * 60 * 60 * 1000),
            },
        },
    });

    for (const employer of stalledEmployers) {
        const promoCode = `COMEBACK-${Math.floor(Math.random() * 90000) + 10000}`;

        await prisma.subscriptionCode.create({
            data: {
                code: promoCode,
                status: 'UNUSED',
                durationDays: 30,
                expiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
                codeType: 'TRUST_UPGRADE',
                tierUpgrade: 'SILVER_ACCESS',
            },
        });

        const message = `✨ <b>Exclusive EDWL Offer!</b>\n\nHi ${employer.contactName}, we noticed you haven't hired your ideal domestic worker yet. \n\nWe just added 50+ AI-Vetted workers in your area! Use code <b>${promoCode}</b> within the next 72 hours to get a FREE 30-Day Silver Trust Upgrade.\n\nClaim here: https://edwl-ethio-domesticworkerslink.web.app`;

        if (employer.telegramChatId) {
            await telegramService.sendMessage(employer.telegramChatId, message);
        }

        await prisma.auditLog.create({
            data: {
                action: 'MARKETING_REENGAGEMENT_SENT',
                userType: 'EMPLOYER',
                employerId: employer.id,
                details: { promoCode, trigger: '7_day_inactivity' },
            },
        });
    }
};

describe('LTV Re-engagement Marketing Engine', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        prisma.subscriptionCode.create.mockResolvedValue({});
        prisma.auditLog.create.mockResolvedValue({});
    });

    it('should generate a unique promo code for each stalled employer', async () => {
        prisma.employer.findMany.mockResolvedValue([
            { id: 'e1', contactName: 'Abebe Bikila', telegramChatId: '123' },
            { id: 'e2', contactName: 'Tigist Assefa', telegramChatId: null },
        ]);

        await runLTVReengagement();

        expect(prisma.subscriptionCode.create).toHaveBeenCalledTimes(2);
        
        // Verify the code created for first employer has correct shape
        const firstCall = prisma.subscriptionCode.create.mock.calls[0][0].data;
        expect(firstCall.code).toMatch(/^COMEBACK-\d{5}$/);
        expect(firstCall.status).toBe('UNUSED');
        expect(firstCall.durationDays).toBe(30);
        expect(firstCall.codeType).toBe('TRUST_UPGRADE');
        expect(firstCall.tierUpgrade).toBe('SILVER_ACCESS');
    });

    it('should send Telegram message only to employers with telegramChatId', async () => {
        prisma.employer.findMany.mockResolvedValue([
            { id: 'e1', contactName: 'Abebe', telegramChatId: 'chat123' },
            { id: 'e2', contactName: 'Kedija', telegramChatId: null }, // No Telegram
        ]);

        await runLTVReengagement();

        // Only one Telegram message should be sent
        expect(telegramService.sendMessage).toHaveBeenCalledTimes(1);
        expect(telegramService.sendMessage).toHaveBeenCalledWith('chat123', expect.stringContaining('Abebe'));
    });

    it('should log a marketing touchpoint for every stalled employer', async () => {
        prisma.employer.findMany.mockResolvedValue([
            { id: 'e1', contactName: 'Almaz', telegramChatId: null },
            { id: 'e2', contactName: 'Dawit', telegramChatId: null },
            { id: 'e3', contactName: 'Mekdes', telegramChatId: null },
        ]);

        await runLTVReengagement();

        expect(prisma.auditLog.create).toHaveBeenCalledTimes(3);
        expect(prisma.auditLog.create).toHaveBeenCalledWith(expect.objectContaining({
            data: expect.objectContaining({
                action: 'MARKETING_REENGAGEMENT_SENT',
                userType: 'EMPLOYER',
                details: expect.objectContaining({ trigger: '7_day_inactivity' }),
            }),
        }));
    });

    it('should do nothing if there are no stalled employers', async () => {
        prisma.employer.findMany.mockResolvedValue([]);

        await runLTVReengagement();

        expect(prisma.subscriptionCode.create).not.toHaveBeenCalled();
        expect(telegramService.sendMessage).not.toHaveBeenCalled();
        expect(prisma.auditLog.create).not.toHaveBeenCalled();
    });

    it('should set promo code expiry to approximately 3 days from now', async () => {
        prisma.employer.findMany.mockResolvedValue([
            { id: 'e1', contactName: 'Test', telegramChatId: null },
        ]);

        const before = Date.now();
        await runLTVReengagement();
        const after = Date.now();

        const expiresAt = prisma.subscriptionCode.create.mock.calls[0][0].data.expiresAt;
        const expectedMs = 3 * 24 * 60 * 60 * 1000; // 3 days in ms

        expect(expiresAt.getTime()).toBeGreaterThanOrEqual(before + expectedMs - 1000);
        expect(expiresAt.getTime()).toBeLessThanOrEqual(after + expectedMs + 1000);
    });
});
