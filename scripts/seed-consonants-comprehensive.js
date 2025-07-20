const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Comprehensive N'Ko Consonants Lesson
const consonantsLesson = {
  slug: "nko-consonants-comprehensive",
  title: "Mastering N'Ko Consonants: Building Blocks of Communication",
  description: "Complete exploration of all N'Ko consonants with pronunciation mastery, cultural significance, and practical word formation",
  level: "beginner",
  module: "alphabet-fundamentals",
  moduleOrder: 3,
  track: "foundations", 
  order: 3,
  prerequisites: ["nko-introduction-comprehensive", "nko-vowels-comprehensive"],
  topics: ["alphabet", "consonants", "pronunciation", "phonetics", "word-formation"],
  estimatedTime: 65,
  duration: "65 minutes",
  tags: ["consonants", "pronunciation", "phonetics", "word-building"],
  objectives: [
    "Master the pronunciation of all 20 N'Ko consonant characters",
    "Understand consonant-vowel combinations and syllable formation",
    "Learn the cultural and etymological significance of key consonants",
    "Practice word formation using consonant-vowel patterns",
    "Develop reading fluency through consonant recognition",
    "Connect consonant sounds to traditional Mande linguistic patterns"
  ],
  vocabulary: ["ߓ", "ߔ", "ߕ", "ߖ", "ߗ", "ߘ", "ߙ", "ߚ", "ߛ", "ߜ", "ߝ", "ߞ", "ߟ", "ߠ", "ߡ", "ߢ", "ߣ", "ߤ", "ߥ", "ߦ"],
  grammarPoints: ["Consonant clusters", "Syllable structure", "Root formation"],
  culturalNotes: [
    "Sacred consonants in traditional Mande religious practices",
    "Consonant symbolism in N'Ko poetry and literature",
    "Regional consonant variations across Mande dialects"
  ],
  isActive: true,
  difficulty: 2,
  content: {
    introduction: `The twenty consonants of N'Ko form the structural backbone of the writing system. Each consonant carries not just sound, but cultural memory, linguistic heritage, and the power to build meaning. In this comprehensive lesson, you'll master every consonant and discover how they create the rich tapestry of Manding expression.`,
    
    sections: [
      {
        title: "Understanding N'Ko Consonant System",
        order: 1,
        duration: 12,
        content: `
          <h3>The Architecture of N'Ko Consonants</h3>
          <p>N'Ko's 20 consonants represent a carefully designed system that captures the full range of Manding language sounds. Unlike adapted scripts, every consonant was specifically chosen to represent sounds that are central to Mande languages.</p>
          
          <div class="consonant-system-overview">
            <h4>Consonant Categories by Articulation</h4>
            
            <div class="articulation-group">
              <h5>Labial Consonants (Lip Sounds)</h5>
              <div class="consonant-grid">
                <div class="consonant-item">
                  <span class="nko-char">ߓ</span>
                  <span class="sound">[b]</span>
                  <span class="example">ߓߊ (ba) - mother</span>
                </div>
                <div class="consonant-item">
                  <span class="nko-char">ߔ</span>
                  <span class="sound">[p]</span>
                  <span class="example">ߔߊ (pa) - father (some dialects)</span>
                </div>
                <div class="consonant-item">
                  <span class="nko-char">ߝ</span>
                  <span class="sound">[f]</span>
                  <span class="example">ߝߊ (fa) - father</span>
                </div>
                <div class="consonant-item">
                  <span class="nko-char">ߡ</span>
                  <span class="sound">[m]</span>
                  <span class="example">ߡߊ (ma) - mother (alternative)</span>
                </div>
                <div class="consonant-item">
                  <span class="nko-char">ߥ</span>
                  <span class="sound">[w]</span>
                  <span class="example">ߥߊ (wa) - to come</span>
                </div>
              </div>
            </div>
            
            <div class="articulation-group">
              <h5>Dental/Alveolar Consonants (Tongue-Tip Sounds)</h5>
              <div class="consonant-grid">
                <div class="consonant-item">
                  <span class="nko-char">ߕ</span>
                  <span class="sound">[t]</span>
                  <span class="example">ߕߊ (ta) - to go</span>
                </div>
                <div class="consonant-item">
                  <span class="nko-char">ߘ</span>
                  <span class="sound">[d]</span>
                  <span class="example">ߘߊ (da) - mouth</span>
                </div>
                <div class="consonant-item">
                  <span class="nko-char">ߛ</span>
                  <span class="sound">[s]</span>
                  <span class="example">ߛߊ (sa) - to buy</span>
                </div>
                <div class="consonant-item">
                  <span class="nko-char">ߖ</span>
                  <span class="sound">[z]</span>
                  <span class="example">ߖߊ (za) - lion</span>
                </div>
                <div class="consonant-item">
                  <span class="nko-char">ߟ</span>
                  <span class="sound">[l]</span>
                  <span class="example">ߟߊ (la) - on/upon</span>
                </div>
                <div class="consonant-item">
                  <span class="nko-char">ߙ</span>
                  <span class="sound">[r]</span>
                  <span class="example">ߙߊ (ra) - to increase</span>
                </div>
                <div class="consonant-item">
                  <span class="nko-char">ߣ</span>
                  <span class="sound">[n]</span>
                  <span class="example">ߣߊ (na) - to come</span>
                </div>
              </div>
            </div>
            
            <div class="articulation-group">
              <h5>Palatal/Velar Consonants (Back-of-Tongue Sounds)</h5>
              <div class="consonant-grid">
                <div class="consonant-item">
                  <span class="nko-char">ߞ</span>
                  <span class="sound">[k]</span>
                  <span class="example">ߞߊ (ka) - to do</span>
                </div>
                <div class="consonant-item">
                  <span class="nko-char">ߜ</span>
                  <span class="sound">[g]</span>
                  <span class="example">ߜߊ (ga) - to understand</span>
                </div>
                <div class="consonant-item">
                  <span class="nko-char">ߗ</span>
                  <span class="sound">[ʃ]</span>
                  <span class="example">ߗߊ (sha) - to drink</span>
                </div>
                <div class="consonant-item">
                  <span class="nko-char">ߚ</span>
                  <span class="sound">[ʒ]</span>
                  <span class="example">ߚߊ (zha) - thousands</span>
                </div>
                <div class="consonant-item">
                  <span class="nko-char">ߢ</span>
                  <span class="sound">[ɲ]</span>
                  <span class="example">ߢߊ (nya) - purpose</span>
                </div>
              </div>
            </div>
            
            <div class="articulation-group">
              <h5>Special Consonants</h5>
              <div class="consonant-grid">
                <div class="consonant-item">
                  <span class="nko-char">ߤ</span>
                  <span class="sound">[h]</span>
                  <span class="example">ߤߊ (ha) - also</span>
                </div>
                <div class="consonant-item">
                  <span class="nko-char">ߦ</span>
                  <span class="sound">[j]</span>
                  <span class="example">ߦߊ (ya) - here</span>
                </div>
                <div class="consonant-item">
                  <span class="nko-char">ߠ</span>
                  <span class="sound">[ɲ]</span>
                  <span class="example">ߠߊ (nya) - elephant</span>
                </div>
              </div>
            </div>
          </div>
          
          <h4>Cultural Significance of Consonant Groupings</h4>
          <p>In traditional Mande culture, certain consonant sounds carry symbolic meaning:</p>
          
          <div class="cultural-symbolism">
            <div class="symbol-group">
              <h5>Power and Strength: ߞ [k] and ߜ [g]</h5>
              <p>These sounds appear in words related to power, creation, and action:</p>
              <ul>
                <li><strong>ߞߊ</strong> (ka) - "to do, to make" - the fundamental creative action</li>
                <li><strong>ߞߏ</strong> (ko) - "to say, word" - the power of speech</li>
                <li><strong>ߜߍ</strong> (ge) - "understand" - mental strength</li>
              </ul>
            </div>
            
            <div class="symbol-group">
              <h5>Family and Relationships: ߓ [b] and ߡ [m]</h5>
              <p>These labial sounds dominate kinship terminology:</p>
              <ul>
                <li><strong>ߓߊ</strong> (ba) - "mother, river" - source of life</li>
                <li><strong>ߡߊ</strong> (ma) - "mother" - nurturing figure</li>
                <li><strong>ߓߘߊ</strong> (bada) - "older sibling" - family structure</li>
              </ul>
            </div>
            
            <div class="symbol-group">
              <h5>Movement and Journey: ߕ [t] and ߘ [d]</h5>
              <p>These sounds represent motion and transition:</p>
              <ul>
                <li><strong>ߕߊ</strong> (ta) - "to go" - physical movement</li>
                <li><strong>ߘߊ</strong> (da) - "mouth" - speech movement</li>
                <li><strong>ߘߎ߲߬</strong> (dun) - "enter" - directional change</li>
              </ul>
            </div>
          </div>
        `,
        nkoText: "ߞߐߣߌ߲ߟߊ ߠߋ߬ ߦߋ߫ ߒߞߏ ߞߊ߬ߙߊ߲ ߞߊ߬ߙߊ߲ߘߊ ߟߊ߫ ߝߍ߬ߦߊ ߘߌ߫",
        latinTransliteration: "Kɔnɔnla le ye N'ko karan karanda la feya di",
        englishTranslation: "Consonants are the strength of N'Ko learning",
        pronunciation: "[kɔ̀nɔ̀nlà lé jé ŋ̀kó kàrán kàràndà là fèjà dì]",
        audioPrompt: "Strong, confident pronunciation emphasizing consonant clarity",
        exercises: [
          {
            type: "multiple-choice",
            question: "How many consonants does N'Ko have?",
            options: ["18", "20", "22", "24"],
            correctAnswer: 1,
            explanation: "N'Ko has exactly 20 consonant characters, each representing specific sounds in Manding languages.",
            difficulty: "easy"
          },
          {
            type: "categorization",
            question: "Which consonants are labial (lip) sounds?",
            options: ["ߓ, ߔ, ߝ, ߡ, ߥ", "ߕ, ߘ, ߛ, ߟ", "ߞ, ߜ, ߗ, ߚ", "ߤ, ߦ, ߠ"],
            correctAnswer: 0,
            explanation: "Labial consonants ߓ [b], ߔ [p], ߝ [f], ߡ [m], and ߥ [w] are all produced with the lips.",
            difficulty: "medium"
          },
          {
            type: "cultural-connection",
            question: "Why do many family-related words contain ߓ [b] and ߡ [m] sounds?",
            explanation: "These labial sounds are among the first sounds babies can make, connecting them naturally to family and nurturing relationships in Mande culture.",
            difficulty: "medium"
          }
        ]
      },
      
      {
        title: "The First Ten Consonants: Foundation Builders",
        order: 2,
        duration: 18,
        content: `
          <h3>ߓ [b] - The Mother Sound</h3>
          <div class="consonant-detailed-study">
            <div class="character-display">
              <span class="nko-huge">ߓ</span>
              <div class="pronunciation-guide">
                <p><strong>Sound:</strong> [b] like "b" in "baby"</p>
                <p><strong>Mouth Position:</strong> Both lips together, then release with voice</p>
                <p><strong>Cultural Note:</strong> First sound in "mother" (ߓߊ) across many cultures</p>
              </div>
            </div>
            
            <h4>Essential Words with ߓ</h4>
            <div class="word-examples-detailed">
              <div class="word-entry">
                <span class="nko-text">ߓߊ</span>
                <span class="transliteration">ba</span>
                <span class="meaning">mother, river</span>
                <span class="pronunciation">[bà]</span>
                <span class="cultural-note">Rivers are seen as life-givers like mothers</span>
              </div>
              <div class="word-entry">
                <span class="nko-text">ߓߍ</span>
                <span class="transliteration">bɛ</span>
                <span class="meaning">to plant, sow</span>
                <span class="pronunciation">[bɛ́]</span>
                <span class="cultural-note">Agricultural foundation of Mande society</span>
              </div>
              <div class="word-entry">
                <span class="nko-text">ߓߎ</span>
                <span class="transliteration">bu</span>
                <span class="meaning">place, location</span>
                <span class="pronunciation">[bù]</span>
                <span class="cultural-note">Geographic and social positioning concept</span>
              </div>
              <div class="word-entry">
                <span class="nko-text">ߓߏ</span>
                <span class="transliteration">bo</span>
                <span class="meaning">house, home</span>
                <span class="pronunciation">[bó]</span>
                <span class="cultural-note">Center of family and community life</span>
              </div>
            </div>
          </div>
          
          <h3>ߔ [p] - The Gentle Force</h3>
          <div class="consonant-detailed-study">
            <div class="character-display">
              <span class="nko-huge">ߔ</span>
              <div class="pronunciation-guide">
                <p><strong>Sound:</strong> [p] like "p" in "papa"</p>
                <p><strong>Mouth Position:</strong> Like ߓ [b] but without vocal cord vibration</p>
                <p><strong>Usage Note:</strong> Less common in some Mande dialects</p>
              </div>
            </div>
            
            <h4>Words with ߔ (Regional Variations)</h4>
            <div class="word-examples-detailed">
              <div class="word-entry">
                <span class="nko-text">ߔߊ</span>
                <span class="transliteration">pa</span>
                <span class="meaning">father (some dialects)</span>
                <span class="pronunciation">[pà]</span>
                <span class="cultural-note">Alternative to ߝߊ in certain regions</span>
              </div>
            </div>
          </div>
          
          <h3>ߕ [t] - The Journey Maker</h3>
          <div class="consonant-detailed-study">
            <div class="character-display">
              <span class="nko-huge">ߕ</span>
              <div class="pronunciation-guide">
                <p><strong>Sound:</strong> [t] like "t" in "top"</p>
                <p><strong>Mouth Position:</strong> Tongue tip touches alveolar ridge</p>
                <p><strong>Cultural Note:</strong> Associated with movement and action</p>
              </div>
            </div>
            
            <h4>Essential Words with ߕ</h4>
            <div class="word-examples-detailed">
              <div class="word-entry">
                <span class="nko-text">ߕߊ</span>
                <span class="transliteration">ta</span>
                <span class="meaning">to go</span>
                <span class="pronunciation">[tà]</span>
                <span class="cultural-note">Most basic verb of movement</span>
              </div>
              <div class="word-entry">
                <span class="nko-text">ߕߋ</span>
                <span class="transliteration">te</span>
                <span class="meaning">today</span>
                <span class="pronunciation">[té]</span>
                <span class="cultural-note">Present moment awareness</span>
              </div>
              <div class="word-entry">
                <span class="nko-text">ߕߎ</span>
                <span class="transliteration">tu</span>
                <span class="meaning">to pound (grain)</span>
                <span class="pronunciation">[tù]</span>
                <span class="cultural-note">Essential food preparation activity</span>
              </div>
            </div>
          </div>
          
          <h3>ߖ [z] - The Vibrant Energy</h3>
          <div class="consonant-detailed-study">
            <div class="character-display">
              <span class="nko-huge">ߖ</span>
              <div class="pronunciation-guide">
                <p><strong>Sound:</strong> [z] like "z" in "zebra"</p>
                <p><strong>Mouth Position:</strong> Like ߛ [s] but with vocal cord vibration</p>
                <p><strong>Cultural Note:</strong> Often appears in powerful animal names</p>
              </div>
            </div>
            
            <h4>Essential Words with ߖ</h4>
            <div class="word-examples-detailed">
              <div class="word-entry">
                <span class="nko-text">ߖߊ</span>
                <span class="transliteration">za</span>
                <span class="meaning">lion</span>
                <span class="pronunciation">[zà]</span>
                <span class="cultural-note">Symbol of courage and leadership</span>
              </div>
              <div class="word-entry">
                <span class="nko-text">ߖߍ</span>
                <span class="transliteration">ze</span>
                <span class="meaning">all, everything</span>
                <span class="pronunciation">[zé]</span>
                <span class="cultural-note">Concept of completeness and totality</span>
              </div>
            </div>
          </div>
          
          <h3>ߗ [ʃ] - The Flowing Sound</h3>
          <div class="consonant-detailed-study">
            <div class="character-display">
              <span class="nko-huge">ߗ</span>
              <div class="pronunciation-guide">
                <p><strong>Sound:</strong> [ʃ] like "sh" in "ship"</p>
                <p><strong>Mouth Position:</strong> Tongue curved, air flows over tongue surface</p>
                <p><strong>Cultural Note:</strong> Associated with liquid and consumption</p>
              </div>
            </div>
            
            <h4>Essential Words with ߗ</h4>
            <div class="word-examples-detailed">
              <div class="word-entry">
                <span class="nko-text">ߗߊ</span>
                <span class="transliteration">sha</span>
                <span class="meaning">to drink</span>
                <span class="pronunciation">[ʃà]</span>
                <span class="cultural-note">Essential survival action</span>
              </div>
              <div class="word-entry">
                <span class="nko-text">ߗߍ</span>
                <span class="transliteration">she</span>
                <span class="meaning">to flow</span>
                <span class="pronunciation">[ʃé]</span>
                <span class="cultural-note">Movement of water and time</span>
              </div>
            </div>
          </div>
          
          <h3>Practice Section: First Five Consonants</h3>
          <div class="practice-activities">
            <h4>Syllable Building Exercise</h4>
            <p>Combine each consonant with all vowels:</p>
            <div class="syllable-grid">
              <div class="syllable-row">
                <span class="consonant">ߓ + vowels:</span>
                <span class="syllables">ߓߊ (ba), ߓߍ (bɛ), ߓߎ (bu), ߓߏ (bo), ߓߐ (bɛ̃), ߓߑ (bã)</span>
              </div>
              <div class="syllable-row">
                <span class="consonant">ߕ + vowels:</span>
                <span class="syllables">ߕߊ (ta), ߕߍ (tɛ), ߕߎ (tu), ߕߏ (to), ߕߐ (tɛ̃), ߕߑ (tã)</span>
              </div>
            </div>
            
            <h4>Word Recognition Practice</h4>
            <p>Practice reading these common words quickly:</p>
            <div class="word-recognition">
              <span class="practice-word">ߓߊ</span>
              <span class="practice-word">ߕߊ</span>
              <span class="practice-word">ߖߊ</span>
              <span class="practice-word">ߗߊ</span>
              <span class="practice-word">ߓߏ</span>
              <span class="practice-word">ߕߋ</span>
            </div>
          </div>
        `,
        nkoText: "ߓ߸ ߔ߸ ߕ߸ ߖ߸ ߗ - ߞߐߣߌ߲ߟߊ ߝߟߐߡߊ ߟߎ߫ ߟߋ߬",
        latinTransliteration: "B, p, t, z, sh - kɔnɔnla foloma lu le",
        englishTranslation: "B, p, t, z, sh - the first consonants",
        pronunciation: "[bé pé té zé ʃé kɔ̀nɔ̀nlà fòlòmà lù lé]",
        audioPrompt: "Clear, deliberate pronunciation of each consonant with example words",
        exercises: [
          {
            type: "consonant-vowel-combination",
            question: "Combine ߓ with each vowel:",
            answers: ["ߓߊ", "ߓߍ", "ߓߎ", "ߓߏ", "ߓߐ", "ߓߑ"],
            explanation: "Practice all possible consonant-vowel combinations to build fluency.",
            difficulty: "medium"
          },
          {
            type: "word-meaning",
            question: "What does ߖߊ (za) mean?",
            options: ["house", "lion", "water", "mother"],
            correctAnswer: 1,
            explanation: "ߖߊ (za) means 'lion', a powerful symbol in Mande culture.",
            difficulty: "easy"
          },
          {
            type: "pronunciation-practice",
            question: "Practice the difference between ߛ [s] and ߖ [z]:",
            pairs: ["ߛߊ (sa) vs ߖߊ (za)", "ߛߍ (se) vs ߖߍ (ze)"],
            explanation: "The difference is voicing - ߖ [z] has vocal cord vibration while ߛ [s] does not.",
            difficulty: "medium"
          }
        ]
      },
      
      {
        title: "The Second Ten Consonants: Advanced Sounds",
        order: 3,
        duration: 20,
        content: `
          <h3>Completing the Consonant Family</h3>
          <p>The remaining ten consonants include some of the most distinctive sounds in N'Ko, representing phonetic features that are particularly important in Manding languages.</p>
          
          <h3>ߘ [d] - The Speaker's Sound</h3>
          <div class="consonant-detailed-study">
            <div class="character-display">
              <span class="nko-huge">ߘ</span>
              <div class="pronunciation-guide">
                <p><strong>Sound:</strong> [d] like "d" in "door"</p>
                <p><strong>Mouth Position:</strong> Tongue tip touches alveolar ridge with voice</p>
                <p><strong>Cultural Note:</strong> Central to words about speech and expression</p>
              </div>
            </div>
            
            <h4>Essential Words with ߘ</h4>
            <div class="word-examples-detailed">
              <div class="word-entry">
                <span class="nko-text">ߘߊ</span>
                <span class="transliteration">da</span>
                <span class="meaning">mouth</span>
                <span class="pronunciation">[dà]</span>
                <span class="cultural-note">Source of speech and expression</span>
              </div>
              <div class="word-entry">
                <span class="nko-text">ߘߎ߲߬</span>
                <span class="transliteration">dun</span>
                <span class="meaning">to enter</span>
                <span class="pronunciation">[dùn]</span>
                <span class="cultural-note">Movement into spaces and communities</span>
              </div>
              <div class="word-entry">
                <span class="nko-text">ߘߋ߲</span>
                <span class="transliteration">den</span>
                <span class="meaning">child</span>
                <span class="pronunciation">[dén]</span>
                <span class="cultural-note">Future of the community</span>
              </div>
            </div>
          </div>
          
          <h3>ߙ [r] - The Rolling Energy</h3>
          <div class="consonant-detailed-study">
            <div class="character-display">
              <span class="nko-huge">ߙ</span>
              <div class="pronunciation-guide">
                <p><strong>Sound:</strong> [r] rolled or tapped "r"</p>
                <p><strong>Mouth Position:</strong> Tongue tip vibrates against alveolar ridge</p>
                <p><strong>Cultural Note:</strong> Associated with increase and growth</p>
              </div>
            </div>
            
            <h4>Essential Words with ߙ</h4>
            <div class="word-examples-detailed">
              <div class="word-entry">
                <span class="nko-text">ߙߊ</span>
                <span class="transliteration">ra</span>
                <span class="meaning">to increase</span>
                <span class="pronunciation">[rà]</span>
                <span class="cultural-note">Growth and prosperity concept</span>
              </div>
              <div class="word-entry">
                <span class="nko-text">ߙߍ</span>
                <span class="transliteration">re</span>
                <span class="meaning">dry season</span>
                <span class="pronunciation">[ré]</span>
                <span class="cultural-note">Important seasonal marker</span>
              </div>
            </div>
          </div>
          
          <h3>ߚ [ʒ] - The Gentle Vibration</h3>
          <div class="consonant-detailed-study">
            <div class="character-display">
              <span class="nko-huge">ߚ</span>
              <div class="pronunciation-guide">
                <p><strong>Sound:</strong> [ʒ] like "s" in "pleasure"</p>
                <p><strong>Mouth Position:</strong> Like ߗ [ʃ] but with vocal cord vibration</p>
                <p><strong>Cultural Note:</strong> Often appears in words about quantity</p>
              </div>
            </div>
            
            <h4>Essential Words with ߚ</h4>
            <div class="word-examples-detailed">
              <div class="word-entry">
                <span class="nko-text">ߚߊ</span>
                <span class="transliteration">zha</span>
                <span class="meaning">thousand</span>
                <span class="pronunciation">[ʒà]</span>
                <span class="cultural-note">Large quantity measurement</span>
              </div>
            </div>
          </div>
          
          <h3>ߛ [s] - The Whispering Wind</h3>
          <div class="consonant-detailed-study">
            <div class="character-display">
              <span class="nko-huge">ߛ</span>
              <div class="pronunciation-guide">
                <p><strong>Sound:</strong> [s] like "s" in "snake"</p>
                <p><strong>Mouth Position:</strong> Tongue tip near alveolar ridge, air flows through groove</p>
                <p><strong>Cultural Note:</strong> Associated with acquisition and commerce</p>
              </div>
            </div>
            
            <h4>Essential Words with ߛ</h4>
            <div class="word-examples-detailed">
              <div class="word-entry">
                <span class="nko-text">ߛߊ</span>
                <span class="transliteration">sa</span>
                <span class="meaning">to buy</span>
                <span class="pronunciation">[sà]</span>
                <span class="cultural-note">Commercial exchange activity</span>
              </div>
              <div class="word-entry">
                <span class="nko-text">ߛߍ</span>
                <span class="transliteration">se</span>
                <span class="meaning">to arrive</span>
                <span class="pronunciation">[sé]</span>
                <span class="cultural-note">Completion of journey</span>
              </div>
              <div class="word-entry">
                <span class="nko-text">ߛߎ</span>
                <span class="transliteration">su</span>
                <span class="meaning">night</span>
                <span class="pronunciation">[sù]</span>
                <span class="cultural-note">Time of rest and spirits</span>
              </div>
            </div>
          </div>
          
          <h3>ߜ [g] - The Deep Foundation</h3>
          <div class="consonant-detailed-study">
            <div class="character-display">
              <span class="nko-huge">ߜ</span>
              <div class="pronunciation-guide">
                <p><strong>Sound:</strong> [g] like "g" in "go"</p>
                <p><strong>Mouth Position:</strong> Back of tongue touches soft palate with voice</p>
                <p><strong>Cultural Note:</strong> Associated with understanding and wisdom</p>
              </div>
            </div>
            
            <h4>Essential Words with ߜ</h4>
            <div class="word-examples-detailed">
              <div class="word-entry">
                <span class="nko-text">ߜߍ</span>
                <span class="transliteration">ge</span>
                <span class="meaning">to understand</span>
                <span class="pronunciation">[gé]</span>
                <span class="cultural-note">Mental and spiritual comprehension</span>
              </div>
              <div class="word-entry">
                <span class="nko-text">ߜߊ</span>
                <span class="transliteration">ga</span>
                <span class="meaning">to understand (alternative form)</span>
                <span class="pronunciation">[gà]</span>
                <span class="cultural-note">Deep knowledge acquisition</span>
              </div>
            </div>
          </div>
          
          <h3>Continuing with Remaining Consonants</h3>
          <div class="remaining-consonants">
            <h4>Quick Reference for Advanced Consonants</h4>
            <div class="consonant-quick-ref">
              <div class="quick-item">
                <span class="nko-char">ߝ</span>
                <span class="sound">[f]</span>
                <span class="example">ߝߊ (fa) - father</span>
              </div>
              <div class="quick-item">
                <span class="nko-char">ߞ</span>
                <span class="sound">[k]</span>
                <span class="example">ߞߊ (ka) - to do</span>
              </div>
              <div class="quick-item">
                <span class="nko-char">ߟ</span>
                <span class="sound">[l]</span>
                <span class="example">ߟߊ (la) - on/upon</span>
              </div>
              <div class="quick-item">
                <span class="nko-char">ߠ</span>
                <span class="sound">[ɲ]</span>
                <span class="example">ߠߊ (nya) - elephant</span>
              </div>
              <div class="quick-item">
                <span class="nko-char">ߡ</span>
                <span class="sound">[m]</span>
                <span class="example">ߡߊ (ma) - mother</span>
              </div>
              <div class="quick-item">
                <span class="nko-char">ߢ</span>
                <span class="sound">[ɲ]</span>
                <span class="example">ߢߊ (nya) - purpose</span>
              </div>
              <div class="quick-item">
                <span class="nko-char">ߣ</span>
                <span class="sound">[n]</span>
                <span class="example">ߣߊ (na) - to come</span>
              </div>
              <div class="quick-item">
                <span class="nko-char">ߤ</span>
                <span class="sound">[h]</span>
                <span class="example">ߤߊ (ha) - also</span>
              </div>
              <div class="quick-item">
                <span class="nko-char">ߥ</span>
                <span class="sound">[w]</span>
                <span class="example">ߥߊ (wa) - to come</span>
              </div>
              <div class="quick-item">
                <span class="nko-char">ߦ</span>
                <span class="sound">[j]</span>
                <span class="example">ߦߊ (ya) - here</span>
              </div>
            </div>
          </div>
        `,
        nkoText: "ߘ߸ ߙ߸ ߚ߸ ߛ߸ ߜ - ߞߐߣߌ߲ߟߊ ߢߍߓߊ߮ ߟߎ߫",
        latinTransliteration: "D, r, zh, s, g - kɔnɔnla nyɛbaw lu",
        englishTransliteration: "D, r, zh, s, g - the second group consonants",
        pronunciation: "[dé ré ʒé sé gé kɔ̀nɔ̀nlà ɲɛ̀bàw lù]",
        audioPrompt: "Progressive pronunciation building complexity with second consonant group",
        exercises: [
          {
            type: "advanced-pronunciation",
            question: "Practice the voiced-voiceless pairs:",
            pairs: [
              "ߕ [t] vs ߘ [d]",
              "ߛ [s] vs ߖ [z]", 
              "ߗ [ʃ] vs ߚ [ʒ]",
              "ߞ [k] vs ߜ [g]"
            ],
            explanation: "Understanding voiced and voiceless consonant pairs improves pronunciation accuracy.",
            difficulty: "hard"
          },
          {
            type: "word-building",
            question: "Build words using ߘ + different vowels:",
            answers: ["ߘߊ (da) - mouth", "ߘߎ߲߬ (dun) - enter", "ߘߋ߲ (den) - child"],
            difficulty: "medium"
          }
        ]
      },
      
      {
        title: "Word Formation and Consonant Clusters",
        order: 4,
        duration: 10,
        content: `
          <h3>Building Complex Words with Consonants</h3>
          <p>Once you master individual consonants, the next step is understanding how they combine to form complex words and express sophisticated ideas.</p>
          
          <h4>Simple Consonant-Vowel Patterns</h4>
          <div class="pattern-examples">
            <h5>CV (Consonant-Vowel) Pattern</h5>
            <p>The most basic N'Ko syllable structure:</p>
            <div class="cv-examples">
              <span class="pattern">ߞߊ (ka)</span>
              <span class="pattern">ߓߊ (ba)</span>
              <span class="pattern">ߛߊ (sa)</span>
              <span class="pattern">ߕߊ (ta)</span>
            </div>
            
            <h5>CVC (Consonant-Vowel-Consonant) Pattern</h5>
            <p>More complex syllables with final consonants:</p>
            <div class="cvc-examples">
              <span class="pattern">ߘߎ߲߬ (dun) - enter</span>
              <span class="pattern">ߘߋ߲ (den) - child</span>
              <span class="pattern">ߞߏ߲ (kon) - war</span>
            </div>
          </div>
          
          <h4>Multi-Syllable Word Construction</h4>
          <div class="multi-syllable-words">
            <h5>Two-Syllable Words</h5>
            <div class="word-breakdown">
              <div class="word-example">
                <span class="nko-text">ߞߊ߬ߙߊ߲</span>
                <span class="breakdown">ߞߊ + ߙߊ߲ = ka-ran</span>
                <span class="meaning">learning, study</span>
              </div>
              <div class="word-example">
                <span class="nko-text">ߓߊߟߊ</span>
                <span class="breakdown">ߓߊ + ߟߊ = ba-la</span>
                <span class="meaning">dance</span>
              </div>
              <div class="word-example">
                <span class="nko-text">ߝߊߙߊ߲</span>
                <span class="breakdown">ߝߊ + ߙߊ߲ = fa-ran</span>
                <span class="meaning">music</span>
              </div>
            </div>
            
            <h5>Three-Syllable Words</h5>
            <div class="word-breakdown">
              <div class="word-example">
                <span class="nko-text">ߞߊ߬ߙߊ߲߬ߞߊ</span>
                <span class="breakdown">ߞߊ + ߙߊ߲ + ߞߊ = ka-ran-ka</span>
                <span class="meaning">student, learner</span>
              </div>
              <div class="word-example">
                <span class="nko-text">ߞߊ߬ߙߊ߲߬ߞߎ</span>
                <span class="breakdown">ߞߊ + ߙߊ߲ + ߞߎ = ka-ran-ku</span>
                <span class="meaning">school</span>
              </div>
            </div>
          </div>
          
          <h4>Consonant Clusters and Special Combinations</h4>
          <div class="consonant-clusters">
            <h5>Common Cluster Patterns</h5>
            <div class="cluster-examples">
              <div class="cluster">
                <span class="pattern">ߒߞߏ (N'ko)</span>
                <span class="explanation">ߒ [ɲ] + ߞߏ [ko] - "I say"</span>
              </div>
              <div class="cluster">
                <span class="pattern">ߛߓߍ (sɛbɛ)</span>
                <span class="explanation">ߛ [s] + ߓߍ [bɛ] - "to write"</span>
              </div>
              <div class="cluster">
                <span class="pattern">ߞߐ߯ (kɔw)</span>
                <span class="explanation">ߞߐ [kɔ] + ߯ [w] - "farm field"</span>
              </div>
            </div>
          </div>
          
          <h4>Root Word Analysis</h4>
          <div class="root-analysis">
            <h5>The Root ߞߊ (ka) - "To Do/Make"</h5>
            <p>See how this fundamental root creates multiple related words:</p>
            <div class="root-derivatives">
              <div class="derivative">
                <span class="word">ߞߊ (ka)</span>
                <span class="meaning">to do, to make</span>
              </div>
              <div class="derivative">
                <span class="word">ߞߊ߬ߟߊ (kala)</span>
                <span class="meaning">doer, maker</span>
              </div>
              <div class="derivative">
                <span class="word">ߞߊ߬ߟߌ (kali)</span>
                <span class="meaning">action, deed</span>
              </div>
              <div class="derivative">
                <span class="word">ߞߊ߬ߙߊ߲ (karan)</span>
                <span class="meaning">learning (making knowledge)</span>
              </div>
            </div>
          </div>
          
          <h4>Pronunciation Rules for Complex Words</h4>
          <div class="pronunciation-rules">
            <ol>
              <li><strong>Syllable Stress:</strong> Usually on the final syllable</li>
              <li><strong>Consonant Clarity:</strong> Each consonant must be clearly articulated</li>
              <li><strong>Vowel Preservation:</strong> Vowel quality doesn't change in compounds</li>
              <li><strong>Rhythm Maintenance:</strong> Keep steady rhythm between syllables</li>
            </ol>
          </div>
        `,
        nkoText: "ߞߐߣߌ߲ߟߊ ߠߊߓߊ߲ ߦߋ߫ ߞߎ߬ߙߎ߲߬ߘߎ ߞߍ߫ ߟߊ߫",
        latinTransliteration: "Kɔnɔnla laban ye kurundi kɛ la",
        englishTranslation: "Consonant combination creates complexity",
        pronunciation: "[kɔ̀nɔ̀nlà làbàn jé kùrùndì kɛ̀ là]",
        audioPrompt: "Demonstrating complex word formation with clear syllable separation",
        exercises: [
          {
            type: "word-analysis",
            question: "Break down the word ߞߊ߬ߙߊ߲ (karan) into its parts:",
            answer: "ߞߊ (ka - to do) + ߙߊ߲ (ran - knowledge) = learning",
            explanation: "Understanding word roots helps with vocabulary building and comprehension.",
            difficulty: "medium"
          },
          {
            type: "pronunciation-practice",
            question: "Practice these three-syllable words:",
            words: ["ߞߊ߬ߙߊ߲߬ߞߊ (ka-ran-ka)", "ߞߊ߬ߙߊ߲߬ߞߎ (ka-ran-ku)"],
            difficulty: "hard"
          }
        ]
      },
      
      {
        title: "Reading Fluency and Cultural Context",
        order: 5,
        duration: 5,
        content: `
          <h3>Developing N'Ko Reading Fluency</h3>
          <p>True mastery of N'Ko consonants comes through extensive reading practice and understanding cultural contexts where these sounds carry special meaning.</p>
          
          <h4>Reading Practice Strategies</h4>
          <div class="reading-strategies">
            <h5>1. Progressive Complexity</h5>
            <p>Start with simple CV syllables, progress to CVC, then multi-syllable words:</p>
            <div class="progression">
              <span class="level">Level 1: ߞߊ, ߓߊ, ߛߊ</span>
              <span class="level">Level 2: ߘߎ߲߬, ߘߋ߲, ߞߏ߲</span>
              <span class="level">Level 3: ߞߊ߬ߙߊ߲, ߓߊߟߊ, ߝߊߙߊ߲</span>
            </div>
            
            <h5>2. Cultural Text Reading</h5>
            <p>Practice with culturally meaningful texts:</p>
            <div class="cultural-texts">
              <div class="text-example">
                <span class="nko-text">ߊߟߊ ߞߊ߬ ߞߊ߬ߙߊ߲ ߞߊ߬ߙߊ߲߬</span>
                <span class="translation">"God loves learning"</span>
                <span class="context">Religious/educational value</span>
              </div>
              <div class="text-example">
                <span class="nko-text">ߘߋ߲ ߦߋ߫ ߞߊ߬ߙߊ߲߬ߞߎ ߘߐ߫</span>
                <span class="translation">"The child is in school"</span>
                <span class="context">Educational context</span>
              </div>
            </div>
            
            <h5>3. Speed Building</h5>
            <p>Gradually increase reading speed while maintaining accuracy:</p>
            <ul>
              <li>Start with slow, careful pronunciation</li>
              <li>Practice same text multiple times</li>
              <li>Focus on smooth consonant-vowel transitions</li>
              <li>Build up to natural speaking speed</li>
            </ul>
          </div>
          
          <h4>Cultural Significance in Consonant Usage</h4>
          <div class="cultural-significance">
            <h5>Sacred Sounds in Traditional Practice</h5>
            <p>Certain consonant combinations have special meaning in Mande spiritual traditions:</p>
            <div class="sacred-sounds">
              <div class="sacred-item">
                <span class="sound">ߞߊ + ߛߊ = ߞߊߛߊ</span>
                <span class="meaning">Spirit house, sacred place</span>
              </div>
              <div class="sacred-item">
                <span class="sound">ߓߊ + ߙߊ = ߓߊߙߊ</span>
                <span class="meaning">Great river, life source</span>
              </div>
            </div>
            
            <h5>Professional and Social Terms</h5>
            <p>Consonants in words describing social roles:</p>
            <div class="social-terms">
              <div class="term">
                <span class="nko-text">ߞߊ߬ߙߊ߲߬ߞߊ</span>
                <span class="role">Student/Learner</span>
                <span class="context">Educational community</span>
              </div>
              <div class="term">
                <span class="nko-text">ߛߓߍߞߊ</span>
                <span class="role">Writer/Scribe</span>
                <span class="context">Literary community</span>
              </div>
            </div>
          </div>
          
          <h4>Next Steps in Your N'Ko Journey</h4>
          <div class="next-steps">
            <p>With consonant mastery, you're ready for:</p>
            <ul>
              <li><strong>Tone Marks:</strong> Learn how tones interact with consonants</li>
              <li><strong>Complex Grammar:</strong> Sentence construction using your consonant knowledge</li>
              <li><strong>Literature Reading:</strong> Explore N'Ko poetry and prose</li>
              <li><strong>Writing Practice:</strong> Begin composing your own N'Ko texts</li>
            </ul>
          </div>
        `,
        nkoText: "ߞߐߣߌ߲ߟߊ ߟߐ߲ߣߍ߲ߦߊ ߞߊ߬ ߞߊ߬ߙߊ߲ ߛߌ߲ߘߌ߫",
        latinTransliteration: "Kɔnɔnla lonɛnya ka karan sindi",
        englishTranslation: "Consonant knowledge strengthens learning",
        pronunciation: "[kɔ̀nɔ̀nlà lònɛ̀ɲà ká kàrán sìndì]",
        audioPrompt: "Confident, fluent reading demonstrating mastery progression",
        exercises: [
          {
            type: "fluency-reading",
            question: "Read this sentence smoothly:",
            text: "ߘߋ߲ ߦߋ߫ ߞߊ߬ߙߊ߲߬ߞߎ ߘߐ߫",
            goal: "Smooth, natural pace without hesitation",
            difficulty: "hard"
          },
          {
            type: "cultural-comprehension",
            question: "What cultural value is expressed in ߊߟߊ ߞߊ߬ ߞߊ߬ߙߊ߲ ߞߊ߬ߙߊ߲߬?",
            answer: "The importance of learning in Islamic/traditional values",
            difficulty: "medium"
          }
        ]
      }
    ],
    
    quiz: {
      title: "Comprehensive N'Ko Consonants Mastery Assessment",
      description: "Demonstrate your complete understanding of all N'Ko consonants and their applications",
      questions: [
        {
          question: "How many consonant characters does N'Ko have?",
          options: ["18", "19", "20", "21"],
          correctAnswer: 2,
          explanation: "N'Ko has exactly 20 consonant characters representing the full range of Manding consonant sounds.",
          difficulty: "easy",
          points: 1
        },
        {
          question: "Which consonant appears in the word ߓߊ (ba - mother)?",
          options: ["ߔ [p]", "ߓ [b]", "ߡ [m]", "ߝ [f]"],
          correctAnswer: 1,
          explanation: "The word ߓߊ (ba) begins with the consonant ߓ [b].",
          difficulty: "easy",
          points: 1
        },
        {
          question: "What is the difference between ߛ and ߖ?",
          options: [
            "Tongue position",
            "Lip rounding",
            "Voicing (vocal cord vibration)",
            "Nasalization"
          ],
          correctAnswer: 2,
          explanation: "ߛ [s] is voiceless while ߖ [z] is voiced - the difference is vocal cord vibration.",
          difficulty: "medium",
          points: 2
        },
        {
          question: "In the word ߞߊ߬ߙߊ߲ (karan - learning), which consonants are present?",
          options: [
            "ߞ [k] and ߙ [r]",
            "ߞ [k] and ߟ [l]", 
            "ߜ [g] and ߙ [r]",
            "ߞ [k] and ߣ [n]"
          ],
          correctAnswer: 0,
          explanation: "The word ߞߊ߬ߙߊ߲ (karan) contains ߞ [k] at the beginning and ߙ [r] in the second syllable.",
          difficulty: "medium",
          points: 2
        },
        {
          question: "Which consonant is associated with the concept of 'understanding' in Mande culture?",
          options: ["ߓ [b]", "ߜ [g]", "ߕ [t]", "ߛ [s]"],
          correctAnswer: 1,
          explanation: "ߜ [g] appears in ߜߍ (ge) meaning 'to understand', making it culturally associated with comprehension.",
          difficulty: "medium", 
          points: 2
        },
        {
          question: "What type of sound is ߗ [ʃ]?",
          options: [
            "Fricative",
            "Plosive", 
            "Nasal",
            "Liquid"
          ],
          correctAnswer: 0,
          explanation: "ߗ [ʃ] is a fricative consonant, produced by air flowing through a narrow channel.",
          difficulty: "hard",
          points: 3
        },
        {
          question: "In N'Ko syllable structure, what is the most common pattern?",
          options: [
            "V (vowel only)",
            "CV (consonant-vowel)",
            "CVC (consonant-vowel-consonant)",
            "CVCC (consonant-vowel-consonant-consonant)"
          ],
          correctAnswer: 1,
          explanation: "CV (consonant-vowel) is the most common syllable pattern in N'Ko, as in ߞߊ (ka), ߓߊ (ba), etc.",
          difficulty: "hard",
          points: 3
        },
        {
          question: "Why do many family-related words in Mande languages contain labial consonants (ߓ, ߡ, ߝ)?",
          options: [
            "They're easier to pronounce",
            "They're the first sounds babies can make",
            "They're more common in the language",
            "They have religious significance"
          ],
          correctAnswer: 1,
          explanation: "Labial consonants are among the first sounds babies can produce, creating a natural connection to family and nurturing concepts.",
          difficulty: "hard",
          points: 3
        }
      ],
      passingScore: 12,
      totalPoints: 17
    },
    
    summary: `
      Excellent work! You have now mastered all 20 N'Ko consonants and understand their role in building the rich vocabulary of Manding languages. You have learned:
      
      • All 20 consonant characters with precise pronunciation
      • Consonant categorization by articulation (labial, dental, velar, etc.)
      • Cultural significance of different consonant sounds in Mande traditions
      • Word formation through consonant-vowel combinations
      • Complex syllable structures and multi-syllable words
      • Reading fluency techniques for N'Ko text comprehension
      
      With vowels and consonants mastered, you now have the complete foundation for N'Ko literacy. You're ready to explore advanced topics like tone marks, grammar structures, and begin reading authentic N'Ko literature.
    `,
    
    nextSteps: [
      "Learn N'Ko tone marks and diacritical systems",
      "Practice reading simple N'Ko texts and stories",
      "Begin writing your own N'Ko words and sentences",
      "Explore N'Ko grammar and sentence construction"
    ],
    
    culturalConnections: [
      "Read traditional N'Ko proverbs to see consonants in cultural context",
      "Explore how consonant patterns reflect Mande linguistic heritage",
      "Listen to N'Ko poetry recitations emphasizing consonant clarity",
      "Study the connection between consonant sounds and traditional naming practices"
    ]
  }
};

async function seedConsonantsLesson() {
  try {
    console.log('🌱 Starting comprehensive N\'Ko consonants lesson seeding...');
    
    const createdLesson = await prisma.nkoLesson.create({
      data: consonantsLesson
    });
    
    console.log(`✅ Created comprehensive consonants lesson: ${createdLesson.slug}`);
    console.log('🎉 Consonants lesson seeding completed successfully!');
    
    return createdLesson;
    
  } catch (error) {
    console.error('❌ Error seeding consonants lesson:', error);
    throw error;
  }
}

// Run the seeding
async function main() {
  try {
    await seedConsonantsLesson();
  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  main();
}

module.exports = { seedConsonantsLesson, consonantsLesson }; 