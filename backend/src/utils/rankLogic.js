/**
 * Calculates a numerical 100-point Trust Score and maps it to a Tier.
 * Inspired by global reliability scoring systems.
 * 
 * Score breakdown:
 * - Base Profile (Photo + ID): 20 pts (Bronze Threshold)
 * - Fayda National ID (Verified): 40 pts (Silver Threshold)
 * - Guarantor Vetting: 20 pts (Gold Threshold)
 * - Health & Police Clearance: 20 pts (Platinum Threshold: 100 pts)
 * 
 * @param {Object} worker - The job seeker object
 * @returns {string} - The calculated rank (BRONZE, SILVER, GOLD, or PLATINUM).
 */
const calculateTrustScore = (worker) => {
    let score = 0;

    // 1. Base Credentials (20 pts)
    if (worker.profilePhoto) score += 10;
    if (worker.idDocument) score += 10;

    // 2. National Trust (40 pts)
    if (worker.isFaydaVerified === true || (worker.nationalIdUrl && worker.nationalIdUrl !== '')) {
        score += 40;
    }

    // 3. Social/Guarantor Trust (20 pts)
    if (worker.guarantorIdUrl && worker.guarantorPhone) {
        score += 20;
    }

    // 4. Professional Compliance (20 pts)
    if (worker.healthCertificateUrl) score += 10;
    if (worker.policeClearanceUrl) score += 10;

    return Math.min(score, 100);
};

const calculateWorkerRank = (worker) => {
    const score = calculateTrustScore(worker);

    if (score >= 100) return 'PLATINUM';
    if (score >= 80) return 'GOLD';
    if (score >= 60) return 'SILVER';
    return 'BRONZE';
};

module.exports = {
    calculateTrustScore,
    calculateWorkerRank
};
