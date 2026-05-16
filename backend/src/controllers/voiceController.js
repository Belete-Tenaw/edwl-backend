const voiceService = require('../services/voiceService');
const prisma = require('../utils/prisma');

/**
 * Handle Voice Bio Upload & Transcription
 */
exports.processVoiceBio = async (req, res) => {
    try {
        const { userId, audioUrl, language } = req.body;

        if (!userId || !audioUrl) {
            return res.status(400).json({ error: 'User ID and Audio URL are required' });
        }

        // 1. Transcribe the audio
        const transcriptionResult = await voiceService.transcribeAudio(audioUrl, language || 'am');

        // 2. Extract profile data
        const extractedData = await voiceService.extractProfileFromVoice(transcriptionResult.text);

        // 3. Update JobSeeker profile
        const updatedUser = await prisma.jobSeeker.update({
            where: { id: userId },
            data: {
                voiceBioUrl: audioUrl,
                voiceBioTranscription: transcriptionResult,
                // Update skills if they were empty or found new ones
                skills: {
                    set: extractedData.skills.length > 0 ? extractedData.skills : undefined
                }
            }
        });

        res.status(200).json({
            message: 'Voice Bio processed successfully',
            transcription: transcriptionResult.text,
            extractedSkills: extractedData.skills,
            user: updatedUser
        });

    } catch (error) {
        console.error('[VoiceController Error]', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
