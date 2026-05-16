const prisma = require('../utils/prisma');

/**
 * Phase 2: "Versatility" Protocol (Omnichannel Access)
 * 
 * Unified Webhook Controller for Telegram & WhatsApp
 * Handles incoming messages from bot platforms, parses intent (Accept Job, Update Availability),
 * and syncs with EDWL's Postgres Database in real-time.
 */

exports.handleWebhook = async (req, res) => {
  const { body } = req;
  const platform = req.headers['x-platform-source'] || 'telegram'; // Distinguish between WhatsApp & Telegram

  try {
    let chatId, userId, incomingText, callbackData;

    // 1. Normalize Payload (Example handles Telegram's structure)
    if (platform === 'telegram') {
      if (body.callback_query) {
        // Button click
        chatId = body.callback_query.message.chat.id.toString();
        callbackData = body.callback_query.data; // e.g. "ACCEPT_JOB_123"
      } else if (body.message) {
        // Text message
        chatId = body.message.chat.id.toString();
        incomingText = body.message.text;
      }
    } else if (platform === 'whatsapp') {
      // Parse Meta/WhatsApp Business API payload
      // chatId = body.entry[0].changes[0].value.messages[0].from;
      // ...
    }

    if (!chatId) return res.status(200).send('OK');

    // 2. Identify Worker by their Chat ID
    const worker = await prisma.jobSeeker.findUnique({
      where: { telegramChatId: chatId } // Adjust if WhatsApp phone number is used
    });

    if (!worker) {
      // Optionally trigger an SMS/Message asking them to link their account
      return res.status(200).send('OK'); 
    }

    // 3. Handle Intent
    if (callbackData) {
      if (callbackData.startsWith('ACCEPT_JOB_')) {
        const jobId = callbackData.split('_')[2];
        
        // Ensure job is still available and accept it
        await prisma.contract.create({
          data: {
            employerId: 'extracted_employer_id', // Would fetch from Job/Redis cache
            jobSeekerId: worker.id,
            jobPostId: jobId,
            status: 'PENDING_SIGNATURE',
            startDate: new Date(),
            salary: 0 // Fetch from JobPost
          }
        });

        // Notify employer via sockets/email that worker accepted
        // (Pseudocode): sendAlertToEmployer(jobId, worker.fullName);

        // Send confirmation back to worker
        // (Pseudocode): sendTelegramMessage(chatId, `✅ You have successfully accepted the job! The employer will be notified.`);
      }

      if (callbackData === 'UPDATE_AVAILABILITY_YES') {
        await prisma.jobSeeker.update({
          where: { id: worker.id },
          data: { isActive: true }
        });
        // (Pseudocode): sendTelegramMessage(chatId, '✅ Your profile is now marked as AVAILABLE and visible to employers.');
      }
    } else if (incomingText) {
      // Natural Language parsing (Can hook into Vertex AI / OpenAI from Phase 1)
      if (incomingText.toLowerCase().includes('available')) {
        await prisma.jobSeeker.update({
          where: { id: worker.id },
          data: { isActive: true }
        });
      } else if (incomingText.toLowerCase().includes('not available')) {
        await prisma.jobSeeker.update({
          where: { id: worker.id },
          data: { isActive: false }
        });
      }
    }

    res.status(200).send('Webhook Processed');

  } catch (error) {
    console.error('[Omnichannel Webhook] Error processing message:', error);
    res.status(500).send('Error');
  }
};
