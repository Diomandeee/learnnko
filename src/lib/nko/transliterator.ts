export class NkoTransliterator {
  private latinToNkoMap: Record<string, string> = {
    // Vowels
    'a': 'ߊ', 'e': 'ߋ', 'i': 'ߌ', 'ɛ': 'ߍ', 'u': 'ߎ', 'o': 'ߏ', 'ɔ': 'ߐ',
    
    // Consonants
    'b': 'ߓ', 'p': 'ߔ', 't': 'ߕ', 'j': 'ߖ', 'c': 'ߗ', 'd': 'ߘ', 'r': 'ߙ',
    's': 'ߚ', 'gb': 'ߛ', 'f': 'ߜ', 'k': 'ߝ', 'q': 'ߞ', 'l': 'ߟ', 'm': 'ߠ',
    'n': 'ߡ', 'ny': 'ߢ', 'w': 'ߣ', 'h': 'ߤ', 'y': 'ߥ',
    
    // Diacritical marks
    "'": '߫', '`': '߬', '^': '߭', '¨': '߮', '*': '߯', '+': '߰',
    
    // Numbers
    '0': '߀', '1': '߁', '2': '߂', '3': '߃', '4': '߄',
    '5': '߅', '6': '߆', '7': '߇', '8': '߈', '9': '߉'
  }
  
  private nkoToLatinMap: Record<string, string> = {
    // Vowels
    'ߊ': 'a', 'ߋ': 'e', 'ߌ': 'i', 'ߍ': 'ɛ', 'ߎ': 'u', 'ߏ': 'o', 'ߐ': 'ɔ',
    
    // Consonants
    'ߓ': 'b', 'ߔ': 'p', 'ߕ': 't', 'ߖ': 'j', 'ߗ': 'c', 'ߘ': 'd', 'ߙ': 'r',
    'ߚ': 's', 'ߛ': 'gb', 'ߜ': 'f', 'ߝ': 'k', 'ߞ': 'q', 'ߟ': 'l', 'ߠ': 'm',
    'ߡ': 'n', 'ߢ': 'ny', 'ߣ': 'w', 'ߤ': 'h', 'ߥ': 'y',
    
    // Diacritical marks
    '߫': "'", '߬': '`', '߭': '^', '߮': '¨', '߯': '*', '߰': '+', '߲': 'n',
    
    // Numbers
    '߀': '0', '߁': '1', '߂': '2', '߃': '3', '߄': '4',
    '߅': '5', '߆': '6', '߇': '7', '߈': '8', '߉': '9'
  }
  
  // Special character combinations
  private specialCombinations: Record<string, string> = {
    'an': 'ߊ߲',
    'en': 'ߋ߲',
    'in': 'ߌ߲',
    'ɛn': 'ߍ߲',
    'un': 'ߎ߲',
    'on': 'ߏ߲',
    'ɔn': 'ߐ߲',
    'ch': 'ߗ',
    'kh': 'ߝ߭',
    'gh': 'ߝ߫',
    'ng': 'ߡ߲߬'
  }

  public latinToNko(text: string): string {
    if (!text) return '';
    
    let result = '';
    let i = 0;
    
    while (i < text.length) {
      let matched = false;
      
      // Check for special combinations first
      for (const combo in this.specialCombinations) {
        if (text.substring(i, i + combo.length).toLowerCase() === combo) {
          result += this.specialCombinations[combo];
          i += combo.length;
          matched = true;
          break;
        }
      }
      
      if (!matched) {
        // Check for regular mappings
        const char = text[i].toLowerCase();
        if (this.latinToNkoMap[char]) {
          result += this.latinToNkoMap[char];
        } else {
          result += text[i];
        }
        i++;
      }
    }
    
    return result;
  }
  
  public nkoToLatin(text: string): string {
    if (!text) return '';
    
    let result = '';
    
    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      if (this.nkoToLatinMap[char]) {
        result += this.nkoToLatinMap[char];
      } else {
        result += char;
      }
    }
    
    return result;
  }
}
