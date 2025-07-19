export const nkoHistoryLesson = {
  id: "nko-history",
  title: "History of N'Ko",
  description: "Learn about the creation and history of the N'Ko writing system",
  level: "beginner",
  module: "intro-to-nko",
  moduleOrder: 1,
  order: 1,
  duration: 15,
  prerequisites: [],
  topics: ["history", "writing system", "cultural context"],
  content: {
    objectives: [
      "Understand who created the N'Ko alphabet and why",
      "Learn about the cultural significance of N'Ko",
      "Recognize the historical context of N'Ko's development",
      "Appreciate the purpose and goals of the N'Ko writing system"
    ],
    sections: [
      {
        title: "The Creator of N'Ko",
        content: `
          The N'Ko alphabet was created by Solomana Kanté, a Guinean writer and educator, in 1949.
          
          Kanté was concerned about the declining literacy rates in West Africa and believed that teaching people to read and write in their native Manding languages would be more effective than using foreign scripts or languages.
          
          After years of research and development, he unveiled the N'Ko script, designed specifically for Manding languages.
        `,
        audioPrompt: "creator-nko"
      },
      {
        title: "The Meaning of N'Ko",
        content: `
          The name "N'Ko" means "I say" in all Manding languages.
          
          This name was chosen to emphasize the importance of self-expression and communication in one's native language.
          
          The script was designed to be a unifying writing system for speakers of Manding languages across West Africa, including Bambara, Dyula, Malinké, and Mandinka.
        `,
        audioPrompt: "meaning-nko",
        exercises: [
          {
            type: "multiple-choice",
            question: "What does the name 'N'Ko' mean?",
            options: ["I write", "I say", "Our language", "My people"],
            correctAnswer: 1,
            explanation: "The name 'N'Ko' means 'I say' in all Manding languages, emphasizing self-expression in one's native tongue."
          }
        ]
      },
      {
        title: "Purpose and Design",
        content: `
          Kanté designed N'Ko with several goals in mind:
          
          - To create a script that could accurately represent all the sounds in Manding languages
          - To develop a tool for preserving traditional knowledge and literature
          - To increase literacy rates by making reading and writing more accessible
          - To empower speakers of Manding languages to document their own history and culture
          
          The N'Ko script is written from right to left, contains 27 letters (including 7 vowels and 20 consonants), and includes various punctuation marks and numerals.
        `,
        audioPrompt: "purpose-design",
        exercises: [
          {
            type: "multiple-choice",
            question: "In which direction is N'Ko written?",
            options: ["Left to right", "Right to left", "Top to bottom", "Bottom to top"],
            correctAnswer: 1,
            explanation: "N'Ko is written from right to left, unlike Latin-based writing systems."
          }
        ]
      },
      {
        title: "The Spread of N'Ko",
        content: `
          After its creation, N'Ko gradually spread across West Africa, particularly in Guinea, Mali, Côte d'Ivoire, and neighboring countries.
          
          N'Ko literacy centers were established to teach the script, and a growing body of literature, newspapers, and educational materials were produced in N'Ko.
          
          The spread of N'Ko was largely a grassroots movement, driven by the dedication of teachers and scholars committed to promoting literacy in Manding languages.
          
          Today, N'Ko continues to be taught and used, with growing interest and support from governments, educational institutions, and international organizations.
        `,
        audioPrompt: "spread-nko",
        exercises: [
          {
            type: "multiple-choice",
            question: "How did N'Ko primarily spread throughout West Africa?",
            options: [
              "Through government mandates", 
              "Via colonial education systems", 
              "Through grassroots movements and literacy centers", 
              "By commercial publishers"
            ],
            correctAnswer: 2,
            explanation: "N'Ko spread primarily through grassroots movements and dedicated literacy centers established by teachers and scholars."
          }
        ]
      },
      {
        title: "Cultural Significance",
        content: `
          The N'Ko script is more than just a writing system; it represents cultural pride, identity, and intellectual independence for many Manding speakers.
          
          By allowing people to read and write in their native language, N'Ko has played a role in preserving oral traditions, historical knowledge, and cultural practices.
          
          N'Ko has also facilitated the documentation of traditional medicine, agriculture, philosophy, and other knowledge systems that might otherwise be lost.
          
          The creation and use of N'Ko is seen as an act of cultural reclamation and empowerment in the post-colonial context of West Africa.
        `,
        audioPrompt: "cultural-significance",
        exercises: [
          {
            type: "multiple-choice",
            question: "What broader cultural significance does N'Ko have beyond being a writing system?",
            options: [
              "It's mainly a decorative script for art", 
              "It represents cultural pride and intellectual independence", 
              "It's primarily used for religious texts", 
              "It's mainly used for government documents"
            ],
            correctAnswer: 1,
            explanation: "N'Ko represents cultural pride, identity, and intellectual independence for many Manding speakers, serving as a tool for cultural reclamation and empowerment."
          }
        ]
      },
      {
        title: "N'Ko in the Digital Age",
        content: `
          In recent decades, N'Ko has made the transition to digital platforms, with the development of N'Ko fonts, keyboards, and software.
          
          N'Ko was added to the Unicode Standard in 2006, making it possible to use the script in websites, applications, and digital documents.
          
          Online communities, social media groups, and digital resources have emerged to support N'Ko learning and usage.
          
          These technological developments have helped to expand the reach and accessibility of N'Ko, connecting new generations with this important cultural heritage.
        `,
        audioPrompt: "digital-nko",
        exercises: [
          {
            type: "multiple-choice",
            question: "When was N'Ko added to the Unicode Standard?",
            options: ["1996", "2000", "2006", "2012"],
            correctAnswer: 2,
            explanation: "N'Ko was added to the Unicode Standard in 2006, enabling its use in digital platforms and technologies."
          }
        ]
      }
    ],
    quizQuestions: [
      {
        question: "Who created the N'Ko alphabet?",
        options: ["Kwame Nkrumah", "Solomana Kanté", "Léopold Sédar Senghor", "Cheikh Anta Diop"],
        correctAnswer: 1,
        explanation: "Solomana Kanté, a Guinean writer and educator, created the N'Ko alphabet in 1949."
      },
      {
        question: "In what year was the N'Ko alphabet created?",
        options: ["1929", "1949", "1969", "1989"],
        correctAnswer: 1,
        explanation: "The N'Ko alphabet was created in 1949 by Solomana Kanté."
      },
      {
        question: "How many letters are in the N'Ko alphabet?",
        options: ["21", "24", "27", "30"],
        correctAnswer: 2,
        explanation: "The N'Ko alphabet contains 27 letters, including 7 vowels and 20 consonants."
      },
      {
        question: "What was one of the primary purposes for creating N'Ko?",
        options: [
          "To replace French as the official language", 
          "To increase literacy by teaching in native languages", 
          "To create a secret writing system", 
          "To simplify the existing writing systems"
        ],
        correctAnswer: 1,
        explanation: "A primary purpose of N'Ko was to increase literacy rates by allowing people to learn reading and writing in their native Manding languages."
      },
      {
        question: "Which of these countries is NOT mentioned as a place where N'Ko spread?",
        options: ["Guinea", "Mali", "Senegal", "Côte d'Ivoire"],
        correctAnswer: 2,
        explanation: "The text mentions that N'Ko spread in Guinea, Mali, Côte d'Ivoire, and neighboring countries, but Senegal is not specifically mentioned."
      }
    ],
    summary: `
      In this lesson, you've learned about the history and significance of the N'Ko writing system:
      
      - N'Ko was created in 1949 by Solomana Kanté, a Guinean educator
      - The name "N'Ko" means "I say" in Manding languages
      - N'Ko was designed to accurately represent Manding languages and increase literacy
      - The script is written from right to left and contains 27 letters
      - N'Ko spread through grassroots movements across West Africa
      - The script has significant cultural importance for Manding speakers
      - N'Ko has successfully transitioned to the digital age
      
      Understanding the history and purpose of N'Ko provides important context for learning the script. In the next lessons, you'll begin to learn the alphabet itself, starting with the basics of the writing system.
    `,
    vocabulary: [
      {
        nko: "ߒߞߏ",
        latin: "N'ko",
        english: "I say",
        french: "Je dis"
      },
      {
        nko: "ߛߟߏߡߊߣߊ ߞߊ߲ߕߍ",
        latin: "Solomana Kanté",
        english: "Creator of N'Ko",
        french: "Créateur de N'Ko"
      },
      {
        nko: "ߞߊ߬ߙߊ߲",
        latin: "karan",
        english: "to read/study",
        french: "lire/étudier"
      },
      {
        nko: "ߛߓߍ",
        latin: "sɛbɛ",
        english: "writing/to write",
        french: "écriture/écrire"
      },
      {
        nko: "ߡߊ߲ߘߋ߲",
        latin: "Manden",
        english: "Manding",
        french: "Mandingue"
      },
      {
        nko: "ߞߊ߲",
        latin: "kan",
        english: "language",
        french: "langue"
      },
      {
        nko: "ߓߊߓߊ",
        latin: "baba",
        english: "alphabet",
        french: "alphabet"
      }
    ]
  }
};
