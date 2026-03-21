/**
 * Fayda National ID Verification Service (Mock Implementation)
 */

/**
 * Requests an OTP for a given Fayda ID.
 * In a real scenario, this would call the NIDP (National ID Program) API
 * which would then send an SMS to the phone number linked to the ID.
 * 
 * @param {string} faydaId - The 12-digit National ID.
 * @returns {Promise<Object>} - Success message or error.
 */
exports.requestOTP = async (faydaId) => {
    // Basic validation: Fayda IDs are typically 12 characters
    if (!faydaId || faydaId.length !== 12 || !/^\d+$/.test(faydaId)) {
        throw new Error("Invalid Fayda ID format. Must be 12 digits.");
    }

    // Simulate network delay to NIDP API
    await new Promise(resolve => setTimeout(resolve, 1000));

    console.log(`[FaydaService] OTP Requested for ID: ${faydaId}`);
    
    // In dev mode, we just return success. 
    // The "actual" OTP sent to the user's phone would be verified in verifyOTP.
    return {
        success: true,
        message: "OTP sent to the phone number linked with your Fayda ID."
    };
};

/**
 * Verifies the OTP provided by the user for a specific Fayda ID.
 * 
 * @param {string} faydaId - The 12-digit National ID.
 * @param {string} otpCode - The 6-digit OTP code.
 * @returns {Promise<Object>} - Success Boolean and metadata.
 */
exports.verifyOTP = async (faydaId, otpCode) => {
    // Basic validation
    if (!faydaId || faydaId.length !== 12) {
        throw new Error("Invalid Fayda ID.");
    }

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));

    // Hardcoded success for development
    if (otpCode === "123456") {
        return {
            success: true,
            faydaData: {
                fullName: "Verified Fayda User", // In production, this data comes from NIDP
                faydaId: faydaId,
                verifiedAt: new Date().toISOString()
            }
        };
    }

    return {
        success: false,
        message: "Invalid OTP code. Please try again."
    };
};
