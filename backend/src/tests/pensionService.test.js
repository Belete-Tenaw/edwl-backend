jest.mock('../utils/prisma', () => ({
    microPension: {
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
    },
    pensionTx: {
        create: jest.fn(),
    },
    jobSeeker: {
        findUnique: jest.fn(),
    },
    $transaction: jest.fn(),
}));

jest.mock('../services/notificationService', () => ({
    notify: jest.fn(),
}));

jest.mock('../services/telegramService', () => ({
    notifyAdmin: jest.fn(),
}));

const pensionService = require('../services/pensionService');
const prisma = require('../utils/prisma');
const notificationService = require('../services/notificationService');
const telegramService = require('../services/telegramService');

describe('PensionService Unit Tests', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        
        // Mock $transaction to simply run the callback with the mocked prisma instance
        prisma.$transaction.mockImplementation(async (callback) => {
            return await callback(prisma);
        });
    });

    describe('createPensionAccount', () => {
        it('should return existing account if it exists', async () => {
            const mockPension = { id: 'pension-1', jobSeekerId: 'seeker-123', balance: 500 };
            prisma.microPension.findUnique.mockResolvedValue(mockPension);

            const result = await pensionService.createPensionAccount('seeker-123');

            expect(prisma.microPension.findUnique).toHaveBeenCalledWith({
                where: { jobSeekerId: 'seeker-123' }
            });
            expect(prisma.microPension.create).not.toHaveBeenCalled();
            expect(result).toEqual(mockPension);
        });

        it('should create new account if it does not exist', async () => {
            prisma.microPension.findUnique.mockResolvedValue(null);
            const newPension = { id: 'pension-new', jobSeekerId: 'seeker-123', balance: 0.0 };
            prisma.microPension.create.mockResolvedValue(newPension);

            const result = await pensionService.createPensionAccount('seeker-123');

            expect(prisma.microPension.create).toHaveBeenCalledWith({
                data: {
                    jobSeekerId: 'seeker-123',
                    balance: 0.0,
                    currency: 'ETB'
                }
            });
            expect(result).toEqual(newPension);
        });
    });

    describe('depositToPension', () => {
        it('should successfully deposit to pension and log ledger entry', async () => {
            const seekerId = 'seeker-123';
            const depositAmount = 240.0; // 3% of 8000 ETB salary
            
            prisma.microPension.findUnique.mockResolvedValue({ id: 'pension-1', jobSeekerId: seekerId, balance: 100 });
            prisma.microPension.update.mockResolvedValue({ id: 'pension-1', jobSeekerId: seekerId, balance: 340 });
            prisma.pensionTx.create.mockResolvedValue({ id: 'tx-1', amount: depositAmount, type: 'CONTRIBUTION' });
            prisma.jobSeeker.findUnique.mockResolvedValue({ id: seekerId, fullName: 'Belete Tenaw' });

            const result = await pensionService.depositToPension(seekerId, depositAmount, 'CONTRIBUTION', 'contract-abc');

            expect(prisma.$transaction).toHaveBeenCalled();
            expect(prisma.microPension.update).toHaveBeenCalledWith({
                where: { id: 'pension-1' },
                data: {
                    balance: { increment: depositAmount },
                    lastDeposit: expect.any(Date)
                }
            });
            expect(prisma.pensionTx.create).toHaveBeenCalledWith({
                data: {
                    pensionId: 'pension-1',
                    amount: depositAmount,
                    type: 'CONTRIBUTION',
                    contractId: 'contract-abc'
                }
            });
            expect(notificationService.notify).toHaveBeenCalledWith(seekerId, 'JOB_SEEKER', {
                title: 'Pension Savings Boosted! 📈',
                message: expect.stringContaining('340 ETB'),
                type: 'SYSTEM'
            });
            expect(telegramService.notifyAdmin).toHaveBeenCalled();
            expect(result.pension.balance).toEqual(340);
        });

        it('should throw error if deposit amount is negative or zero', async () => {
            await expect(pensionService.depositToPension('seeker-123', -50))
                .rejects.toThrow('Deposit amount must be greater than zero');
        });
    });

    describe('withdrawFromPension', () => {
        it('should allow withdrawal if sufficient funds exist', async () => {
            const seekerId = 'seeker-123';
            const withdrawAmount = 200.0;

            prisma.microPension.findUnique.mockResolvedValue({ id: 'pension-1', jobSeekerId: seekerId, balance: 500 });
            prisma.microPension.update.mockResolvedValue({ id: 'pension-1', jobSeekerId: seekerId, balance: 300 });
            prisma.pensionTx.create.mockResolvedValue({ id: 'tx-w', amount: withdrawAmount, type: 'WITHDRAWAL' });
            prisma.jobSeeker.findUnique.mockResolvedValue({ id: seekerId, fullName: 'Belete Tenaw' });

            const result = await pensionService.withdrawFromPension(seekerId, withdrawAmount, 'MEDICAL');

            expect(prisma.microPension.update).toHaveBeenCalledWith({
                where: { id: 'pension-1' },
                data: {
                    balance: { decrement: withdrawAmount }
                }
            });
            expect(prisma.pensionTx.create).toHaveBeenCalledWith({
                data: {
                    pensionId: 'pension-1',
                    amount: withdrawAmount,
                    type: 'WITHDRAWAL'
                }
            });
            expect(notificationService.notify).toHaveBeenCalledWith(seekerId, 'JOB_SEEKER', {
                title: 'Pension Withdrawal! 🏦',
                message: expect.stringContaining('300 ETB'),
                type: 'PAYMENT'
            });
            expect(result.pension.balance).toEqual(300);
        });

        it('should throw error if pension balance is insufficient', async () => {
            const seekerId = 'seeker-123';
            prisma.microPension.findUnique.mockResolvedValue({ id: 'pension-1', jobSeekerId: seekerId, balance: 100 });

            await expect(pensionService.withdrawFromPension(seekerId, 150))
                .rejects.toThrow('Insufficient micro-pension balance');
        });
    });
});
