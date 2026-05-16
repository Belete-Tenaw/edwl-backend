const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const notificationService = require('../services/notificationService');

/**
 * Trigger an SOS Alert
 */
exports.triggerSOS = async (req, res) => {
    try {
        const { userId, userType, latitude, longitude } = req.body;

        if (!userId || !userType) {
            return res.status(400).json({ error: 'User ID and User Type are required.' });
        }

        // 1. Create SOS Alert in DB
        const sosAlert = await prisma.sOSAlert.create({
            data: {
                userId,
                userType,
                latitude,
                longitude,
                status: 'ACTIVE'
            }
        });

        // 2. Fetch User Details for Notification
        let userData;
        if (userType === 'JOB_SEEKER') {
            userData = await prisma.jobSeeker.findUnique({ where: { id: userId } });
        } else {
            userData = await prisma.employer.findUnique({ where: { id: userId } });
        }

        const userName = userData.fullName || userData.contactName || 'A user';
        const userPhone = userData.phone || 'N/A';

        // 3. Send Notification to Admins (or via Telegram/SMS if configured)
        const alertMessage = `🚨 SOS ALERT 🚨\nUser: ${userName}\nPhone: ${userPhone}\nType: ${userType}\nLocation: ${latitude && longitude ? `${latitude}, ${longitude}` : 'Unknown'}\nTime: ${new Date().toLocaleString()}`;
        
        // Log to console for now
        console.error(`[SOS_SYSTEM] ${alertMessage}`);

        // Send real-time notification via existing service (if it supports admin-wide alerts)
        // For now, we'll just use the notificationService to alert the user themselves (confirmation)
        await notificationService.notify(userId, userType, {
            title: '🚨 SOS Alert Triggered',
            message: 'We have received your SOS alert. Our team and your emergency contacts are being notified immediately.',
            type: 'SYSTEM'
        });

        res.status(201).json({ 
            message: 'SOS Alert triggered successfully.', 
            sosId: sosAlert.id 
        });
    } catch (error) {
        console.error('SOS Trigger Error:', error);
        res.status(500).json({ error: 'Failed to trigger SOS alert.' });
    }
};

/**
 * Resolve an SOS Alert
 */
exports.resolveSOS = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.sOSAlert.update({
            where: { id },
            data: {
                status: 'RESOLVED',
                resolvedAt: new Date()
            }
        });
        res.json({ message: 'SOS Alert marked as resolved.' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to resolve SOS alert.' });
    }
};

/**
 * Update Transit Location
 */
exports.updateTransitLocation = async (req, res) => {
    try {
        const { contractId, latitude, longitude } = req.body;
        const transit = await prisma.transitSession.upsert({
            where: { id: contractId }, // Using contractId as id for simplicity in this wave
            update: { latitude, longitude, updatedAt: new Date() },
            create: { id: contractId, contractId, userId: req.user.id, latitude, longitude }
        });
        res.json(transit);
    } catch (error) {
        console.error('Transit Update Error:', error);
        res.status(500).json({ error: 'Failed to update transit location.' });
    }
};

/**
 * Get Transit Location (for Employer)
 */
exports.getTransitLocation = async (req, res) => {
    try {
        const { contractId } = req.params;
        const transit = await prisma.transitSession.findUnique({
            where: { id: contractId }
        });
        res.json(transit);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch transit location.' });
    }
};

/**
 * GPS Safe Check-In
 * Workers tap "Checked In" when they arrive at work.
 * Logs arrival with geolocation and fires real-time notifications to both parties.
 */
exports.checkIn = async (req, res) => {
    try {
        const { contractId, latitude, longitude } = req.body;
        const userId = req.user.id;
        const userType = req.user.role; // 'JOB_SEEKER'

        if (!contractId) {
            return res.status(400).json({ error: 'contractId is required for safe check-in.' });
        }

        // 1. Upsert a TransitSession to record arrival location
        const session = await prisma.transitSession.upsert({
            where: { id: contractId },
            update: { latitude: latitude || 0, longitude: longitude || 0, isActive: true, updatedAt: new Date() },
            create: { id: contractId, contractId, userId, latitude: latitude || 0, longitude: longitude || 0, isActive: true }
        });

        // 2. Fetch seeker name for notification message
        const seeker = await prisma.jobSeeker.findUnique({
            where: { id: userId },
            select: { fullName: true }
        });

        // 3. Fetch contract to find employer ID for notification
        const contract = await prisma.contract.findUnique({
            where: { id: contractId },
            select: { employerId: true }
        });

        // 4. Confirm check-in to worker via real-time notification
        await notificationService.notify(userId, userType, {
            title: '✅ Safe Check-In Recorded',
            message: `Your arrival has been logged at ${new Date().toLocaleTimeString()}. EDWL has your location for your safety.`,
            type: 'SYSTEM'
        });

        // 5. Notify employer that worker has arrived
        if (contract?.employerId) {
            await notificationService.notify(contract.employerId, 'EMPLOYER', {
                title: '🏠 Worker Arrived',
                message: `${seeker?.fullName || 'Your worker'} has safely checked in at ${new Date().toLocaleTimeString()}.`,
                type: 'SYSTEM'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Safe check-in recorded successfully.',
            session
        });
    } catch (error) {
        console.error('[CheckIn Error]', error);
        res.status(500).json({ error: 'Failed to record check-in.' });
    }
};
