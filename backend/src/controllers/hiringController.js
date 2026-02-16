const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Save or Update Hiring Requirements
exports.createHiringRequirement = async (req, res) => {
    try {
        const { employerId, ...requirements } = req.body;

        if (!employerId) {
            return res.status(400).json({ success: false, error: "Employer ID is required" });
        }

        // This will create a new record or update the existing one for this employer
        const savedData = await prisma.hiringRequirement.upsert({
            where: { employerId: employerId },
            update: requirements,
            create: {
                employerId: employerId,
                ...requirements,
            },
        });

        res.status(200).json({
            success: true,
            message: "Hiring requirements saved successfully!",
            data: savedData,
        });
    } catch (error) {
        console.error("Prisma Error:", error);
        res.status(500).json({ success: false, error: "Failed to save requirements" });
    }
};