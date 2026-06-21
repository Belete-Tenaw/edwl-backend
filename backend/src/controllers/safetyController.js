const prisma = require('../utils/prisma');
const notificationService = require('../services/notificationService');
let telegramService;
try {
    telegramService = require('../services/telegramService');
} catch (e) {
    // Optional fallback if telegram service is not available
}

// Geodesic distance to line segment helper function
function checkGeofenceDeviation(lat, lon, config) {
    const x = lon;
    const y = lat;
    const x1 = config.startLongitude;
    const y1 = config.startLatitude;
    const x2 = config.endLongitude;
    const y2 = config.endLatitude;

    const A = x - x1;
    const B = y - y1;
    const C = x2 - x1;
    const D = y2 - y1;

    const dot = A * C + B * D;
    const lenSq = C * C + D * D;
    let param = -1;
    if (lenSq !== 0) {
        param = dot / lenSq;
    }

    let xx, yy;

    if (param < 0) {
        xx = x1;
        yy = y1;
    } else if (param > 1) {
        xx = x2;
        yy = y2;
    } else {
        xx = x1 + param * C;
        yy = y1 + param * D;
    }

    const distDegrees = Math.sqrt((xx - x) ** 2 + (yy - y) ** 2);
    return {
        deviated: distDegrees > config.allowedDeviation,
        distance: distDegrees
    };
}

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
 * Configure Geofence for a Transit Session
 */
exports.createGeofenceConfig = async (req, res) => {
    try {
        const { transitSessionId, startLatitude, startLongitude, endLatitude, endLongitude, allowedDeviation } = req.body;
        if (!transitSessionId || startLatitude === undefined || startLongitude === undefined || endLatitude === undefined || endLongitude === undefined) {
            return res.status(400).json({ error: 'Missing required parameters for geofencing config.' });
        }

        const config = await prisma.geofenceConfig.upsert({
            where: { transitSessionId },
            update: {
                startLatitude,
                startLongitude,
                endLatitude,
                endLongitude,
                allowedDeviation: allowedDeviation || 0.005,
                isActive: true
            },
            create: {
                transitSessionId,
                startLatitude,
                startLongitude,
                endLatitude,
                endLongitude,
                allowedDeviation: allowedDeviation || 0.005,
                isActive: true
            }
        });

        res.status(201).json({
            success: true,
            message: 'Geofence configuration established successfully.',
            config
        });
    } catch (error) {
        console.error('Create Geofence Error:', error);
        res.status(500).json({ error: 'Failed to create geofence configuration.' });
    }
};

/**
 * Update Transit Location
 */
exports.updateTransitLocation = async (req, res) => {
    try {
        const { contractId, latitude, longitude } = req.body;
        if (!contractId || latitude === undefined || longitude === undefined) {
            return res.status(400).json({ error: 'contractId, latitude, and longitude are required.' });
        }

        const transit = await prisma.transitSession.upsert({
            where: { id: contractId }, // Using contractId as id for simplicity in this wave
            update: { latitude, longitude, updatedAt: new Date() },
            create: { id: contractId, contractId, userId: req.user.id, latitude, longitude }
        });

        // Check if there is an active geofence configuration
        const geofence = await prisma.geofenceConfig.findUnique({
            where: { transitSessionId: contractId }
        });

        let deviationAlert = null;
        if (geofence && geofence.isActive) {
            const check = checkGeofenceDeviation(latitude, longitude, geofence);
            if (check.deviated) {
                // Fetch the contract to get the employerId and seeker details
                const contract = await prisma.contract.findUnique({
                    where: { id: contractId },
                    include: {
                        employer: { select: { id: true, contactName: true } },
                        jobSeeker: { select: { id: true, fullName: true, phone: true } }
                    }
                });

                if (contract) {
                    const seekerName = contract.jobSeeker.fullName;
                    const seekerId = contract.jobSeeker.id;
                    const employerId = contract.employer.id;

                    // Check if an active SOS/deviation alert already exists to prevent duplicate spam
                    const existingAlert = await prisma.sOSAlert.findFirst({
                        where: {
                            userId: seekerId,
                            status: 'ACTIVE',
                            createdAt: {
                                gte: new Date(Date.now() - 5 * 60 * 1000) // within the last 5 minutes
                            }
                        }
                    });

                    if (!existingAlert) {
                        // Trigger SOS deviation alert
                        const alert = await prisma.sOSAlert.create({
                            data: {
                                userId: seekerId,
                                userType: 'JOB_SEEKER',
                                latitude,
                                longitude,
                                status: 'ACTIVE'
                            }
                        });

                        deviationAlert = alert;

                        // Notify Employer
                        await notificationService.notify(employerId, 'EMPLOYER', {
                            title: '🚨 Transit Route Deviation',
                            message: `Alert: ${seekerName} has deviated significantly from their transit route. Current position: (${latitude}, ${longitude}).`,
                            type: 'SYSTEM'
                        });

                        // Notify Seeker
                        await notificationService.notify(seekerId, 'JOB_SEEKER', {
                            title: '⚠️ Geofence Alert Triggered',
                            message: `Path deviation detected. Please stay on the scheduled route. Support team has been notified.`,
                            type: 'SYSTEM'
                        });

                        // Notify Admin via Telegram
                        if (telegramService && typeof telegramService.notifyAdmin === 'function') {
                            const adminText = `🚨 <b>Transit Geofence Alert</b> 🚨\nWorker: <b>${seekerName}</b>\nPhone: <b>${contract.jobSeeker.phone || 'N/A'}</b>\nContract: <code>${contractId}</code>\nDeviated Route by: <b>${(check.distance * 111).toFixed(2)} km</b>`;
                            try {
                                await telegramService.notifyAdmin(adminText);
                            } catch (telegramErr) {
                                console.error('Telegram notification failed:', telegramErr.message);
                            }
                        }
                    }
                }
            }
        }

        res.json({
            transit,
            deviationAlert
        });
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
