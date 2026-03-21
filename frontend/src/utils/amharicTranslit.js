/**
 * A basic phonetic transliteration utility for Amharic (Ethiopic).
 * This maps Latin characters to their Amharic equivalents.
 * 
 * Rules:
 * - base + vowel (e.g., 'm' + 'e' -> 'መ')
 * - double vowels or specific combinations (e.g., 'm' + 'ee' -> 'ሜ')
 */

const mapping = {
    'h': ['ሀ', 'ሁ', 'ሂ', 'ሃ', 'ሄ', 'ህ', 'ሆ'],
    'l': ['ለ', 'ሉ', 'ሊ', 'ላ', 'ሌ', 'ል', 'ሎ'],
    'm': ['መ', 'ሙ', 'ሚ', 'ማ', 'ሜ', 'ም', 'ሞ'],
    'r': ['ረ', 'ሩ', 'ሪ', 'ራ', 'ሬ', 'ር', 'ሮ'],
    's': ['ሰ', 'ሱ', 'ሲ', 'ሳ', 'ሴ', 'ስ', 'ሶ'],
    'sh': ['ሸ', 'ሹ', 'ሺ', 'ሻ', 'ሼ', 'ሽ', 'ሾ'],
    'q': ['ቀ', 'ቁ', 'ቂ', 'ቃ', 'ቄ', 'ቅ', 'ቆ'],
    'b': ['በ', 'ቡ', 'ቢ', 'ባ', 'ቤ', 'ብ', 'ቦ'],
    't': ['ተ', 'ቱ', 'ቲ', 'ታ', 'ቴ', 'ት', 'ቶ'],
    'ch': ['ቸ', 'ቹ', 'ቺ', 'ቻ', 'ቼ', 'ች', 'ቾ'],
    'n': ['ነ', 'ኑ', 'ኒ', 'ና', 'ኔ', 'ን', 'ኖ'],
    'gn': ['ኘ', 'ኙ', 'ኚ', 'ኛ', 'ኜ', 'ኝ', 'ኞ'],
    'k': ['ከ', 'ኩ', 'ኪ', 'ካ', 'ኬ', 'ክ', 'ኮ'],
    'w': ['ወ', 'ዉ', 'ዊ', 'ዋ', 'ዌ', 'ው', 'ዎ'],
    'z': ['ዘ', 'ዙ', 'ዚ', 'ዛ', 'ዜ', 'ዝ', 'ዞ'],
    'j': ['ጀ', 'ጁ', 'ጂ', 'ጃ', 'ጄ', 'ጅ', 'ጆ'],
    'y': ['የ', 'ዩ', 'ዪ', 'ያ', 'ዬ', 'ይ', 'ዮ'],
    'd': ['ደ', 'ዱ', 'ዲ', 'ዳ', 'ዴ', 'ድ', 'ዶ'],
    'g': ['ገ', 'ጉ', 'ጊ', 'ጋ', 'ጌ', 'ግ', 'ጎ'],
    'p': ['ፐ', 'ፑ', 'ፒ', 'ፓ', 'ፔ', 'ፕ', 'ፖ'],
    'f': ['ፈ', 'ፉ', 'ፊ', 'ፋ', 'ፌ', 'ፍ', 'ፎ'],
    'v': ['ቨ', 'ቩ', 'ቪ', 'ቫ', 'ቬ', 'ቭ', 'ቮ'],
};

const vowelMap = {
    'e': 0, // ሰ
    'u': 1, // ሱ
    'i': 2, // ሲ
    'a': 3, // ሳ
    'ie': 4, // ሴ
    'o': 6, // ሶ
    // Default is 5 (ስ) if no vowel follows
};

/**
 * Basic transliteration function
 * @param {string} text - The latin text to convert
 * @returns {string} - Amharic text
 */
export const transliterate = (text) => {
    let result = '';
    let i = 0;
    while (i < text.length) {
        let found = false;
        
        // Try double char consonants (sh, ch, gn)
        const doubleChar = text.substring(i, i + 2).toLowerCase();
        if (mapping[doubleChar]) {
            const nextChar = text.charAt(i + 2).toLowerCase();
            const vowelIdx = vowelMap[nextChar] !== undefined ? vowelMap[nextChar] : 5;
            result += mapping[doubleChar][vowelIdx];
            i += (vowelMap[nextChar] !== undefined ? 3 : 2);
            found = true;
        } 
        
        // Try single char consonants
        if (!found) {
            const char = text.charAt(i).toLowerCase();
            if (mapping[char]) {
                const nextChar = text.charAt(i + 1).toLowerCase();
                const vowelIdx = vowelMap[nextChar] !== undefined ? vowelMap[nextChar] : 5;
                result += mapping[char][vowelIdx];
                i += (vowelMap[nextChar] !== undefined ? 2 : 1);
                found = true;
            }
        }

        if (!found) {
            result += text.charAt(i);
            i++;
        }
    }
    return result;
};
