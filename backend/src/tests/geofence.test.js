const request = require('supertest');
const app = require('../server');
const prisma = require('../utils/prisma');
const jwt = require('jsonwebtoken');
const notificationService = require('../services/notificationService');
const telegramService = require('../services/telegramService');

jest.mock('../utils/prisma', () => ({
    geofenceConfig: {
        upsert: jest.fn(),
        findUnique: jest.fn(),
    },
    transitSession: {
        upsert: jest.fn(),
    },
    contract: {
        findUnique: jest.fn(),
    },
    sOSAlert: {
        findFirst: jest.fn(),
        create: jest.fn(),
    },
    jobSeeker: {
        findUnique: jest.fn(),
    },
    employer: {
        findUnique: jest.fn(),
    }
}));

jest.mock('../services/notificationService', () => ({
    init: jest.fn(),
    notify: jest.fn(),
}));

jest.mock('../services/telegramService', () => ({
    notifyAdmin: jest.fn().mockResolvedValue({}),
}));

describe('Transit Geofencing & Safety alerts', () => {
    const token = jwt.sign({ id: 'seeker-123', role: 'JOB_SEEKER' }, process.env.JWT_SECRET || 'test_secret');

    beforeEach(() => {
        jest.clearAllMocks();
        prisma.jobSeeker.findUnique.mockResolvedValue({ id: 'seeker-123', isActive: true, tier: 'BRONZE' });
    });

    it('should successfully configure a geofence', async () => {
        const mockConfig = {
            id: 'geo-1',
            transitSessionId: 'contract-123',
            startLatitude: 9.01,
            startLongitude: 38.75,
            endLatitude: 9.03,
            endLongitude: 38.78,
            allowedDeviation: 0.005,
            isActive: true
        };

        prisma.geofenceConfig.upsert.mockResolvedValue(mockConfig);

        const res = await request(app)
            .post('/api/safety/geofence')
            .set('Authorization', `Bearer ${token}`)
            .send({
                transitSessionId: 'contract-123',
                startLatitude: 9.01,
                startLongitude: 38.75,
                endLatitude: 9.03,
                endLongitude: 38.78,
                allowedDeviation: 0.005
            });

        expect(res.statusCode).toEqual(201);
        expect(res.body.success).toBe(true);
        expect(res.body.config.transitSessionId).toEqual('contract-123');
    });

    it('should update location without alert when inside allowed deviation', async () => {
        prisma.transitSession.upsert.mockResolvedValue({
            id: 'contract-123',
            latitude: 9.015,
            longitude: 38.755
        });

        // Config path from (9.01, 38.75) to (9.03, 38.78). Current (9.015, 38.755) is right along the path.
        prisma.geofenceConfig.findUnique.mockResolvedValue({
            transitSessionId: 'contract-123',
            startLatitude: 9.01,
            startLongitude: 38.75,
            endLatitude: 9.03,
            endLongitude: 38.78,
            allowedDeviation: 0.005,
            isActive: true
        });

        const res = await request(app)
            .post('/api/safety/transit-update')
            .set('Authorization', `Bearer ${token}`)
            .send({
                contractId: 'contract-123',
                latitude: 9.015,
                longitude: 38.755
            });

        expect(res.statusCode).toEqual(200);
        expect(res.body.deviationAlert).toBeNull();
        expect(notificationService.notify).not.toHaveBeenCalled();
    });

    it('should trigger alert and notifications when worker deviates beyond allowed bounds', async () => {
        prisma.transitSession.upsert.mockResolvedValue({
            id: 'contract-123',
            latitude: 9.10, // Far north from the path
            longitude: 38.75
        });

        prisma.geofenceConfig.findUnique.mockResolvedValue({
            transitSessionId: 'contract-123',
            startLatitude: 9.01,
            startLongitude: 38.75,
            endLatitude: 9.03,
            endLongitude: 38.78,
            allowedDeviation: 0.005,
            isActive: true
        });

        prisma.contract.findUnique.mockResolvedValue({
            id: 'contract-123',
            employer: { id: 'employer-456', contactName: 'Almaz' },
            jobSeeker: { id: 'seeker-123', fullName: 'Chala', phone: '0911223344' }
        });

        prisma.sOSAlert.findFirst.mockResolvedValue(null); // No recent alerts
        prisma.sOSAlert.create.mockResolvedValue({
            id: 'sos-999',
            userId: 'seeker-123',
            status: 'ACTIVE'
        });

        const res = await request(app)
            .post('/api/safety/transit-update')
            .set('Authorization', `Bearer ${token}`)
            .send({
                contractId: 'contract-123',
                latitude: 9.10,
                longitude: 38.75
            });

        expect(res.statusCode).toEqual(200);
        expect(res.body.deviationAlert).not.toBeNull();
        expect(res.body.deviationAlert.id).toEqual('sos-999');

        // Verify Notifications
        expect(notificationService.notify).toHaveBeenCalledTimes(2);
        // Employer Notification
        expect(notificationService.notify).toHaveBeenCalledWith('employer-456', 'EMPLOYER', expect.objectContaining({
            title: '🚨 Transit Route Deviation',
        }));
        // Seeker Notification
        expect(notificationService.notify).toHaveBeenCalledWith('seeker-123', 'JOB_SEEKER', expect.objectContaining({
            title: '⚠️ Geofence Alert Triggered',
        }));
    });
});
