const axios = require('axios');

class TranslationService {
    constructor() {
        this.googleApiKey = process.env.GOOGLE_TRANSLATE_API_KEY;
        // In the future, this can be extended to use Gemini API or other services.
    }

    /**
     * Translates text to the target language.
     * If the API key is missing, it mocks the translation.
     * @param {string} text 
     * @param {string} targetLang - Target language code (e.g., 'am' for Amharic, 'en' for English, 'ar' for Arabic)
     */
    async translate(text, targetLang = 'am') {
        // If no text, return empty
        if (!text) return { translatedText: '', detectedLanguage: 'unknown' };

        // Mock translation for testing or missing API keys
        if (!this.googleApiKey) {
            console.warn('[TranslationService] GOOGLE_TRANSLATE_API_KEY not found. Mocking translation.');
            
            // Basic heuristic to mock "detected" language based on character sets
            let detected = 'en';
            if (/[\u1200-\u137F]/.test(text)) detected = 'am'; // Amharic
            if (/[\u0600-\u06FF]/.test(text)) detected = 'ar'; // Arabic

            let mockTranslated = text;
            if (targetLang === 'am' && detected !== 'am') mockTranslated = `[AM] ${text}`;
            if (targetLang === 'en' && detected !== 'en') mockTranslated = `[EN] ${text}`;
            if (targetLang === 'ar' && detected !== 'ar') mockTranslated = `[AR] ${text}`;

            return {
                translatedText: mockTranslated,
                detectedLanguage: detected
            };
        }

        try {
            const response = await axios.post(
                `https://translation.googleapis.com/language/translate/v2?key=${this.googleApiKey}`,
                {
                    q: text,
                    target: targetLang
                }
            );

            const result = response.data.data.translations[0];
            return {
                translatedText: result.translatedText,
                detectedLanguage: result.detectedSourceLanguage
            };
        } catch (error) {
            console.error('[TranslationService] Translation API error:', error.response?.data || error.message);
            // Fallback to original text if translation fails
            return {
                translatedText: text,
                detectedLanguage: 'unknown'
            };
        }
    }
}

module.exports = new TranslationService();
