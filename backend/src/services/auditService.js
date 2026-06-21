const prisma = require('../utils/prisma');

/**
 * Log a system action for audit purposes
 * @param {string} action - Describe the action (e.g., 'PAYMENT_COMPLETED', 'USER_DELETED')
 * @param {string} userId - ID of the user performing or targeted by the action
 * @param {string} userType - 'JOB_SEEKER', 'EMPLOYER', or 'ADMIN'
 * @param {object} details - Additional metadata about the action
 * @param {string} ipAddress - Optional IP address of the requester
 */
const logAction = async (action, userId, userType, details = {}, ipAddress = null, txClient = null) => {
    try {
        let client = prisma;
        let actualIp = typeof ipAddress === 'string' ? ipAddress : null;

        // If the 5th argument is actually the Prisma transaction client
        if (ipAddress && typeof ipAddress === 'object' && typeof ipAddress.auditLog === 'object') {
            client = ipAddress;
        } else if (txClient && typeof txClient === 'object' && typeof txClient.auditLog === 'object') {
            client = txClient;
        }

        const data = {
            action,
            userType,
            details: details || {},
            ipAddress: actualIp
        };

        // Map userId to the correct specific field based on userType
        if (userType === 'JOB_SEEKER') {
            data.jobSeekerId = userId;
        } else if (userType === 'EMPLOYER') {
            data.employerId = userId;
        } else if (userType === 'ADMIN') {
            data.userId = userId;
        }

        const log = await client.auditLog.create({ data });
        
    } catch (error) {
        console.error('Audit Log Error:', error);
        // We don't want to crash the request if logging fails, 
        // but in a production environment, we should ensure this is reliable.
    }
};

module.exports = {
    logAction
};

