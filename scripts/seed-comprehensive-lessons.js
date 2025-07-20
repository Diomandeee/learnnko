const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Comprehensive N'Ko Lessons for Database Seeding
const comprehensiveLessons = [
  {
    slug: "nko-introduction-comprehensive",
    title: "Complete Introduction to N'Ko Script",
    description: "Deep dive into the history, philosophy, and modern applications of the N'Ko writing system",
    level: "beginner",
    module: "foundations",
    moduleOrder: 1,
    track: "foundations",
    order: 1,
    prerequisites: [],
    topics: ["history", "culture", "philosophy", "modern-usage", "writing-systems"],
    estimatedTime: 45,
    duration: "45 minutes",
    tags: ["introduction", "history", "cultural-context"],
    objectives: [
      "Understand the historical context and creation of N'Ko by Solomana Kanté",
      "Appreciate the cultural and political significance of indigenous African scripts",
      "Learn about the philosophical principles behind N'Ko",
      "Explore modern applications and digital adaptation of N'Ko",
      "Compare N'Ko with other writing systems and understand its unique features",
      "Develop motivation for learning N'Ko as part of cultural heritage"
    ],
    vocabulary: ["ߒߞߏ", "ߛߟߏߡߊߣߊ߫ ߞߊ߲ߕߍ", "ߞߊ߬ߙߊ߲", "ߝߘߊ߬ߝߌ߲", "ߊߝߙߌߞߌ߬"],
    grammarPoints: ["Introduction to right-to-left reading", "Basic script orientation"],
    culturalNotes: [
      "N'Ko's role in preserving Mande cultural identity",
      "The connection between language and cultural sovereignty",
      "Regional variations and dialectal considerations"
    ],
    isActive: true,
    difficulty: 1,
    content: {
      introduction: `Welcome to your journey into N'Ko (ߒߞߏ), one of Africa's most successful indigenous writing systems. This comprehensive introduction will immerse you in the rich history, philosophy, and modern applications of this remarkable script that represents millions of West African voices.`,
      
      sections: [
        {
          title: "The Visionary: Solomana Kanté",
          order: 1,
          duration: 8,
          content: `
            <h3>The Man Behind the Script</h3>
            <p>Solomana Kanté (ߛߟߏߡߊߣߊ߫ ߞߊ߲ߕߍ߫) was born around 1922 in Dubréka, Guinea. A merchant and intellectual, Kanté became deeply concerned about the lack of written literature in African languages and the dependency on Arabic and Latin scripts for African expression.</p>
            
            <div class="nko-text-display">
              <p class="nko-large">ߛߟߏߡߊߣߊ߫ ߞߊ߲ߕߍ߫</p>
              <p class="transliteration">Solomana Kanté</p>
            </div>
            
            <h4>The Inspiration Moment</h4>
            <p>According to historical accounts, Kanté was inspired to create N'Ko after a radio debate in the 1940s where a Middle Eastern speaker claimed that Africans were not capable of creating their own writing systems. This moment crystallized Kanté's determination to prove that African languages and African minds were equally capable of sophisticated written expression.</p>
            
            <h4>The Creation Process (1949)</h4>
            <p>Working in secret, Kanté spent months analyzing the sounds of Manding languages (particularly Maninka) and developing a script that would:</p>
            <ul>
              <li>Capture all the phonemic distinctions of Manding languages</li>
              <li>Be easy to learn and write</li>
              <li>Be visually distinctive and aesthetically pleasing</li>
              <li>Incorporate the philosophical worldview of Mande peoples</li>
            </ul>
          `,
          nkoText: "ߒߞߏ ߦߋ߫ ߛߟߏߡߊߣߊ߫ ߞߊ߲ߕߍ߫ ߟߊ߫ ߘߋ߬ߙߌ߬ߝߊ ߟߋ߬ ߘߌ߫",
          latinTransliteration: "N'ko ye Solomana Kanté la derifa le di",
          englishTranslation: "N'Ko is Solomana Kanté's creation",
          pronunciation: "[ŋ̀kó jé sòlòmàná kántɛ́ là dèrífa lé dì]",
          audioPrompt: "Narrator introducing Solomana Kanté with respectful, inspiring tone",
          exercises: [
            {
              type: "multiple-choice",
              question: "In what year did Solomana Kanté create the N'Ko script?",
              options: ["1947", "1949", "1951", "1952"],
              correctAnswer: 1,
              explanation: "Solomana Kanté created N'Ko in 1949, after being inspired by a radio debate about African capabilities.",
              difficulty: "easy"
            },
            {
              type: "multiple-choice", 
              question: "What was Kanté's primary motivation for creating N'Ko?",
              options: [
                "To replace Arabic script entirely",
                "To prove African capability in creating writing systems", 
                "To compete with Latin alphabets",
                "To write religious texts only"
              ],
              correctAnswer: 1,
              explanation: "Kanté was motivated by a radio debate claiming Africans couldn't create writing systems, driving him to prove otherwise.",
              difficulty: "medium"
            },
            {
              type: "fill-blank",
              question: "Complete the name: Solomana ______",
              options: ["Kanté", "Kante", "Kanteh", "Kanta"],
              correctAnswer: 0,
              explanation: "The creator's full name is Solomana Kanté (ߛߟߏߡߊߣߊ߫ ߞߊ߲ߕߍ߫).",
              difficulty: "easy"
            }
          ]
        },
        
        {
          title: "Philosophy and Principles of N'Ko",
          order: 2,
          duration: 10,
          content: `
            <h3>The Word "N'Ko" Itself</h3>
            <div class="nko-text-display">
              <p class="nko-large">ߒߞߏ</p>
              <p class="transliteration">N'ko</p>
              <p class="translation">"I say" or "I speak"</p>
            </div>
            
            <p>The name "N'Ko" (ߒߞߏ) literally means "I say" in Maninka, embodying the fundamental human right to express oneself in one's own language and script. This choice of name reflects deeper philosophical principles:</p>
            
            <h4>Core Philosophical Principles</h4>
            <ol>
              <li><strong>Linguistic Sovereignty:</strong> Every people has the right to written expression in their own language</li>
              <li><strong>Cultural Authenticity:</strong> African languages deserve African scripts that capture their unique features</li>
              <li><strong>Educational Accessibility:</strong> Learning should begin in one's mother tongue for maximum comprehension</li>
              <li><strong>Historical Continuity:</strong> Connecting modern Africans with their pre-colonial intellectual traditions</li>
            </ol>
            
            <h4>The Script's Design Philosophy</h4>
            <p>Kanté designed N'Ko with specific principles in mind:</p>
            
            <h5>1. Phonetic Precision</h5>
            <p>Unlike adaptations of Arabic or Latin scripts, N'Ko was created specifically for Manding languages, ensuring perfect sound-to-symbol correspondence.</p>
            
            <h5>2. Visual Harmony</h5>
            <p>The characters flow elegantly from right to left, with proportions that create pleasing visual balance on the page.</p>
            
            <h5>3. Practical Efficiency</h5>
            <p>The script includes built-in features for tone marking, vowel nasalization, and other phonemic distinctions crucial to Manding languages.</p>
            
            <h5>4. Cultural Resonance</h5>
            <p>The direction of writing (right to left) and certain character shapes reflect aesthetic preferences within Mande cultural traditions.</p>
          `,
          nkoText: "ߒߞߏ ߟߊ߫ ߡߊ߬ߘߎ߮ ߦߋ߫ ߞߏ߫ ߒ ߦߋ߫ ߞߊ߬ߣߌ߲߬",
          latinTransliteration: "N'ko la madu ye ko n ye kanin",
          englishTranslation: "N'Ko's meaning is 'I speak'",
          pronunciation: "[ŋ̀kó là mádu jé kó ǹ jé kànìn]",
          audioPrompt: "Calm, philosophical explanation of N'Ko's meaning and principles",
          exercises: [
            {
              type: "multiple-choice",
              question: "What does 'N'Ko' literally mean in Maninka?",
              options: ["I write", "I say", "I read", "I understand"],
              correctAnswer: 1,
              explanation: "N'Ko (ߒߞߏ) means 'I say' or 'I speak', emphasizing the right to express oneself in one's own language.",
              difficulty: "easy"
            },
            {
              type: "multiple-choice",
              question: "Which philosophical principle was NOT a core motivation for N'Ko?",
              options: [
                "Linguistic sovereignty",
                "Commercial expansion", 
                "Cultural authenticity",
                "Educational accessibility"
              ],
              correctAnswer: 1,
              explanation: "Commercial expansion was not a philosophical motivation. N'Ko was created for cultural, educational, and linguistic sovereignty reasons.",
              difficulty: "medium"
            },
            {
              type: "matching",
              question: "Match the N'Ko design principle with its description:",
              pairs: [
                {left: "Phonetic Precision", right: "Perfect sound-to-symbol correspondence"},
                {left: "Visual Harmony", right: "Elegant flow from right to left"},
                {left: "Cultural Resonance", right: "Reflects Mande aesthetic preferences"}
              ],
              explanation: "Each design principle serves a specific purpose in making N'Ko effective for Manding languages.",
              difficulty: "medium"
            }
          ]
        },
        
        {
          title: "Historical Context and Cultural Impact",
          order: 3,
          duration: 12,
          content: `
            <h3>West Africa in the 1940s</h3>
            <p>To understand N'Ko's significance, we must understand the context of its creation. In the 1940s, West Africa was under colonial rule, and African languages were often dismissed as "inferior" or "primitive" by colonial authorities.</p>
            
            <h4>The Colonial Education System</h4>
            <p>Colonial education systems deliberately marginalized African languages:</p>
            <ul>
              <li>Students were punished for speaking local languages in schools</li>
              <li>All "serious" education was conducted in European languages</li>
              <li>African languages were seen as obstacles to "civilization"</li>
              <li>Written African literature was virtually non-existent</li>
            </ul>
            
            <h4>The Arabic Script Tradition</h4>
            <p>Before N'Ko, Manding languages were sometimes written using adapted Arabic script (called Ajami). However, this had limitations:</p>
            <ul>
              <li>Arabic script doesn't represent all Manding sounds accurately</li>
              <li>It was primarily used for religious texts</li>
              <li>Literacy in Arabic script required extensive religious education</li>
              <li>It reinforced the idea that African languages needed "foreign" scripts</li>
            </ul>
            
            <h3>N'Ko's Revolutionary Impact</h3>
            
            <h4>Immediate Effects (1950s-1960s)</h4>
            <p>When Kanté introduced N'Ko, the impact was immediate and dramatic:</p>
            
            <h5>1. Literacy Explosion</h5>
            <p>People who had struggled with Arabic or French scripts found N'Ko remarkably easy to learn. Adult literacy classes saw unprecedented success rates.</p>
            
            <h5>2. Cultural Revival</h5>
            <p>For the first time, people could write their own stories, preserve their oral traditions, and express modern ideas in their native language.</p>
            
            <h5>3. Educational Innovation</h5>
            <p>Progressive educators began experimenting with N'Ko-based education, showing improved learning outcomes when children could learn in their mother tongue.</p>
            
            <h4>Long-term Impact (1970s-present)</h4>
            
            <h5>1. Literary Flourishing</h5>
            <p>N'Ko enabled the creation of a rich literary tradition:</p>
            <ul>
              <li>Historical chronicles and genealogies</li>
              <li>Modern poetry and fiction</li>
              <li>Educational textbooks</li>
              <li>Newspapers and magazines</li>
              <li>Religious and philosophical works</li>
            </ul>
            
            <h5>2. Pan-African Inspiration</h5>
            <p>N'Ko's success inspired other African script creation projects and reinforced the idea that African languages deserved their own writing systems.</p>
            
            <h5>3. Digital Age Adaptation</h5>
            <p>N'Ko was among the first African scripts to be successfully digitized, with Unicode support ensuring its survival in the digital age.</p>
            
            <h4>Geographic Spread</h4>
            <p>Today, N'Ko is used across multiple countries:</p>
            <ul>
              <li><strong>Guinea:</strong> Official recognition and government support</li>
              <li><strong>Mali:</strong> Growing use in education and media</li>
              <li><strong>Burkina Faso:</strong> Cultural associations and literacy programs</li>
              <li><strong>Ivory Coast:</strong> Diaspora communities and cultural preservation</li>
              <li><strong>Senegal:</strong> Cross-border communities and cultural exchange</li>
              <li><strong>Gambia:</strong> Linguistic research and cultural programs</li>
            </ul>
          `,
          nkoText: "ߒߞߏ ߞߊ߬ ߝߘߊ߬ߝߌ߲ ߠߊ߫ ߞߊ߬ߙߊ߲ ߞߊ߬ߙߊ߲߬ߘߊ ߟߊߘߍ߭",
          latinTransliteration: "N'ko ka fadafin la karan karanda la de",
          englishTranslation: "N'Ko brought learning and writing to the people",
          pronunciation: "[ŋ̀kó ká fàdàfìn là kàrán kàràndà là dé]",
          audioPrompt: "Inspiring narrative about N'Ko's transformative impact on African education and culture",
          exercises: [
            {
              type: "multiple-choice",
              question: "What was a major limitation of using Arabic script for Manding languages?",
              options: [
                "It was too difficult to learn",
                "It didn't represent all Manding sounds accurately",
                "It was banned by colonial authorities", 
                "It required too much paper"
              ],
              correctAnswer: 1,
              explanation: "Arabic script, while historically important, couldn't accurately represent all the phonetic distinctions in Manding languages.",
              difficulty: "medium"
            },
            {
              type: "multiple-choice",
              question: "Which of these was NOT an immediate effect of N'Ko's introduction?",
              options: [
                "Literacy explosion",
                "Cultural revival",
                "Educational innovation",
                "Government adoption"
              ],
              correctAnswer: 3,
              explanation: "Government adoption came later. The immediate effects were grassroots: literacy improvements, cultural revival, and educational innovation.",
              difficulty: "hard"
            },
            {
              type: "fill-blank",
              question: "N'Ko inspired other _______ script creation projects across Africa.",
              options: ["indigenous", "foreign", "religious", "colonial"],
              correctAnswer: 0,
              explanation: "N'Ko's success demonstrated that indigenous African scripts were viable, inspiring similar projects for other African languages.",
              difficulty: "medium"
            }
          ]
        },
        
        {
          title: "Modern N'Ko: Digital Age and Global Reach",
          order: 4,
          duration: 10,
          content: `
            <h3>N'Ko in the Digital Era</h3>
            <p>The transition from handwritten manuscripts to digital media presented both challenges and opportunities for N'Ko.</p>
            
            <h4>Unicode Integration</h4>
            <p>N'Ko was officially added to the Unicode Standard in 2006 (Unicode 5.0), ensuring its compatibility with modern digital systems:</p>
            <ul>
              <li><strong>Unicode Block:</strong> U+07C0–U+07FF</li>
              <li><strong>Number of Characters:</strong> 59 characters</li>
              <li><strong>Coverage:</strong> All letters, digits, punctuation, and diacritics</li>
            </ul>
            
            <h4>Digital Tools and Platforms</h4>
            
            <h5>1. Keyboards and Input Methods</h5>
            <ul>
              <li>Physical N'Ko keyboards for desktop computers</li>
              <li>Software keyboard layouts for Windows, Mac, and Linux</li>
              <li>Mobile keyboards for iOS and Android</li>
              <li>Web-based input tools</li>
            </ul>
            
            <h5>2. Fonts and Typography</h5>
            <ul>
              <li>Professional N'Ko fonts for publishing</li>
              <li>Web fonts for online content</li>
              <li>Calligraphic fonts preserving traditional aesthetics</li>
              <li>Educational fonts designed for learning</li>
            </ul>
            
            <h5>3. Software Applications</h5>
            <ul>
              <li>Word processors with N'Ko support</li>
              <li>Educational software and games</li>
              <li>Translation tools and dictionaries</li>
              <li>Social media platforms with N'Ko support</li>
            </ul>
            
            <h4>Online Communities and Resources</h4>
            
            <h5>1. Educational Platforms</h5>
            <p>Modern N'Ko education has embraced digital methods:</p>
            <ul>
              <li>Interactive learning websites</li>
              <li>Mobile apps for alphabet learning</li>
              <li>Online courses and tutorials</li>
              <li>Virtual classrooms for remote learning</li>
            </ul>
            
            <h5>2. Cultural Preservation</h5>
            <ul>
              <li>Digital archives of N'Ko manuscripts</li>
              <li>Online libraries of N'Ko literature</li>
              <li>Multimedia projects combining text, audio, and video</li>
              <li>Collaborative translation projects</li>
            </ul>
            
            <h5>3. Social Networks</h5>
            <p>N'Ko communities have formed vibrant online networks:</p>
            <ul>
              <li>Facebook groups for N'Ko learners</li>
              <li>WhatsApp groups for daily communication</li>
              <li>YouTube channels for education and entertainment</li>
              <li>Blogs and websites in N'Ko</li>
            </ul>
            
            <h4>Global Diaspora and Cultural Exchange</h4>
            
            <h5>1. Diaspora Communities</h5>
            <p>Manding speakers worldwide use N'Ko to maintain cultural connections:</p>
            <ul>
              <li><strong>Europe:</strong> France, Belgium, Spain</li>
              <li><strong>North America:</strong> United States, Canada</li>
              <li><strong>Middle East:</strong> Saudi Arabia, UAE</li>
              <li><strong>Asia:</strong> China, Japan (students and workers)</li>
            </ul>
            
            <h5>2. Academic Interest</h5>
            <ul>
              <li>Universities offering N'Ko courses</li>
              <li>Linguistic research projects</li>
              <li>Cultural studies programs</li>
              <li>International conferences and symposiums</li>
            </ul>
            
            <h5>3. Cultural Diplomacy</h5>
            <p>N'Ko serves as a tool for cultural diplomacy and African representation:</p>
            <ul>
              <li>Cultural centers teaching N'Ko abroad</li>
              <li>International festivals featuring N'Ko literature</li>
              <li>Diplomatic missions promoting African languages</li>
              <li>UNESCO recognition of N'Ko's cultural importance</li>
            </ul>
          `,
          nkoText: "ߒߞߏ ߦߋ߫ ߓߟߏߡߊߜߍ߲ ߞߣߐߟߊ ߘߐ߫ ߢߊ ߟߊ߫",
          latinTransliteration: "N'ko ye bulomaw kɛnɔla do sa la",
          englishTranslation: "N'Ko is advancing in the digital world",
          pronunciation: "[ŋ̀kó jé bùlòmàw kɛ̀nɔ̀là dò sá là]",
          audioPrompt: "Modern, tech-savvy explanation of N'Ko's digital presence",
          exercises: [
            {
              type: "multiple-choice",
              question: "In which year was N'Ko added to the Unicode Standard?",
              options: ["2004", "2006", "2008", "2010"],
              correctAnswer: 1,
              explanation: "N'Ko was officially added to Unicode 5.0 in 2006, ensuring digital compatibility.",
              difficulty: "medium"
            },
            {
              type: "multiple-choice",
              question: "Which Unicode block contains N'Ko characters?",
              options: ["U+0600–U+06FF", "U+07C0–U+07FF", "U+0800–U+08FF", "U+0900–U+097F"],
              correctAnswer: 1,
              explanation: "N'Ko occupies the Unicode block U+07C0–U+07FF with 59 characters total.",
              difficulty: "hard"
            },
            {
              type: "multiple-choice",
              question: "Modern N'Ko education benefits from digital tools in all these ways EXCEPT:",
              options: [
                "Interactive learning websites",
                "Mobile apps for alphabet learning", 
                "Replacement of traditional teaching",
                "Virtual classrooms for remote learning"
              ],
              correctAnswer: 2,
              explanation: "Digital tools enhance rather than replace traditional N'Ko teaching methods, preserving cultural transmission.",
              difficulty: "medium"
            }
          ]
        },
        
        {
          title: "Your Journey Forward: Learning N'Ko Today",
          order: 5,
          duration: 5,
          content: `
            <h3>Why Learn N'Ko in the 21st Century?</h3>
            
            <h4>Personal Benefits</h4>
            <ul>
              <li><strong>Cultural Connection:</strong> Connect with your heritage or explore African culture</li>
              <li><strong>Cognitive Benefits:</strong> Learning a new script enhances brain plasticity</li>
              <li><strong>Unique Skill:</strong> Join a select group of global N'Ko literates</li>
              <li><strong>Historical Perspective:</strong> Understand Africa's intellectual contributions</li>
            </ul>
            
            <h4>Career Opportunities</h4>
            <ul>
              <li>Translation and interpretation services</li>
              <li>Cultural consulting and education</li>
              <li>Academic research and scholarship</li>
              <li>International development work</li>
              <li>Digital preservation projects</li>
            </ul>
            
            <h4>Your Learning Path</h4>
            <p>This course will take you through a structured journey:</p>
            
            <ol>
              <li><strong>Foundation:</strong> Master the alphabet and basic writing</li>
              <li><strong>Building:</strong> Learn vocabulary and simple sentences</li>
              <li><strong>Developing:</strong> Read texts and understand grammar</li>
              <li><strong>Advancing:</strong> Write your own texts and engage with literature</li>
              <li><strong>Mastering:</strong> Participate in the global N'Ko community</li>
            </ol>
            
            <h4>Community and Support</h4>
            <p>You're not learning alone. Join a global community of N'Ko learners and speakers who are passionate about preserving and promoting this remarkable script.</p>
            
            <div class="motivational-quote">
              <blockquote>
                <p class="nko-large">ߒߞߏ ߞߊ߬ߙߊ߲ ߞߊ߬ ߞߏ߫ ߛߌߦߊߡߊ߲߫ ߠߊ߫ ߕߎ߬ߡߊ ߘߏ߫ ߟߊߘߍ߬</p>
                <p class="transliteration">N'ko karan ka ko siyaman la tuma do la de</p>
                <p class="translation">"Learning N'Ko brings wisdom for future times"</p>
              </blockquote>
              <cite>- Traditional N'Ko saying</cite>
            </div>
          `,
          nkoText: "ߌ ߞߊ߬ ߒߞߏ ߞߊ߬ߙߊ߲߬ ߞߊ߬ ߛߌߦߊߡߊ߲߫ ߛߐ߬ߘߐ߲߬",
          latinTransliteration: "I ka N'ko karan ka siyaman sodon",
          englishTranslation: "You will learn N'Ko and gain wisdom",
          pronunciation: "[í ká ŋ̀kó kàrán ká sìjàmàn sòdòn]",
          audioPrompt: "Encouraging, motivational tone inspiring the learner to begin their N'Ko journey",
          exercises: [
            {
              type: "reflection",
              question: "What motivates you most about learning N'Ko?",
              options: [
                "Cultural connection and heritage",
                "Unique intellectual challenge",
                "Career opportunities", 
                "Contributing to cultural preservation"
              ],
              explanation: "All motivations are valid! N'Ko offers rich rewards for every type of learner.",
              difficulty: "easy"
            },
            {
              type: "goal-setting",
              question: "What would you like to achieve with N'Ko in the next 6 months?",
              options: [
                "Read simple N'Ko texts",
                "Write basic sentences",
                "Understand cultural contexts",
                "All of the above"
              ],
              correctAnswer: 3,
              explanation: "A comprehensive approach combining reading, writing, and cultural understanding provides the best foundation.",
              difficulty: "easy"
            }
          ]
        }
      ],
      
      quiz: {
        title: "Complete Introduction to N'Ko Assessment",
        description: "Test your understanding of N'Ko's history, philosophy, and modern applications",
        questions: [
          {
            question: "Who created the N'Ko script and in what year?",
            options: [
              "Solomana Kanté in 1947",
              "Solomana Kanté in 1949", 
              "Ahmadou Bamba in 1949",
              "Sekou Touré in 1951"
            ],
            correctAnswer: 1,
            explanation: "Solomana Kanté created N'Ko in 1949 after being inspired by a radio debate about African intellectual capabilities.",
            difficulty: "medium",
            points: 2
          },
          {
            question: "What does 'N'Ko' literally mean in Maninka?",
            options: ["I write", "I say", "I read", "I understand"],
            correctAnswer: 1,
            explanation: "N'Ko (ߒߞߏ) means 'I say' or 'I speak', emphasizing the right to express oneself in one's own language.",
            difficulty: "easy", 
            points: 1
          },
          {
            question: "Which philosophical principle was MOST central to Kanté's creation of N'Ko?",
            options: [
              "Economic development",
              "Religious expression",
              "Linguistic sovereignty", 
              "Political independence"
            ],
            correctAnswer: 2,
            explanation: "Linguistic sovereignty - the right of every people to written expression in their own language - was the core philosophical motivation.",
            difficulty: "medium",
            points: 2
          },
          {
            question: "In which Unicode block are N'Ko characters located?",
            options: ["U+0600–U+06FF", "U+07C0–U+07FF", "U+0800–U+08FF", "U+0900–U+097F"],
            correctAnswer: 1,
            explanation: "N'Ko was assigned to Unicode block U+07C0–U+07FF in Unicode 5.0 (2006).",
            difficulty: "hard",
            points: 3
          },
          {
            question: "What was a major limitation of using Arabic script for Manding languages?",
            options: [
              "It was too expensive to learn",
              "It didn't represent all Manding sounds accurately",
              "It was banned by colonial governments",
              "It required special paper"
            ],
            correctAnswer: 1,
            explanation: "Arabic script, while historically important, couldn't accurately represent all the phonetic distinctions crucial to Manding languages.",
            difficulty: "medium",
            points: 2
          },
          {
            question: "Which of these countries does NOT have significant N'Ko usage today?",
            options: ["Guinea", "Mali", "Nigeria", "Burkina Faso"],
            correctAnswer: 2,
            explanation: "Nigeria, while having diverse languages, is not a primary region for N'Ko usage. N'Ko is mainly used in Manding-speaking areas of West Africa.",
            difficulty: "hard",
            points: 3
          },
          {
            question: "What immediate effect did N'Ko have when it was first introduced?",
            options: [
              "Government adoption",
              "Literacy explosion among speakers",
              "Replacement of Arabic script",
              "University recognition"
            ],
            correctAnswer: 1,
            explanation: "The most immediate and dramatic effect was a literacy explosion - people found N'Ko remarkably easy to learn compared to adapted foreign scripts.",
            difficulty: "medium",
            points: 2
          },
          {
            question: "How many characters are included in the N'Ko Unicode block?",
            options: ["45", "52", "59", "63"],
            correctAnswer: 2,
            explanation: "The N'Ko Unicode block contains 59 characters, including all letters, digits, punctuation, and diacritical marks.",
            difficulty: "hard",
            points: 3
          }
        ],
        passingScore: 12,
        totalPoints: 18
      },
      
      summary: `
        You have completed a comprehensive introduction to N'Ko script! You now understand:
        
        • The remarkable story of Solomana Kanté and his creation of N'Ko in 1949
        • The philosophical principles of linguistic sovereignty and cultural authenticity that drive N'Ko
        • The historical context that made N'Ko revolutionary for West African education and culture
        • N'Ko's successful adaptation to the digital age and its global reach today
        • Your own motivation and path forward for learning this important African script
        
        This foundation prepares you for the practical work ahead: learning to read, write, and express yourself in N'Ko. Remember that you're not just learning a script - you're joining a movement to preserve and promote African linguistic heritage.
      `,
      
      nextSteps: [
        "Begin learning the N'Ko alphabet with vowels and consonants",
        "Practice writing direction and basic character formation", 
        "Explore simple N'Ko words and their meanings",
        "Connect with the global N'Ko learning community"
      ],
      
      culturalConnections: [
        "Visit online N'Ko libraries to see the script in use",
        "Listen to N'Ko poetry and musical performances",
        "Learn about other African writing systems like Ge'ez and Tifinagh",
        "Explore the broader Mande cultural traditions"
      ]
    }
  },

  // Additional comprehensive lessons can be added here...
  {
    slug: "nko-vowels-comprehensive",
    title: "Mastering N'Ko Vowels: Foundation of Pronunciation",
    description: "Complete exploration of the seven N'Ko vowels with pronunciation mastery, cultural context, and practical application",
    level: "beginner",
    module: "alphabet-fundamentals", 
    moduleOrder: 2,
    track: "foundations",
    order: 2,
    prerequisites: ["nko-introduction-comprehensive"],
    topics: ["alphabet", "vowels", "pronunciation", "phonetics", "oral-tradition"],
    estimatedTime: 50,
    duration: "50 minutes",
    tags: ["vowels", "pronunciation", "phonetics", "oral-skills"],
    objectives: [
      "Master the pronunciation of all seven N'Ko vowel characters",
      "Understand the distinction between oral and nasal vowels", 
      "Learn the cultural importance of precise pronunciation in oral traditions",
      "Practice vowel combinations and their effects on meaning",
      "Develop listening skills for vowel recognition",
      "Connect vowel sounds to musical and tonal traditions"
    ],
    vocabulary: ["ߊ", "ߍ", "ߎ", "ߏ", "ߐ", "ߑ", "ߒ", "ߞߐߣߌ߲ߓߊ", "ߟߊ߬ߡߌ߬ߟߌ"],
    grammarPoints: ["Vowel nasalization", "Vowel length distinctions", "Tonal vowel interactions"],
    culturalNotes: [
      "The role of vowels in traditional Mande music",
      "Oral poetry and vowel-based rhythm patterns",
      "Regional pronunciation variations across Mande territories"
    ],
    isActive: true,
    difficulty: 2,
    content: {
      introduction: `The seven vowels of N'Ko are the musical foundation of the script. In Mande culture, precise pronunciation connects us to centuries of oral tradition, where every sound carries meaning, emotion, and cultural memory. This lesson will immerse you in the beautiful world of N'Ko vowels.`,
      
      sections: [
        {
          title: "The Sacred Seven: Introduction to N'Ko Vowels",
          order: 1,
          duration: 8,
          content: `
            <h3>Why Vowels Matter in N'Ko</h3>
            <p>In Mande languages, vowels are not just sounds - they are the carriers of tone, emotion, and meaning. The seven N'Ko vowels represent a sophisticated phonetic system that captures the musical nature of Manding languages.</p>
            
            <div class="vowel-overview-grid">
              <div class="vowel-card oral">
                <h4>Oral Vowels (4)</h4>
                <div class="vowel-list">
                  <span class="nko-char">ߊ</span> [a] - "ah" as in "father"<br>
                  <span class="nko-char">ߍ</span> [ɛ] - "eh" as in "bed"<br>
                  <span class="nko-char">ߎ</span> [u] - "oo" as in "moon"<br>
                  <span class="nko-char">ߏ</span> [ɔ] - "aw" as in "law"
                </div>
              </div>
              
              <div class="vowel-card nasal">
                <h4>Nasal Vowels (2)</h4>
                <div class="vowel-list">
                  <span class="nko-char">ߐ</span> [ɛ̃] - nasal "eh"<br>
                  <span class="nko-char">ߑ</span> [ã] - nasal "ah"
                </div>
              </div>
              
              <div class="vowel-card special">
                <h4>Special Character (1)</h4>
                <div class="vowel-list">
                  <span class="nko-char">ߒ</span> [ɲ] - "ny" as in "canyon"
                </div>
              </div>
            </div>
            
            <h4>The Music Connection</h4>
            <p>Traditional Mande music relies heavily on vocal techniques that emphasize vowel clarity. Griots (traditional storytellers) use precise vowel pronunciation to:</p>
            <ul>
              <li>Convey emotional nuances in epic narratives</li>
              <li>Maintain rhythmic patterns in sung poetry</li>
              <li>Ensure accurate transmission of historical accounts</li>
              <li>Create aesthetic pleasure through sound beauty</li>
            </ul>
            
            <h4>Practical Importance</h4>
            <p>Vowel precision in N'Ko is crucial because:</p>
            <ul>
              <li>Different vowels can completely change word meanings</li>
              <li>Nasal vs. oral distinctions are phonemic (meaning-changing)</li>
              <li>Tone markers interact with vowel types</li>
              <li>Proper pronunciation shows cultural respect and competence</li>
            </ul>
          `,
          nkoText: "ߞߐߣߌ߲ߓߊ ߦߋ߫ ߒߞߏ ߞߊ߬ߙߊ߲ ߞߊ߬ߙߊ߲ߘߊ ߟߊ߫ ߕߊ߲ߓߊ߲ ߠߋ߬ ߘߌ߫",
          latinTransliteration: "Kɔnɔnba ye N'ko karan karanda la tanban le di",
          englishTranslation: "Vowels are the foundation of N'Ko learning",
          pronunciation: "[kɔ̀nɔ̀nbà jé ŋ̀kó kàrán kàràndà là tànbàn lé dì]",
          audioPrompt: "Clear, musical pronunciation emphasizing each vowel sound distinctly",
          exercises: [
            {
              type: "multiple-choice",
              question: "How many oral vowels does N'Ko have?",
              options: ["3", "4", "5", "7"],
              correctAnswer: 1,
              explanation: "N'Ko has four oral vowels: ߊ [a], ߍ [ɛ], ߎ [u], and ߏ [ɔ].",
              difficulty: "easy"
            },
            {
              type: "multiple-choice",
              question: "Why is vowel precision important in traditional Mande culture?",
              options: [
                "For writing speed",
                "For maintaining rhythmic patterns in oral traditions",
                "For saving ink",
                "For easier reading"
              ],
              correctAnswer: 1,
              explanation: "Griots and traditional storytellers rely on precise vowel pronunciation to maintain rhythmic patterns and convey emotional nuances in oral traditions.",
              difficulty: "medium"
            },
            {
              type: "audio-recognition",
              question: "Listen and identify the vowel sound:",
              audioPrompt: "[Clear pronunciation of 'ߊ' sound]",
              options: ["ߊ", "ߍ", "ߎ", "ߏ"],
              correctAnswer: 0,
              explanation: "This is the vowel ߊ [a], pronounced like 'ah' in 'father'.",
              difficulty: "medium"
            }
          ]
        },

        {
          title: "The Four Oral Vowels: Heart of N'Ko Sound",
          order: 2,
          duration: 15,
          content: `
            <h3>ߊ [a] - The Open Heart Vowel</h3>
            <div class="vowel-detailed-study">
              <div class="character-display">
                <span class="nko-huge">ߊ</span>
                <div class="pronunciation-guide">
                  <p><strong>Sound:</strong> [a] like "ah" in "father"</p>
                  <p><strong>Mouth Position:</strong> Fully open, tongue low and central</p>
                  <p><strong>Cultural Note:</strong> Often used in exclamations and emotional expressions</p>
                </div>
              </div>
              
              <h4>Words with ߊ</h4>
              <div class="word-examples">
                <div class="word-entry">
                  <span class="nko-text">ߓߊ</span>
                  <span class="transliteration">ba</span>
                  <span class="meaning">mother, river</span>
                  <span class="pronunciation">[bà]</span>
                </div>
                <div class="word-entry">
                  <span class="nko-text">ߞߊ</span>
                  <span class="transliteration">ka</span>
                  <span class="meaning">to do, to make</span>
                  <span class="pronunciation">[ká]</span>
                </div>
                <div class="word-entry">
                  <span class="nko-text">ߝߊ</span>
                  <span class="transliteration">fa</span>
                  <span class="meaning">father, to kill</span>
                  <span class="pronunciation">[fà]</span>
                </div>
              </div>
              
              <h4>Cultural Context: The Sacred ߊ</h4>
              <p>In traditional Mande culture, the [a] sound appears in many sacred and important words:</p>
              <ul>
                <li><strong>ߊߟߊ</strong> (Allah) - The divine name</li>
                <li><strong>ߓߊߣߊ</strong> (bana) - to refuse, deny</li>
                <li><strong>ߞߊߣߊ</strong> (kana) - to count, to matter</li>
              </ul>
            </div>
            
            <h3>ߍ [ɛ] - The Open-Mid Front Vowel</h3>
            <div class="vowel-detailed-study">
              <div class="character-display">
                <span class="nko-huge">ߍ</span>
                <div class="pronunciation-guide">
                  <p><strong>Sound:</strong> [ɛ] like "eh" in "bed"</p>
                  <p><strong>Mouth Position:</strong> Half-open, tongue forward and mid-height</p>
                  <p><strong>Cultural Note:</strong> Common in kinship terms and social relationships</p>
                </div>
              </div>
              
              <h4>Words with ߍ</h4>
              <div class="word-examples">
                <div class="word-entry">
                  <span class="nko-text">ߝߍ</span>
                  <span class="transliteration">fɛ</span>
                  <span class="meaning">two</span>
                  <span class="pronunciation">[fɛ́]</span>
                </div>
                <div class="word-entry">
                  <span class="nko-text">ߞߍ</span>
                  <span class="transliteration">kɛ</span>
                  <span class="meaning">thing, matter</span>
                  <span class="pronunciation">[kɛ́]</span>
                </div>
                <div class="word-entry">
                  <span class="nko-text">ߢߍ</span>
                  <span class="transliteration">nɛ</span>
                  <span class="meaning">to see</span>
                  <span class="pronunciation">[nɛ́]</span>
                </div>
              </div>
            </div>
            
            <h3>ߎ [u] - The Close Back Vowel</h3>
            <div class="vowel-detailed-study">
              <div class="character-display">
                <span class="nko-huge">ߎ</span>
                <div class="pronunciation-guide">
                  <p><strong>Sound:</strong> [u] like "oo" in "moon"</p>
                  <p><strong>Mouth Position:</strong> Rounded lips, tongue high and back</p>
                  <p><strong>Cultural Note:</strong> Often found in words related to gathering and community</p>
                </div>
              </div>
              
              <h4>Words with ߎ</h4>
              <div class="word-examples">
                <div class="word-entry">
                  <span class="nko-text">ߞߎ</span>
                  <span class="transliteration">ku</span>
                  <span class="meaning">head</span>
                  <span class="pronunciation">[kù]</span>
                </div>
                <div class="word-entry">
                  <span class="nko-text">ߓߎ</span>
                  <span class="transliteration">bu</span>
                  <span class="meaning">place, location</span>
                  <span class="pronunciation">[bù]</span>
                </div>
                <div class="word-entry">
                  <span class="nko-text">ߝߎ</span>
                  <span class="transliteration">fu</span>
                  <span class="meaning">to blow</span>
                  <span class="pronunciation">[fù]</span>
                </div>
              </div>
            </div>
            
            <h3>ߏ [ɔ] - The Open-Mid Back Vowel</h3>
            <div class="vowel-detailed-study">
              <div class="character-display">
                <span class="nko-huge">ߏ</span>
                <div class="pronunciation-guide">
                  <p><strong>Sound:</strong> [ɔ] like "aw" in "law"</p>
                  <p><strong>Mouth Position:</strong> Rounded lips, tongue mid-height and back</p>
                  <p><strong>Cultural Note:</strong> Appears in many traditional greetings and blessings</p>
                </div>
              </div>
              
              <h4>Words with ߏ</h4>
              <div class="word-examples">
                <div class="word-entry">
                  <span class="nko-text">ߞߏ</span>
                  <span class="transliteration">kɔ</span>
                  <span class="meaning">to say, word</span>
                  <span class="pronunciation">[kɔ́]</span>
                </div>
                <div class="word-entry">
                  <span class="nko-text">ߟߏ</span>
                  <span class="transliteration">lɔ</span>
                  <span class="meaning">to be there</span>
                  <span class="pronunciation">[lɔ́]</span>
                </div>
                <div class="word-entry">
                  <span class="nko-text">ߣߏ</span>
                  <span class="transliteration">nɔ</span>
                  <span class="meaning">here, this</span>
                  <span class="pronunciation">[nɔ́]</span>
                </div>
              </div>
            </div>
          `,
          nkoText: "ߊ߸ ߍ߸ ߎ߸ ߏ - ߞߐߣߌ߲ߓߊ ߣߊߡߎ߲߫ ߠߋ߬ ߒߞߏ ߞߊ߬ߙߊ߲ ߘߐ߫",
          latinTransliteration: "A, ɛ, u, ɔ - kɔnɔnba namun le N'ko karan do",
          englishTranslation: "A, ɛ, u, ɔ - these four vowels are in N'Ko learning",
          pronunciation: "[à ɛ̀ ù ɔ̀ kɔ̀nɔ̀nbà nàmùn lé ŋ̀kó kàrán dò]",
          audioPrompt: "Slow, clear pronunciation of each oral vowel with example words",
          exercises: [
            {
              type: "pronunciation-practice",
              question: "Practice pronouncing each oral vowel 5 times:",
              items: ["ߊ [a]", "ߍ [ɛ]", "ߎ [u]", "ߏ [ɔ]"],
              audioPrompt: "Model pronunciation for each vowel",
              explanation: "Regular practice helps develop muscle memory for correct vowel production.",
              difficulty: "medium"
            },
            {
              type: "multiple-choice",
              question: "Which vowel sound is found in the N'Ko word ߞߎ (ku - head)?",
              options: ["[a]", "[ɛ]", "[u]", "[ɔ]"],
              correctAnswer: 2,
              explanation: "ߞߎ contains the vowel ߎ [u], pronounced like 'oo' in 'moon'.",
              difficulty: "easy"
            },
            {
              type: "word-building",
              question: "Combine the consonant ߞ (k) with each oral vowel:",
              answers: ["ߞߊ (ka)", "ߞߍ (kɛ)", "ߞߎ (ku)", "ߞߏ (kɔ)"],
              explanation: "Practice combining consonants with vowels builds reading fluency.",
              difficulty: "medium"
            }
          ]
        },

        {
          title: "Nasal Vowels: The Breath of Meaning",
          order: 3,
          duration: 12,
          content: `
            <h3>Understanding Nasalization</h3>
            <p>Nasal vowels are produced when air flows through both the mouth and nose simultaneously. In Manding languages, the difference between oral and nasal vowels can completely change the meaning of a word.</p>
            
            <div class="nasalization-comparison">
              <h4>Oral vs. Nasal Pairs</h4>
              <div class="comparison-grid">
                <div class="oral-example">
                  <h5>Oral ߊ [a]</h5>
                  <span class="example-word">ߞߊ (ka) - to do</span>
                </div>
                <div class="nasal-example">
                  <h5>Nasal ߑ [ã]</h5>
                  <span class="example-word">ߞߑ (kã) - neck</span>
                </div>
              </div>
            </div>
            
            <h3>ߐ [ɛ̃] - The Nasal Open-Mid Front Vowel</h3>
            <div class="vowel-detailed-study">
              <div class="character-display">
                <span class="nko-huge">ߐ</span>
                <div class="pronunciation-guide">
                  <p><strong>Sound:</strong> [ɛ̃] nasal "eh"</p>
                  <p><strong>Production:</strong> Like ߍ [ɛ] but with air flowing through nose</p>
                  <p><strong>Practice Tip:</strong> Hold your nose while saying "eh" - you should feel vibration</p>
                </div>
              </div>
              
              <h4>Words with ߐ</h4>
              <div class="word-examples">
                <div class="word-entry">
                  <span class="nko-text">ߞߐ</span>
                  <span class="transliteration">kɛ̃</span>
                  <span class="meaning">outside, exterior</span>
                  <span class="pronunciation">[kɛ̃́]</span>
                </div>
                <div class="word-entry">
                  <span class="nko-text">ߛߐ</span>
                  <span class="transliteration">sɛ̃</span>
                  <span class="meaning">to arrive</span>
                  <span class="pronunciation">[sɛ̃́]</span>
                </div>
                <div class="word-entry">
                  <span class="nko-text">ߘߐ</span>
                  <span class="transliteration">dɛ̃</span>
                  <span class="meaning">inside, interior</span>
                  <span class="pronunciation">[dɛ̃́]</span>
                </div>
              </div>
              
              <h4>Cultural Significance</h4>
              <p>The ߐ [ɛ̃] sound appears in many words related to spatial relationships and metaphysical concepts:</p>
              <ul>
                <li><strong>ߞߐ߲</strong> (kɛ̃) - back, behind (spatial and temporal)</li>
                <li><strong>ߘߐ߲</strong> (dɛ̃) - in, within (physical and spiritual)</li>
                <li><strong>ߛߐ߲</strong> (sɛ̃) - to come, to arrive (movement and destiny)</li>
              </ul>
            </div>
            
            <h3>ߑ [ã] - The Nasal Open Central Vowel</h3>
            <div class="vowel-detailed-study">
              <div class="character-display">
                <span class="nko-huge">ߑ</span>
                <div class="pronunciation-guide">
                  <p><strong>Sound:</strong> [ã] nasal "ah"</p>
                  <p><strong>Production:</strong> Like ߊ [a] but with air flowing through nose</p>
                  <p><strong>Practice Tip:</strong> Say "ah" while pinching nose - should sound muffled</p>
                </div>
              </div>
              
              <h4>Words with ߑ</h4>
              <div class="word-examples">
                <div class="word-entry">
                  <span class="nko-text">ߞߑ</span>
                  <span class="transliteration">kã</span>
                  <span class="meaning">neck</span>
                  <span class="pronunciation">[kã́]</span>
                </div>
                <div class="word-entry">
                  <span class="nko-text">ߛߑ</span>
                  <span class="transliteration">sã</span>
                  <span class="meaning">to buy</span>
                  <span class="pronunciation">[sã́]</span>
                </div>
                <div class="word-entry">
                  <span class="nko-text">ߝߑ</span>
                  <span class="transliteration">fã</span>
                  <span class="meaning">to be sick</span>
                  <span class="pronunciation">[fã́]</span>
                </div>
              </div>
            </div>
            
            <h4>Mastering Nasal Production</h4>
            <div class="pronunciation-exercises">
              <h5>Practice Sequence:</h5>
              <ol>
                <li><strong>Awareness:</strong> Place fingers on nose, feel vibration during nasal sounds</li>
                <li><strong>Contrast:</strong> Alternate between oral and nasal versions of same vowel</li>
                <li><strong>Isolation:</strong> Practice nasal vowels in isolation before combining</li>
                <li><strong>Context:</strong> Practice nasal vowels in real words</li>
                <li><strong>Fluency:</strong> Use nasal vowels in connected speech</li>
              </ol>
            </div>
            
            <h4>Common Mistakes and Solutions</h4>
            <div class="mistake-correction">
              <div class="mistake">
                <h6>Mistake:</h6>
                <p>Pronouncing nasal vowels as oral vowels</p>
                <h6>Solution:</h6>
                <p>Practice with nose pinched - nasal vowels should sound blocked</p>
              </div>
              <div class="mistake">
                <h6>Mistake:</h6>
                <p>Over-nasalizing, making sounds unclear</p>
                <h6>Solution:</h6>
                <p>Balance nasal and oral resonance - should be clear but nasal</p>
              </div>
            </div>
          `,
          nkoText: "ߐ߸ ߑ - ߞߐߣߌ߲ߓߊ ߞߊ߬ߞߊ߬ߙߊ߫ ߝߌ߬ߟߊ ߟߋ߬ ߞߣߊ߬ ߒߞߏ ߘߐ߫",
          latinTransliteration: "Ɛ̃, ã - kɔnɔnba kakara fila le kna N'ko do",
          englishTranslation: "Ɛ̃, ã - these two nasal vowels are also in N'Ko",
          pronunciation: "[ɛ̃̀ ã̀ kɔ̀nɔ̀nbà kàkàrà fìlà lé kná ŋ̀kó dò]",
          audioPrompt: "Clear demonstration of nasal vowels with exaggerated nasalization for learning",
          exercises: [
            {
              type: "nasal-contrast",
              question: "Listen and identify whether the vowel is oral or nasal:",
              items: [
                {audio: "[ka] vs [kã]", answer: "oral vs nasal"},
                {audio: "[kɛ] vs [kɛ̃]", answer: "oral vs nasal"}
              ],
              explanation: "Developing ear training for nasal contrast is crucial for meaning distinction.",
              difficulty: "hard"
            },
            {
              type: "minimal-pairs",
              question: "Choose the correct meaning for ߞߐ (kɛ̃):",
              options: ["to do", "outside", "head", "word"],
              correctAnswer: 1,
              explanation: "ߞߐ (kɛ̃) means 'outside' or 'exterior', different from ߞߊ (ka) 'to do'.",
              difficulty: "medium"
            }
          ]
        },

        {
          title: "The Special Character ߒ [ɲ]: Bridge Between Vowels and Consonants",
          order: 4,
          duration: 8,
          content: `
            <h3>Understanding ߒ [ɲ]</h3>
            <p>The character ߒ represents the palatal nasal sound [ɲ], like "ny" in "canyon" or "gn" in French "champagne". While technically a consonant sound, ߒ is included with vowels in N'Ko pedagogy because:</p>
            
            <ul>
              <li>It often functions as a syllable nucleus</li>
              <li>It has vowel-like properties in some contexts</li>
              <li>It's crucial for the N'Ko language name itself: ߒߞߏ (N'ko)</li>
              <li>It appears in many fundamental vocabulary items</li>
            </ul>
            
            <div class="character-study">
              <div class="character-display">
                <span class="nko-huge">ߒ</span>
                <div class="pronunciation-guide">
                  <p><strong>Sound:</strong> [ɲ] like "ny" in "canyon"</p>
                  <p><strong>Production:</strong> Tongue touches hard palate, air flows through nose</p>
                  <p><strong>Cultural Note:</strong> Essential for proper N'Ko identity expression</p>
                </div>
              </div>
              
              <h4>Key Words with ߒ</h4>
              <div class="word-examples">
                <div class="word-entry featured">
                  <span class="nko-text">ߒߞߏ</span>
                  <span class="transliteration">N'ko</span>
                  <span class="meaning">I say (the script name)</span>
                  <span class="pronunciation">[ŋ̀kó]</span>
                </div>
                <div class="word-entry">
                  <span class="nko-text">ߒ</span>
                  <span class="transliteration">n</span>
                  <span class="meaning">I (pronoun)</span>
                  <span class="pronunciation">[ǹ]</span>
                </div>
                <div class="word-entry">
                  <span class="nko-text">ߒߢߐ</span>
                  <span class="transliteration">nɲɔ</span>
                  <span class="meaning">cow</span>
                  <span class="pronunciation">[ǹɲɔ́]</span>
                </div>
                <div class="word-entry">
                  <span class="nko-text">ߒߝߌߟߊ</span>
                  <span class="transliteration">nfila</span>
                  <span class="meaning">path</span>
                  <span class="pronunciation">[ǹfìlà]</span>
                </div>
              </div>
            </div>
            
            <h4>Pronunciation Mastery</h4>
            <div class="pronunciation-steps">
              <h5>Step-by-Step Guide:</h5>
              <ol>
                <li><strong>Position:</strong> Place tongue tip against lower teeth</li>
                <li><strong>Contact:</strong> Press middle tongue against hard palate</li>
                <li><strong>Airflow:</strong> Block oral airflow, allow nasal airflow</li>
                <li><strong>Voice:</strong> Add vocal cord vibration</li>
                <li><strong>Practice:</strong> Start with "canyon" then isolate the "ny" sound</li>
              </ol>
            </div>
            
            <h4>Cultural and Linguistic Importance</h4>
            <p>The ߒ sound carries special significance in Mande culture:</p>
            
            <h5>1. Identity Marker</h5>
            <p>Proper pronunciation of ߒ in "ߒߞߏ" (N'ko) marks cultural membership and linguistic competence.</p>
            
            <h5>2. Grammatical Function</h5>
            <p>As the first-person pronoun "ߒ" (I), this sound is used constantly in daily communication.</p>
            
            <h5>3. Phonological System</h5>
            <p>ߒ [ɲ] is part of a series of nasal consonants that are central to Manding phonology.</p>
            
            <h4>Regional Variations</h4>
            <p>While the [ɲ] sound is consistent across Manding regions, slight variations exist:</p>
            <ul>
              <li><strong>Eastern Maninka:</strong> Slightly more palatal</li>
              <li><strong>Western Maninka:</strong> Sometimes approaching [n] in casual speech</li>
              <li><strong>Bambara:</strong> Clear [ɲ] maintained in all contexts</li>
            </ul>
          `,
          nkoText: "ߒ ߦߋ߫ ߒߞߏ ߟߊ߫ ߞߣߌ߲ߦߌ ߟߋ߬ ߘߌ߫",
          latinTransliteration: "N ye N'ko la kɛninyi le di",
          englishTranslation: "ߒ is the root of N'Ko",
          pronunciation: "[ǹ jé ŋ̀kó là kɛ̀nìnjì lé dì]",
          audioPrompt: "Emphatic pronunciation of ߒ with detailed articulation demonstration",
          exercises: [
            {
              type: "pronunciation-focus",
              question: "Practice the sound ߒ [ɲ] in isolation 10 times",
              guidance: "Focus on tongue position against hard palate",
              audioPrompt: "Model pronunciation with slow articulation",
              difficulty: "medium"
            },
            {
              type: "word-recognition",
              question: "Which word contains the sound ߒ [ɲ]?",
              options: ["ߞߊ (ka)", "ߒߞߏ (N'ko)", "ߛߊ (sa)", "ߕߊ (ta)"],
              correctAnswer: 1,
              explanation: "ߒߞߏ (N'ko) contains the ߒ [ɲ] sound at the beginning.",
              difficulty: "easy"
            }
          ]
        },

        {
          title: "Vowel Combinations and Connected Speech",
          order: 5,
          duration: 7,
          content: `
            <h3>Vowel Sequences in N'Ko</h3>
            <p>Understanding how vowels interact in connected speech is crucial for fluent N'Ko pronunciation and comprehension.</p>
            
            <h4>Common Vowel Combinations</h4>
            <div class="vowel-combinations">
              <h5>1. Identical Vowel Sequences</h5>
              <div class="combination-examples">
                <div class="combo">
                  <span class="nko-text">ߞߊߊ</span>
                  <span class="explanation">ߞߊ + ߊ → Length emphasis</span>
                </div>
                <div class="combo">
                  <span class="nko-text">ߞߎߎ</span>
                  <span class="explanation">ߞߎ + ߎ → Intensification</span>
                </div>
              </div>
              
              <h5>2. Different Vowel Sequences</h5>
              <div class="combination-examples">
                <div class="combo">
                  <span class="nko-text">ߞߊߍ</span>
                  <span class="explanation">[a] + [ɛ] → Smooth transition</span>
                </div>
                <div class="combo">
                  <span class="nko-text">ߞߎߏ</span>
                  <span class="explanation">[u] + [ɔ] → Rounded sequence</span>
                </div>
              </div>
              
              <h5>3. Oral-Nasal Combinations</h5>
              <div class="combination-examples">
                <div class="combo">
                  <span class="nko-text">ߞߊߐ</span>
                  <span class="explanation">[a] + [ɛ̃] → Nasalization spread</span>
                </div>
                <div class="combo">
                  <span class="nko-text">ߞߐߊ</span>
                  <span class="explanation">[ɛ̃] + [a] → Denasalization</span>
                </div>
              </div>
            </div>
            
            <h4>Pronunciation Rules for Vowel Sequences</h4>
            <ol>
              <li><strong>Maintain Clarity:</strong> Each vowel should be distinguishable</li>
              <li><strong>Smooth Transitions:</strong> No harsh breaks between vowels</li>
              <li><strong>Tone Preservation:</strong> Each vowel maintains its tonal assignment</li>
              <li><strong>Nasal Consistency:</strong> Nasalization doesn't spread unless grammatically motivated</li>
            </ol>
            
            <h4>Connected Speech Phenomena</h4>
            
            <h5>1. Vowel Elision</h5>
            <p>In rapid speech, some vowels may be shortened or dropped:</p>
            <div class="speech-examples">
              <div class="formal-casual">
                <span class="formal">ߞߊ ߊ߫ ߞߍ</span>
                <span class="arrow">→</span>
                <span class="casual">ߞߊߊ߫ ߞߍ</span>
                <span class="explanation">(ka a kɛ → kaa kɛ)</span>
              </div>
            </div>
            
            <h5>2. Vowel Harmony</h5>
            <p>Some grammatical contexts show vowel harmony patterns:</p>
            <div class="harmony-examples">
              <div class="harmony-rule">
                <span class="pattern">High vowels with high vowels</span>
                <span class="example">ߞߎ + ߎ → ߞߎߎ</span>
              </div>
              <div class="harmony-rule">
                <span class="pattern">Open vowels with open vowels</span>
                <span class="example">ߞߊ + ߊ → ߞߊߊ</span>
              </div>
            </div>
            
            <h4>Practice Strategies</h4>
            <div class="practice-methods">
              <h5>1. Slow Motion Practice</h5>
              <p>Practice vowel sequences extremely slowly, focusing on clear articulation of each vowel.</p>
              
              <h5>2. Minimal Pair Drilling</h5>
              <p>Practice distinguishing between similar vowel combinations:</p>
              <ul>
                <li>ߞߊߍ vs. ߞߊߐ (oral vs. nasal second vowel)</li>
                <li>ߞߎߏ vs. ߞߎߊ (back vs. front second vowel)</li>
              </ul>
              
              <h5>3. Connected Text Reading</h5>
              <p>Read simple N'Ko texts aloud, paying attention to vowel sequences in context.</p>
            </div>
          `,
          nkoText: "ߞߐߣߌ߲ߓߊ ߟߊߓߊ߲ ߦߋ߫ ߣߌߣߌ ߣߌ߫ ߘߋ߬ߣߍ߲ ߠߋ߬ ߘߌ߫",
          latinTransliteration: "Kɔnɔnba laban ye nini ni derɛn le di",
          englishTranslation: "Vowel combination is both sweet and beautiful",
          pronunciation: "[kɔ̀nɔ̀nbà làbàn jé nìnì nì dèrɛ̀n lé dì]",
          audioPrompt: "Flowing, musical demonstration of vowel combinations in connected speech",
          exercises: [
            {
              type: "sequence-practice", 
              question: "Practice these vowel combinations slowly:",
              items: ["ߞߊߍ", "ߞߎߏ", "ߞߊߐ", "ߞߐߊ"],
              audioPrompt: "Slow, clear pronunciation of each combination",
              difficulty: "medium"
            },
            {
              type: "connected-speech",
              question: "Read this phrase with smooth vowel transitions:",
              text: "ߞߊ ߊ߫ ߞߍ ߞߊ߬ߙߊ߲",
              audioPrompt: "Natural connected speech demonstration",
              difficulty: "hard"
            }
          ]
        }
      ],
      
      quiz: {
        title: "Comprehensive N'Ko Vowels Assessment",
        description: "Test your mastery of all seven N'Ko vowels and their applications",
        questions: [
          {
            question: "How many oral vowels does N'Ko have?",
            options: ["3", "4", "5", "7"],
            correctAnswer: 1,
            explanation: "N'Ko has four oral vowels: ߊ [a], ߍ [ɛ], ߎ [u], and ߏ [ɔ].",
            difficulty: "easy",
            points: 1
          },
          {
            question: "Which vowel appears in the word ߒߞߏ (N'ko)?",
            options: ["ߊ [a]", "ߍ [ɛ]", "ߏ [ɔ]", "ߎ [u]"],
            correctAnswer: 2,
            explanation: "The word ߒߞߏ (N'ko) contains ߏ [ɔ] as its vowel component.",
            difficulty: "easy",
            points: 1
          },
          {
            question: "What is the key difference between ߊ and ߑ?",
            options: [
              "Tongue position",
              "Lip rounding", 
              "Nasalization",
              "Vowel length"
            ],
            correctAnswer: 2,
            explanation: "ߑ [ã] is the nasal version of ߊ [a] - the difference is nasalization (air flowing through nose).",
            difficulty: "medium",
            points: 2
          },
          {
            question: "In traditional Mande culture, precise vowel pronunciation is important for:",
            options: [
              "Writing speed",
              "Maintaining rhythmic patterns in oral traditions",
              "Saving paper",
              "Easier spelling"
            ],
            correctAnswer: 1,
            explanation: "Griots and traditional storytellers rely on precise vowel pronunciation to maintain rhythmic patterns and convey emotional nuances.",
            difficulty: "medium",
            points: 2
          },
          {
            question: "The character ߒ represents which sound?",
            options: ["[n]", "[ɲ]", "[m]", "[ŋ]"],
            correctAnswer: 1,
            explanation: "ߒ represents [ɲ], the palatal nasal sound like 'ny' in 'canyon'.",
            difficulty: "medium",
            points: 2
          },
          {
            question: "Which pair represents a minimal pair (words differing only in oral vs nasal vowel)?",
            options: [
              "ߞߊ (ka) - ߞߑ (kã)",
              "ߞߊ (ka) - ߞߍ (kɛ)",
              "ߞߎ (ku) - ߞߏ (kɔ)",
              "ߞߊ (ka) - ߞߊߊ (kaa)"
            ],
            correctAnswer: 0,
            explanation: "ߞߊ (ka - to do) and ߞߑ (kã - neck) differ only in nasalization, making them a minimal pair.",
            difficulty: "hard",
            points: 3
          },
          {
            question: "Why is the ߒ [ɲ] sound taught with vowels in N'Ko pedagogy?",
            options: [
              "It's easier to remember",
              "It often functions as a syllable nucleus",
              "It's not really a consonant",
              "It was a mistake in classification"
            ],
            correctAnswer: 1,
            explanation: "ߒ [ɲ] often functions as a syllable nucleus and has vowel-like properties in some contexts.",
            difficulty: "hard",
            points: 3
          },
          {
            question: "In vowel sequences like ߞߊߐ, what happens to pronunciation?",
            options: [
              "The vowels merge into one",
              "Each vowel maintains its distinct quality",
              "Only the first vowel is pronounced", 
              "The sequence becomes a diphthong"
            ],
            correctAnswer: 1,
            explanation: "In N'Ko vowel sequences, each vowel maintains its distinct quality with smooth transitions between them.",
            difficulty: "hard",
            points: 3
          }
        ],
        passingScore: 12,
        totalPoints: 17
      },
      
      summary: `
        Congratulations! You have mastered the foundation of N'Ko pronunciation by learning all seven vowels. You now understand:
        
        • The four oral vowels (ߊ, ߍ, ߎ, ߏ) and their precise pronunciation
        • The two nasal vowels (ߐ, ߑ) and the crucial oral-nasal distinction
        • The special character ߒ [ɲ] and its cultural importance in N'Ko identity
        • How vowels combine in connected speech and real-world usage
        • The cultural significance of precise pronunciation in Mande oral traditions
        
        These vowels are the musical foundation of N'Ko. With this knowledge, you're ready to explore consonants and begin forming complete words and sentences.
      `,
      
      nextSteps: [
        "Learn N'Ko consonants and practice consonant-vowel combinations",
        "Begin reading simple N'Ko words using vowel knowledge",
        "Practice vowel pronunciation with native speaker audio",
        "Explore the cultural contexts where each vowel appears frequently"
      ],
      
      culturalConnections: [
        "Listen to traditional Mande music to hear vowel patterns in singing",
        "Explore griot storytelling techniques that emphasize vowel clarity",
        "Learn about regional pronunciation variations across Mande territories",
        "Discover how vowel sounds connect to tonal patterns in speech"
      ]
    }
  }
];

async function seedComprehensiveLessons() {
  try {
    console.log('🌱 Starting comprehensive N\'Ko lesson seeding...');
    
    for (const lesson of comprehensiveLessons) {
      console.log(`📖 Creating lesson: ${lesson.title}`);
      
      const createdLesson = await prisma.nkoLesson.create({
        data: lesson
      });
      
      console.log(`✅ Created lesson: ${createdLesson.slug}`);
    }
    
    console.log('🎉 Comprehensive lesson seeding completed successfully!');
    console.log(`📚 Total lessons created: ${comprehensiveLessons.length}`);
    
  } catch (error) {
    console.error('❌ Error seeding comprehensive lessons:', error);
    throw error;
  }
}

// Run the seeding
async function main() {
  try {
    await seedComprehensiveLessons();
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

module.exports = { seedComprehensiveLessons, comprehensiveLessons }; 