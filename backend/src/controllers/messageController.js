const prisma = require('../utils/prisma');
const telegramService = require('../services/telegramService');

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
            // First message authorization
            if (senderRole === 'EMPLOYER' && receiverType === 'JOB_SEEKER') {
                const employer = await prisma.employer.findUnique({ where: { id: senderId } });
                const worker = await prisma.jobSeeker.findUnique({ where: { id: receiverId } });

                // 1. Time Access Check
                if (!employer.subscriptionExpiry || new Date(employer.subscriptionExpiry) < new Date()) {
                    return res.status(403).json({
                        error: 'Action restricted',
                        message: 'Time Access Expired. Please renew your monthly subscription to initiate a conversation.',
                        upgradeRequired: 'TIME_EXTENSION'
                    });
                }

                // 2. Trust Access Check
                const employerTier = employer.tier || 'FREE';
                const workerTier = worker.tier || 'BRONZE';

                if (workerTier === 'PLATINUM' && employerTier !== 'PLATINUM_ACCESS') {
                    return res.status(403).json({
                        error: 'Action restricted',
                        message: 'Trust Access Required. Upgrade to Platinum Access to message this highly verified worker.',
                        upgradeRequired: 'PLATINUM_ACCESS'
                    });
                }

                if (workerTier === 'GOLD' && !['GOLD_ACCESS', 'PLATINUM_ACCESS'].includes(employerTier)) {
                    return res.status(403).json({
                        error: 'Action restricted',
                        message: 'Trust Access Required. Upgrade to Gold Access to message this verified worker.',
                        upgradeRequired: 'GOLD_ACCESS'
                    });
                }
            } else if (senderRole === 'JOB_SEEKER') {
                const user = await prisma.jobSeeker.findUnique({ where: { id: senderId } });
                if (user.tier === 'BRONZE') {
                    return res.status(403).json({
                        error: 'Action restricted',
                        message: 'Only verified Job Seekers (Silver and above) can initiate conversations.'
                    });
                }
            }
        }

        const message = await prisma.message.create({
            data: {
                content,
                senderJSId: senderRole === 'JOB_SEEKER' ? senderId : null,
                senderEmpId: senderRole === 'EMPLOYER' ? senderId : null,
                receiverJSId: receiverType === 'JOB_SEEKER' ? receiverId : null,
                receiverEmpId: receiverType === 'EMPLOYER' ? receiverId : null
            },
            include: {
                senderJS: { select: { fullName: true, profilePhoto: true } },
                senderEmp: { select: { contactName: true, profilePhoto: true } }
            }
        });

        // 🟢 Emit Real-time Socket Event
        const io = req.app.get('io');
        if (io) {
            io.to(receiverId).emit('new_message', message);
            console.log(`🚀 Emitted real-time message to room ${receiverId}`);
        }

        // 💬 Send Telegram Alert to Receiver (Proactive Betterment)
        try {
            const receiver = await prisma[receiverType === 'JOB_SEEKER' ? 'jobSeeker' : 'employer'].findUnique({
                where: { id: receiverId },
                select: { telegramChatId: true, fullName: receiverType === 'JOB_SEEKER', contactName: receiverType === 'EMPLOYER' }
            });

            if (receiver && receiver.telegramChatId) {
                const senderName = senderRole === 'JOB_SEEKER' ? message.senderJS.fullName : message.senderEmp.contactName;
                const telegramText = `📩 <b>New Message from ${senderName}</b>\n\n"${content.substring(0, 100)}${content.length > 100 ? '...' : ''}"\n\nReply here: https://edwl-ethio-domesticworkerslink.web.app/messages`;
                await telegramService.sendMessage(receiver.telegramChatId, telegramText);
            }
        } catch (alertError) {
            console.error('[Telegram Alert Error] Failed to notify message receiver:', alertError.message);
        }

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
