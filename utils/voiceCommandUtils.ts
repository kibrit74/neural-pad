/**
 * Voice command utilities for speech-to-text feature
 * Based on speech-to-text.md design document
 */

export interface VoiceCommands {
  tr: string[];
  en: string[];
}

export const VOICE_COMMANDS: VoiceCommands = {
  tr: ['tamam', 'bitti', 'kaydet', 'not ekle', 'ekle', 'tamam kaydet', 'not olarak kaydet'],
  en: ['okay', 'done', 'save', 'add note', 'save note', 'okay save', "that's it"]
};

/**
 * Cleans stop keywords from the end of transcript text
 * @param text - The transcript text
 * @param keywords - Array of keywords to remove, or boolean to use default keywords
 * @returns Cleaned text without stop keywords
 */
export const cleanStopKeywords = (text: string, keywords?: string[] | boolean): string => {
  if (!keywords || typeof keywords === 'boolean' || !Array.isArray(keywords) || keywords.length === 0) {
    return text;
  }

  let cleaned = text.trim();
  
  const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  
  // Sort keywords by length (longest first) to match longer phrases first
  const sortedKeywords = [...keywords].sort((a, b) => b.length - a.length);
  
  const normalizedText = cleaned.toLocaleLowerCase('tr-TR');

  for (const keyword of sortedKeywords) {
    const normalizedKeyword = keyword.toLocaleLowerCase('tr-TR');
    const re = new RegExp(`(?:\\s*)${escapeRegex(normalizedKeyword)}(?:[\\s.,!?:;]*)$`, 'i');
    const match = normalizedText.match(re);
    if (match && match.index !== undefined) {
      cleaned = text.substring(0, match.index).trim();
      break;
    }
  }

  return cleaned;
};

/**
 * Checks if transcript contains a voice command
 * @param transcript - The transcript text
 * @param lang - Language code ('tr' or 'en')
 * @returns True if command is detected
 */
export const hasVoiceCommand = (transcript: string, lang: 'tr' | 'en'): boolean => {
  const lowerTranscript = transcript.toLowerCase();
  const commands = VOICE_COMMANDS[lang] || VOICE_COMMANDS.en;
  
  return commands.some(cmd => {
    const words = lowerTranscript.split(' ');
    const lastWords = words.slice(-cmd.split(' ').length).join(' ');
    return lastWords === cmd || lowerTranscript.endsWith(cmd);
  });
};

/**
 * Removes voice command from the end of transcript
 * @param transcript - The transcript text
 * @param lang - Language code ('tr' or 'en')
 * @returns Text without voice command
 */
export const removeVoiceCommand = (transcript: string, lang: 'tr' | 'en'): string => {
  const commands = VOICE_COMMANDS[lang] || VOICE_COMMANDS.en;
  let cleaned = transcript;
  
  for (const cmd of commands) {
    const regex = new RegExp(`\\b${cmd.replace(/'/g, "\\'").replace(/\s+/g, '\\s+')}\\s*$`, 'gi');
    cleaned = cleaned.replace(regex, '').trim();
  }
  
  return cleaned;
};
