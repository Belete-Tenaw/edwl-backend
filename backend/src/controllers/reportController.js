const prisma = require('../utils/prisma');

exports.reportUser = async (req, res) => {
    try {
        const { reportedId, reportedType, reason } = req.body;
        const reporterId = req.user.id;
        const reporterRole = req.user.role;

        if (!reason || !reason.trim()) {
            return res.status(400).json({ error: 'Reason is required' });
        }

        const report = await prisma.report.create({
            data: {
                reporterJSId: reporterRole === 'JOB_SEEKER' ? reporterId : null,
                reporterEmpId: reporterRole === 'EMPLOYER' ? reporterId : null,
                reportedJSId: reportedType === 'seeker' ? reportedId : null,
                reportedEmpId: reportedType === 'employer' ? reportedId : null,
                reason: reason
            }
        });

        res.status(201).json({ message: 'Success', reportId: report.id });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getAllReports = async (req, res) => {
    try {
        const reports = await prisma.report.findMany({
            include: {
                reporterJS: { select: { fullName: true, phone: true } },
                reporterEmp: { select: { contactName: true, phone: true } },
                reportedJS: { select: { fullName: true, phone: true } },
                reportedEmp: { select: { contactName: true, phone: true } }
            },
            orderBy: { timestamp: 'desc' }
        });
        res.json(reports);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
