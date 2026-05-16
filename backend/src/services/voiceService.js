const prisma = require('../utils/prisma');

class VoiceService {
    /**
     * Simulated Voice Transcription
     * In production, this would use Google Cloud Speech-to-Text or OpenAI Whisper.
     * For EDWL, we provide a placeholder that mimics high-quality transcription.
     */
    async transcribeAudio(audioUrl, language = 'am') {
        console.log(`[VoiceService] Transcribing audio from: ${audioUrl} in ${language}...`);
        
        // Simulating network delay
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Heuristic simulation based on file path or metadata
        // In a real scenario, the file would be processed by an AI model.
        let transcription = "እኔ ጎበዝ ሰራተኛ ነኝ። ምግብ ማብሰል እና ህጻናት መንከባከብ እችላለሁ። ታማኝ ነኝ።"; // Example Amharic
        
        if (language === 'en') {
            transcription = "I am a skilled domestic worker with 5 years of experience. I specialize in childcare and traditional Ethiopian cuisine. I am seeking a live-in position.";
        }

        return {
            text: transcription,
            confidence: 0.98,
            language: language,
            words: transcription.split(' ').length,
            durationSec: 30
        };
    }

    /**
     * Map Voice Bio to Profile Fields
     * Uses NLP to extract skills, experience, and preferences from a transcription.
     */
    async extractProfileFromVoice(transcription) {
        const text = transcription.toLowerCase();
        const extracted = {
            skills: [],
            experienceYears: 0,
            preferences: []
        };

        if (text.includes('childcare') || text.includes('ህጻናት')) extracted.skills.push('Childcare');
        if (text.includes('cooking') || text.includes('ምግብ')) extracted.skills.push('Cooking');
        if (text.includes('cleaning') || text.includes('ጽዳት')) extracted.skills.push('Cleaning');

        const expMatch = text.match(/(\d+)\s+(years|አመት)/);
        if (expMatch) extracted.experienceYears = parseInt(expMatch[1]);

        return extracted;
    }
}

module.exports = new VoiceService();
