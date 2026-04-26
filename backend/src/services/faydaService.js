/**
 * Fayda National ID Verification Service (Zero-Cost Implementation)
 * This service verifies the format of the Fayda ID and flags it for Admin review.
 * It omits paid SMS/OTP bridges to ensure 0 operational cost.
 */

/**
 * Validates the Fayda ID format.
 * No cost incurred.
 * 
 * @param {string} faydaId - The 12-digit National ID.
 * @returns {Promise<Object>} - Success message or error.
 */
exports.requestOTP = async (faydaId) => {
    // Basic validation: Fayda IDs are 12 digits
    if (!faydaId || faydaId.length !== 12 || !/^\d+$/.test(faydaId)) {
        throw new Error("Invalid Fayda ID format. Must be 12 digits.");
    }

    // In 'Zero-Cost' mode, we acknowledge the ID and inform the user 
    // that their uploaded document will be cross-referenced by the Admin.
    return {
        success: true,
        message: "National ID recognized. Please ensure your uploaded ID document is clear for Admin verification.",
        smartVerification: true
    };
};

/**
 * MOCK Verification for the frontend to proceed.
 * In production 0-cost mode, the actual "Trust" is granted by Admin review.
 */
exports.verifyOTP = async (faydaId, otpCode) => {
    // In Zero-Cost mode, any submission with valid ID format proceeds to 'Pending Admin Review'
    if (!faydaId || faydaId.length !== 12) {
        throw new Error("Invalid Fayda ID.");
    }

    return {
        success: true,
        faydaData: {
            fullName: "Document Verification Pending",
            faydaId: faydaId,
            verifiedAt: new Date().toISOString(),
            isZeroCost: true
        }
    };
};
