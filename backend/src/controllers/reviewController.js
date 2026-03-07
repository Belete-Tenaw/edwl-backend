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

        res.status(201).json({ message: "Review submitted successfully!", review: newReview });
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
