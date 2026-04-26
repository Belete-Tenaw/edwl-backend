const prisma = require('../utils/prisma');

// Create a review
exports.createReview = async (req, res) => {
    try {
        const { rating, comment, targetId, targetType, contractId } = req.body;
        const reviewerId = req.user.userId;
        const reviewerRole = req.user.role; // 'seeker' or 'employer'

        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({ error: "Rating must be between 1 and 5." });
        }

        if (!targetId || !targetType) {
            return res.status(400).json({ error: "Target ID and Type are required." });
        }

        const data = {
            rating: parseInt(rating),
            comment,
            contractId
        };

        // --- Verified Hire Logic ---
        if (contractId) {
            const contract = await prisma.contract.findUnique({
                where: { id: contractId }
            });

            if (contract && contract.status === 'COMPLETED') {
                // Verify the reviewer was part of this contract
                const isJSReviewer = reviewerRole === 'seeker' && contract.jobSeekerId === reviewerId;
                const isEmpReviewer = reviewerRole === 'employer' && contract.employerId === reviewerId;

                if (isJSReviewer || isEmpReviewer) {
                    data.isVerified = true;
                }
            }
        }

        // Set reviewer
        if (reviewerRole === 'seeker') {
            data.reviewerJSId = reviewerId;
        } else {
            data.reviewerEmpId = reviewerId;
        }

        // Set target
        if (targetType === 'seeker') {
            data.targetJSId = targetId;
        } else {
            data.targetEmpId = targetId;
        }

        const newReview = await prisma.review.create({ data });

        // --- Behavioral & Rating Sync ---
        (async () => {
            try {
                const targetModel = targetType === 'seeker' ? 'jobSeeker' : 'employer';
                const reviews = await prisma.review.findMany({
                    where: targetType === 'seeker' ? { targetJSId: targetId } : { targetEmpId: targetId },
                    select: { rating: true }
                });

                const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
                const avgRating = totalRating / reviews.length;

                // Behavior Score Bonus for good reviews
                let behaviorChange = 0;
                if (rating >= 5) behaviorChange = 5;
                else if (rating <= 2) behaviorChange = -5;

                const targetUser = await prisma[targetModel].findUnique({
                    where: { id: targetId },
                    select: { behaviorScore: true }
                });

                const newBehaviorScore = Math.max(0, Math.min(100, (targetUser?.behaviorScore || 50) + behaviorChange));

                await prisma[targetModel].update({
                    where: { id: targetId },
                    data: {
                        rating: avgRating,
                        behaviorScore: newBehaviorScore,
                        completedJobs: reviews.length // Simple proxy for verified hires
                    }
                });
            } catch (err) {
                console.error('[Review Sync Error]:', err.message);
            }
        })();

        res.status(201).json({ 
            message: "Review submitted successfully!", 
            review: newReview 
        });
    } catch (error) {
        console.error("Error creating review:", error);
        res.status(500).json({ error: "Failed to submit review." });
    }
};

// Get reviews for a specific user (JS or Emp)
exports.getUserReviews = async (req, res) => {
    try {
        const { userId, userType } = req.params;

        const where = {};
        if (userType === 'seeker') {
            where.targetJSId = userId;
        } else {
            where.targetEmpId = userId;
        }

        const reviews = await prisma.review.findMany({
            where,
            include: {
                reviewerJS: {
                    select: { fullName: true, profilePhoto: true }
                },
                reviewerEmp: {
                    select: { contactName: true, profilePhoto: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        res.json(reviews);
    } catch (error) {
        console.error("Error fetching reviews:", error);
        res.status(500).json({ error: "Failed to fetch reviews." });
    }
};
