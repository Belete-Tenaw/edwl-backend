const prisma = require('../utils/prisma');

exports.sendMessage = async (req, res) => {
    try {
        const { receiverId, receiverType, content } = req.body;
        const senderId = req.user.id;
        const senderRole = req.user.role;

        if (!content || !content.trim()) {
            return res.status(400).json({ error: 'Message content cannot be empty' });
        }

        if (!receiverId) {
            return res.status(400).json({ error: 'Receiver ID is required' });
        }

        // Check if user is subscriber if it's the first message
        const existingChat = await prisma.message.findFirst({
            where: {
                OR: [
                    {
                        AND: [
                            senderRole === 'JOB_SEEKER' ? { senderJSId: senderId } : { senderEmpId: senderId },
                            receiverType === 'JOB_SEEKER' ? { receiverJSId: receiverId } : { receiverEmpId: receiverId }
                        ]
                    },
                    {
                        AND: [
                            receiverType === 'JOB_SEEKER' ? { senderJSId: receiverId } : { senderEmpId: receiverId },
                            senderRole === 'JOB_SEEKER' ? { receiverJSId: senderId } : { receiverEmpId: senderId }
                        ]
                    }
                ]
            }
        });

        if (!existingChat) {
            // First message, must be subscriber
            let user;
            if (senderRole === 'JOB_SEEKER') {
                user = await prisma.jobSeeker.findUnique({ where: { id: senderId } });
            } else {
                user = await prisma.employer.findUnique({ where: { id: senderId } });
            }

            if (user.tier !== 'SUBSCRIBER') {
                return res.status(403).json({
                    error: 'Action restricted',
                    message: 'Only premium subscribers can initiate a conversation. Upgrade to Premium to contact users.'
                });
            }
        }

        const message = await prisma.message.create({
            data: {
                content,
                senderJSId: senderRole === 'JOB_SEEKER' ? senderId : null,
                senderEmpId: senderRole === 'EMPLOYER' ? senderId : null,
                receiverJSId: receiverType === 'JOB_SEEKER' ? receiverId : null,
                receiverEmpId: receiverType === 'EMPLOYER' ? receiverId : null
            }
        });

        res.status(201).json(message);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getMessages = async (req, res) => {
    try {
        const userId = req.user.id;
        const userRole = req.user.role;

        const messages = await prisma.message.findMany({
            where: {
                OR: [
                    userRole === 'JOB_SEEKER' ? { senderJSId: userId } : { senderEmpId: userId },
                    userRole === 'JOB_SEEKER' ? { receiverJSId: userId } : { receiverEmpId: userId }
                ]
            },
            include: {
                senderJS: { select: { fullName: true, profilePhoto: true } },
                senderEmp: { select: { contactName: true, profilePhoto: true } },
                receiverJS: { select: { fullName: true, profilePhoto: true } },
                receiverEmp: { select: { contactName: true, profilePhoto: true } }
            },
            orderBy: { timestamp: 'asc' }
        });

        res.json(messages);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
