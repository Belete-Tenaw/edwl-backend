const request = require('supertest');
const express = require('express');
const bodyParser = require('body-parser');

process.env.JWT_SECRET = 'test_secret';

// Mock the prisma utility BEFORE requiring routes/controllers
const mPrisma = {
    jobSeeker: {
        findFirst: jest.fn(),
        create: jest.fn(),
    },
    $disconnect: jest.fn(),
};

jest.mock('../utils/prisma', () => mPrisma);

const authRoutes = require('../routes/auth');
const app = express();
app.use(bodyParser.json());
app.use('/api/auth', authRoutes);

describe('Auth Endpoints', () => {

    // We are mocking at the unit/integration level without a real DB to keep it fast.
    // We import the same mocked instance to assert on it.
    const prisma = require('../utils/prisma');

    it('should register a new job seeker', async () => {
        prisma.jobSeeker.findFirst.mockResolvedValue(null);
        prisma.jobSeeker.create.mockResolvedValue({
            id: '123',
            fullName: 'Test User',
            email: 'test@example.com',
            role: 'JOB_SEEKER'
        });

        const res = await request(app)
            .post('/api/auth/register/seeker')
            .send({
                fullName: 'Test User',
                gender: 'MALE',
                age: 25,
                phone: '0911234567',
                email: 'test@example.com',
                password: 'password123',
                experienceYears: 2,
                expectedSalary: 5000,
                preferredLocation: 'Addis Ababa',
                preferredArrangement: 'LIVE_OUT'
            });

        expect(res.statusCode).toEqual(201);
        expect(res.body).toHaveProperty('token');
        expect(res.body.user).toHaveProperty('id');
    });

    it('should fail with missing fields', async () => {
        const res = await request(app)
            .post('/api/auth/register/seeker')
            .send({
                fullName: 'Test User'
                // Missing other required fields
            });

        expect(res.statusCode).toEqual(400);
        expect(res.body.error).toContain('Missing required fields');
    });
});
