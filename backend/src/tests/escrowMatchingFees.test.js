const request = require('supertest');
const jwt = require('jsonwebtoken');

// Mock external services
jest.mock('../services/pensionService', () => ({
    depositToPension: jest.fn().mockResolvedValue({}),
}));

jest.mock('../services/notificationService', () => ({
    init: jest.fn(),
    notify: jest.fn().mockResolvedValue({}),
}));

jest.mock('../services/telegramService', () => ({
    notifyAdmin: jest.fn().mockResolvedValue({}),
}));

jest.mock('../services/chapaService', () => ({
    initialize: jest.fn(),
    verify: jest.fn(),
}));

jest.mock('../utils/prisma', () => {
    const mockPrisma = {
        contract: {
            findUnique: jest.fn(),
            update: jest.fn(),
        },
        escrowContract: {
            create: jest.fn(),
            findUnique: jest.fn(),
            update: jest.fn(),
        },
        payment: {
            create: jest.fn(),
            updateMany: jest.fn(),
        },
        employer: {
            findUnique: jest.fn(),
        },
        jobSeeker: {
            findUnique: jest.fn(),
        },
        $transaction: jest.fn((cb) => cb(mockPrisma)),
    };
    return mockPrisma;
});

const app = require('../server');
const prisma = require('../utils/prisma');
const chapaService = require('../services/chapaService');

describe('Escrow Automated Revenue & Platform Matching Fee Engine', () => {
    const employerToken = jwt.sign({ id: 'employer-123', role: 'EMPLOYER' }, process.env.JWT_SECRET || 'test_secret');

    beforeEach(() => {
        jest.clearAllMocks();
        
        prisma.$transaction.mockImplementation((cb) => {
            return cb(prisma);
        });
        
        // Setup default employer profile mock responses
        prisma.employer.findUnique.mockResolvedValue({ 
            id: 'employer-123', 
            role: 'EMPLOYER', 
            isActive: true 
        });
        prisma.jobSeeker.findUnique.mockResolvedValue(null);
    });

    describe('POST /api/escrow/initiate', () => {
        it('should calculate 5% matching fee, add it to checkout, and save it as a pending platform payment record', async () => {
            const mockContract = {
                id: 'contract-789',
                employerId: 'employer-123',
                jobSeekerId: 'seeker-456',
                jobPostId: 'job-111',
                employer: {
                    contactName: 'Selam Kebede',
                    email: 'selam@example.com'
                }
            };

            prisma.contract.findUnique.mockResolvedValue(mockContract);
            prisma.escrowContract.create.mockResolvedValue({ id: 'escrow-abc', status: 'PENDING' });
            prisma.payment.create.mockResolvedValue({ id: 'payment-abc', status: 'PENDING' });

            chapaService.initialize.mockResolvedValue({
                status: 'success',
                data: { checkout_url: 'https://checkout.chapa.co/test' }
            });

            const res = await request(app)
                .post('/api/escrow/initiate')
                .set('Authorization', `Bearer ${employerToken}`)
                .send({
                    contractId: 'contract-789',
                    amount: 5000 // 5000 ETB salary
                });

            expect(res.statusCode).toEqual(201);
            
            // 5% of 5000 ETB = 250 ETB fee. Total charge = 5250 ETB
            expect(chapaService.initialize).toHaveBeenCalledWith(
                expect.objectContaining({
                    amount: '5250',
                    customization: expect.objectContaining({
                        description: 'Salary: 5000 ETB + 5% Platform Matching Fee: 250 ETB'
                    })
                })
            );

            // Escrow record should be created for the actual worker salary (5000 ETB)
            expect(prisma.escrowContract.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: expect.objectContaining({
                        amount: 5000
                    })
                })
            );

            // Payment record should be created for the 5% platform fee (250 ETB)
            expect(prisma.payment.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: expect.objectContaining({
                        amount: 250,
                        status: 'PENDING',
                        employerId: 'employer-123'
                    })
                })
            );
        });
    });

    describe('POST /api/escrow/verify', () => {
        it('should complete the pending platform fee payment record upon successful gateway verification', async () => {
            const mockEscrow = {
                id: 'escrow-abc',
                contractId: 'contract-789',
                employerId: 'employer-123',
                workerId: 'seeker-456',
                amount: 5000,
                status: 'PENDING',
                provider: 'CHAPA',
                providerRef: 'ESC-12345'
            };

            prisma.escrowContract.findUnique.mockResolvedValue(mockEscrow);
            prisma.escrowContract.update.mockResolvedValue({ ...mockEscrow, status: 'FUNDED' });
            prisma.contract.update.mockResolvedValue({ id: 'contract-789', status: 'ACTIVE' });
            prisma.payment.updateMany.mockResolvedValue({ count: 1 });

            chapaService.verify.mockResolvedValue({ status: 'success' });

            const res = await request(app)
                .post('/api/escrow/verify')
                .set('Authorization', `Bearer ${employerToken}`)
                .send({
                    providerRef: 'ESC-12345'
                });

            expect(res.statusCode).toEqual(200);

            // Platform fee payment status should be updated to COMPLETED
            expect(prisma.payment.updateMany).toHaveBeenCalledWith({
                where: { transactionReference: 'ESC-12345' },
                data: { status: 'COMPLETED' }
            });
        });
    });
});
