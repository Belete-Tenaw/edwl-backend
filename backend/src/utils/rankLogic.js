/**
 * Calculates the rank of a job seeker based on their uploaded documents.
 * 
 * BRONZE (Mandatory): Recent Photo AND (Renewed Kebele ID OR Renewed Passport/idDocument).
 * SILVER (Fast-Track): BRONZE + National ID (Fayda).
 * GOLD: SILVER + Guarantor's National ID and Phone Number.
 * PLATINUM: GOLD + Health Certificate AND Police Clearance.
 * 
 * @param {Object} worker - The job seeker object containing document URLs and phone numbers.
 * @returns {string} - The calculated rank (BRONZE, SILVER, GOLD, or PLATINUM).
 */
const calculateWorkerRank = (worker) => {
    const hasPhoto = !!worker.profilePhoto;
    const hasBaseId = !!worker.idDocument; // Used for Kebele ID or Passport

    // Mandatory check for Bronze
    if (!hasPhoto || !hasBaseId) {
        return 'BRONZE'; // In practice, registration should be blocked if these are missing
    }

    const hasFayda = !!worker.nationalIdUrl;
    const hasGuarantor = !!worker.guarantorIdUrl && !!worker.guarantorPhone;
    const hasHealthCert = !!worker.healthCertificateUrl;
    const hasPoliceClearance = !!worker.policeClearanceUrl;

    // Rank Progression
    if (hasFayda && hasGuarantor && hasHealthCert && hasPoliceClearance) {
        return 'PLATINUM';
    }

    if (hasFayda && hasGuarantor) {
        return 'GOLD';
    }

    if (hasFayda) {
        return 'SILVER';
    }

    return 'BRONZE';
};

module.exports = {
    calculateWorkerRank
};
