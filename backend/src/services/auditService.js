const prisma = require('../utils/prisma');

/**
 * Log a system action for audit purposes
 * @param {string} action - Describe the action (e.g., 'PAYMENT_COMPLETED', 'USER_DELETED')
 * @param {string} userId - ID of the user performing or targeted by the action
 * @param {string} userType - 'JOB_SEEKER', 'EMPLOYER', or 'ADMIN'
 * @param {object} details - Additional metadata about the action
 * @param {string} ipAddress - Optional IP address of the requester
 */
const logAction = async (action, userId, userType, details = {}, ipAddress = null) => {
    try {
        await prisma.auditLog.create({
            data: {
                action,
                userId,
                userType,
                details: details || {},
                ipAddress
            }
        });
    } catch (error) {
        console.error('Audit Log Error:', error);
        // We don't want to crash the request if logging fails, 
        // but in a production environment, we should ensure this is reliable.
    }
};

module.exports = {
    logAction
};
