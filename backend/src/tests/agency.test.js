const request = require('supertest');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

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

// Mock bcrypt so hashing is synchronous-speed in tests
jest.mock('bcrypt', () => ({
    hash: jest.fn().mockResolvedValue('hashed_password_mock'),
    compare: jest.fn(),
}));




jest.mock('../utils/prisma', () => {
    const mockPrisma = {
        agency: {
            findUnique: jest.fn(),
            create: jest.fn(),
        },
        jobSeeker: {
            findMany: jest.fn(),
            findUnique: jest.fn(),
        },
        employer: {
            findUnique: jest.fn(),
        },
        admin: {
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

describe('B2B Agency Management Suite', () => {
    // A valid agency JWT signed with the test secret
    const agencyToken = jwt.sign(
        { id: 'agency-001', role: 'AGENCY' },
        process.env.JWT_SECRET || 'test_secret'
    );

    beforeEach(() => {
        jest.clearAllMocks();

        // Auth middleware stubs
        prisma.jobSeeker.findUnique.mockResolvedValue(null);
        prisma.employer.findUnique.mockResolvedValue(null);
        prisma.admin.findUnique.mockResolvedValue(null);

        // Default: agency IS found for auth middleware on protected routes
        prisma.agency.findUnique.mockResolvedValue({
            id: 'agency-001',
            name: 'Selam Staffing Ltd',
            registrationNo: 'AG-1234',
            isActive: true,
            role: 'AGENCY',
        });
    });

    // ── Registration ──────────────────────────────────────────────────────────

    describe('POST /api/agencies/register', () => {
        it('should register a new agency and return 201', async () => {
            // No duplicate exists
            prisma.agency.findUnique.mockResolvedValueOnce(null);
            prisma.agency.create.mockResolvedValue({
                id: 'agency-new',
                name: 'Horizon HR Agency',
                registrationNo: 'AG-5678',
                contactPhone: '+251911000001',
                address: 'Bole, Addis Ababa',
            });

            const res = await request(app)
                .post('/api/agencies/register')
                .send({
                    name: 'Horizon HR Agency',
                    registrationNo: 'AG-5678',
                    contactPhone: '+251911000001',
                    password: 'SecurePass123!',
                    address: 'Bole, Addis Ababa',
                });

            expect(res.statusCode).toBe(201);
            expect(res.body.message).toContain('registered successfully');
            expect(prisma.agency.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: expect.objectContaining({
                        name: 'Horizon HR Agency',
                        registrationNo: 'AG-5678',
                    }),
                })
            );
        });

        it('should reject registration with a duplicate registrationNo (400)', async () => {
            // Simulate existing agency
            prisma.agency.findUnique.mockResolvedValueOnce({ id: 'agency-existing' });

            const res = await request(app)
                .post('/api/agencies/register')
                .send({
                    name: 'Duplicate Agency',
                    registrationNo: 'AG-1234',
                    contactPhone: '+251911000002',
                    password: 'AnotherPass!',
                    address: 'Kazanchis, Addis Ababa',
                });

            expect(res.statusCode).toBe(400);
            expect(res.body.error).toMatch(/already exists/i);
            expect(prisma.agency.create).not.toHaveBeenCalled();
        });
    });

    // ── Login ─────────────────────────────────────────────────────────────────

    describe('POST /api/agencies/login', () => {
        it('should return a JWT token on valid credentials', async () => {
            prisma.agency.findUnique.mockResolvedValueOnce({
                id: 'agency-001',
                name: 'Selam Staffing Ltd',
                registrationNo: 'AG-1234',
                password: 'hashed_password_mock',
                isActive: true,
            });
            bcrypt.compare.mockResolvedValueOnce(true);

            const res = await request(app)
                .post('/api/agencies/login')
                .send({ registrationNo: 'AG-1234', password: 'SecurePass123!' });

            expect(res.statusCode).toBe(200);
            expect(res.body.token).toEqual(expect.any(String));
            expect(res.body.user.role).toBe('AGENCY');
        });

        it('should return 401 on wrong password', async () => {
            prisma.agency.findUnique.mockResolvedValueOnce({
                id: 'agency-001',
                password: 'hashed_password_mock',
                isActive: true,
            });
            bcrypt.compare.mockResolvedValueOnce(false);

            const res = await request(app)
                .post('/api/agencies/login')
                .send({ registrationNo: 'AG-1234', password: 'WrongPassword' });

            expect(res.statusCode).toBe(401);
            expect(res.body.error).toMatch(/invalid credentials/i);
        });

        it('should return 403 if agency account is suspended', async () => {
            prisma.agency.findUnique.mockResolvedValueOnce({
                id: 'agency-suspended',
                password: 'hashed_password_mock',
                isActive: false,
            });
            bcrypt.compare.mockResolvedValueOnce(true);

            const res = await request(app)
                .post('/api/agencies/login')
                .send({ registrationNo: 'AG-SUSP', password: 'AnyPass' });

            expect(res.statusCode).toBe(403);
            expect(res.body.error).toMatch(/suspended/i);
        });

        it('should return 401 for an unknown registrationNo', async () => {
            prisma.agency.findUnique.mockResolvedValueOnce(null);

            const res = await request(app)
                .post('/api/agencies/login')
                .send({ registrationNo: 'UNKNOWN', password: 'AnyPass' });

            expect(res.statusCode).toBe(401);
        });
    });

    // ── Fleet ─────────────────────────────────────────────────────────────────

    describe('GET /api/agencies/fleet', () => {
        it('should return the list of workers managed by the agency', async () => {
            prisma.jobSeeker.findMany.mockResolvedValue([
                { id: 'worker-1', fullName: 'Tigist Alemu', agencyId: 'agency-001', escrowContracts: [] },
                { id: 'worker-2', fullName: 'Meron Bekele', agencyId: 'agency-001', escrowContracts: [] },
            ]);

            const res = await request(app)
                .get('/api/agencies/fleet')
                .set('Authorization', `Bearer ${agencyToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.workers).toHaveLength(2);
            expect(res.body.workers[0].fullName).toBe('Tigist Alemu');
        });

        it('should return 401 without a valid token', async () => {
            const res = await request(app)
                .get('/api/agencies/fleet');

            expect(res.statusCode).toBe(401);
        });
    });
});
