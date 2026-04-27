const request = require('supertest');
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');

// Mock Prisma
const { mockDeep, mockReset } = require('jest-mock-extended');
const prisma = require('../src/utils/prisma');
jest.mock('../src/utils/prisma', () => mockDeep());

const authRoutes = require('../src/routes/auth');
const app = express();
app.use(bodyParser.json());
app.use('/api/auth', authRoutes);

describe('Backend Duplicate Detection and Normalization', () => {
    beforeEach(() => {
        mockReset(prisma);
        jest.clearAllMocks();
    });

    test('normalizePhone should correctly format Ethiopian numbers', () => {
        const { normalizePhone } = require('../src/utils/validation');
        expect(normalizePhone('0912345678')).toBe('+251912345678');
        expect(normalizePhone('0712345678')).toBe('+251712345678');
        expect(normalizePhone('+251912345678')).toBe('+251912345678');
        expect(normalizePhone(' 0912 345 678 ')).toBe('+251912345678');
    });

    test('Login should work with non-normalized phone identification', async () => {
        prisma.jobSeeker.findFirst.mockResolvedValue({ 
            id: 1, 
            fullName: 'Test Seeker',
            phone: '+251912345678', 
            password: 'hashed_password',
            isActive: true 
        });
        
        // Mock bcrypt and jwt
        const bcrypt = require('bcrypt');
        const jwt = require('jsonwebtoken');
        jest.spyOn(bcrypt, 'compare').mockResolvedValue(true);
        jest.spyOn(jwt, 'sign').mockReturnValue('mock_token');

        const response = await request(app)
            .post('/api/auth/seeker/login')
            .send({
                identifier: '0912345678',
                password: 'password123'
            });

        expect(response.status).toBe(200);
        expect(prisma.jobSeeker.findFirst).toHaveBeenCalled();
    });
});
