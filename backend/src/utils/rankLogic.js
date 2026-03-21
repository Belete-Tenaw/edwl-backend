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
    // Mandatory check for Bronze
    if (!hasPhoto || !hasBaseId) {
        return 'BRONZE';
    }

    const hasFayda = (!!worker.nationalIdUrl && worker.nationalIdUrl !== '') || worker.isFaydaVerified === true;
    const hasGuarantor = !!worker.guarantorIdUrl && !!worker.guarantorPhone && worker.guarantorIdUrl !== '';
    const hasHealthCert = !!worker.healthCertificateUrl && worker.healthCertificateUrl !== '';
    const hasPoliceClearance = !!worker.policeClearanceUrl && worker.policeClearanceUrl !== '';

    // Rank Progression (Strict waterfall)
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
