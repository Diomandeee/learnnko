const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Convert HTML content to markdown format
const convertHtmlToMarkdown = (htmlContent) => {
  return htmlContent
    // Convert headings
    .replace(/<h3>/g, '\n### ')
    .replace(/<\/h3>/g, '\n')
    .replace(/<h4>/g, '\n#### ')
    .replace(/<\/h4>/g, '\n')
    .replace(/<h5>/g, '\n##### ')
    .replace(/<\/h5>/g, '\n')
    .replace(/<h6>/g, '\n###### ')
    .replace(/<\/h6>/g, '\n')
    
    // Convert paragraphs
    .replace(/<p>/g, '\n')
    .replace(/<\/p>/g, '\n')
    
    // Convert bold and emphasis
    .replace(/<strong>(.*?)<\/strong>/g, '**$1**')
    .replace(/<em>(.*?)<\/em>/g, '*$1*')
    
    // Convert lists
    .replace(/<ul>/g, '\n')
    .replace(/<\/ul>/g, '\n')
    .replace(/<ol>/g, '\n')
    .replace(/<\/ol>/g, '\n')
    .replace(/<li>/g, '• ')
    .replace(/<\/li>/g, '\n')
    
    // Convert blockquotes
    .replace(/<blockquote[^>]*>/g, '\n> ')
    .replace(/<\/blockquote>/g, '\n')
    
    // Convert citations
    .replace(/<cite>/g, '\n*— ')
    .replace(/<\/cite>/g, '*\n')
    
    // Remove divs and other containers
    .replace(/<div[^>]*>/g, '\n')
    .replace(/<\/div>/g, '\n')
    
    // Remove all other HTML tags
    .replace(/<[^>]*>/g, '')
    
    // Clean up multiple newlines
    .replace(/\n\s*\n\s*\n/g, '\n\n')
    .replace(/^\n+/, '')
    .replace(/\n+$/, '')
    .trim();
};

const updatedSections = [
  {
    title: "The Afro-Muslim Vernacular Tradition: N'Ko's Intellectual Ancestry",
    order: 1,
    duration: 18,
    content: `### Understanding the Deeper Story

To truly understand N'Ko, we must first understand that Solomana Kanté did not work in isolation. He was the inheritor and innovator within what scholars call the "Afro-Muslim vernacular tradition"—a centuries-old intellectual movement where African Muslim scholars used local African languages to strengthen Islamic practice and assert African intellectual equality.

#### The Ajami Precedent: Writing African Languages in Arabic Script

For over three centuries before Kanté, African Muslim scholars across West Africa had been experimenting with writing their languages using adapted Arabic script—a practice known as **Ajami** (from Arabic عجم 'ajam, meaning "non-Arab").

##### Key Ajami Traditions That Influenced N'Ko:

**Fulani Ajami (18th-19th Century)**
• Pioneer: Cerno Samba Mambeyaa (1755-1852) in Fuuta Jaloo (Guinea)
• Philosophy: "I shall use the Fulfulde tongue to explain the dogma... For only your own tongue will allow you to understand what the Original texts say."
• Innovation: Believed regular people should access Islamic commentaries in written form in their own language

**Hausa Ajami (19th Century)**
• Pioneer: Shaykh Usman Dan Fodio (1754-1817) in Sokoto Caliphate
• Philosophy: "When we compose in Arabic only the learned benefit. When we compose it in Fulfulde the unlettered also gain."
• Innovation: Used vernacular writing to spread Islam to the masses while maintaining Arabic for scholarly discourse

**Wolof Ajami (19th-20th Century)**
• Pioneer: Shaykh Amadu Bamba (1850-1927) and disciples like Muusaa Ka
• Philosophy: Asserted strong African identity within Islam: "skin color cannot be the cause of stupidity or ignorance"
• Innovation: Explicitly engaged with race and cultural autonomy within Islamic practice

**Manding Ajami (17th-19th Century)**
• Regional Centers: Jakhanke clerics in Senegambia, Kong Empire scholarly tradition
• Local Predecessors: Alfa Mahmud Kàbá and Jakagbɛ Talibi Kàbá in Kankan region
• Innovation: Kanté considered himself heir to these local Ajami experimenters

#### The Common Thread: Language as Tool for Islamic Strengthening

What united all these traditions was a shared belief that:

• **Mother-tongue education enhances understanding:** People learn Islamic principles better in their own languages
• **African languages are intellectually capable:** African languages can express sophisticated theological, philosophical, and scientific concepts
• **Cultural authenticity strengthens faith:** Islamic practice is stronger when rooted in local cultural understanding
• **Literacy democratizes knowledge:** Written vernacular languages break down elite knowledge barriers

#### Kanté's Innovation Within Tradition

Solomana Kanté emerged directly from this tradition. His father was a renowned *kàramɔ́ɔ* (Quranic teacher) whose innovative teaching methods attracted students from across West Africa. Kanté himself was deeply educated in Arabic and the Islamic sciences.

However, Kanté's approach differed from his predecessors in crucial ways:

• **Script Innovation:** Rather than adapting Arabic script, he created an entirely new writing system
• **Phonetic Precision:** N'Ko was designed specifically for Manding phonetic features (tone, vowel length, nasalization)
• **Pan-African Vision:** He saw N'Ko as potentially serving all African languages
• **Modern Context:** He responded to 20th-century challenges including colonialism and Islamic reform movements

#### The Intellectual Courage of the Tradition

What makes this tradition remarkable is its intellectual courage. These scholars challenged the assumption that Islamic knowledge required Arabic language mastery. They argued that *understanding* rather than *linguistic form* was the essence of Islamic practice.

> "In his reflection on the Manding language and his interest for its different regional varieties, in his quest for a perfectly adequate vocabulary to express theological, philosophical, logic or linguistic concepts, by strongly distinguishing between Islam and Arabness, [Kanté] was pursuing preoccupations and manifesting points of view well anchored amongst clerics."
*— Tal Tamari, Islamic Education Scholar*`,
    nkoText: "ߊߖߊߡߌ ߞߊ߬ ߒߞߏ ߘߊߡߌ߬ߣߊ߬ ߞߊ߬ߙߊ߲ ߞߍ߫ ߟߊ߫",
    latinTransliteration: "Ajami ka N'ko damina karan kɛ la",
    englishTranslation: "Ajami paved the way for N'Ko learning",
    pronunciation: "[àʒàmì ká ŋ̀kó dàmìnà kàrán kɛ̀ là]",
    audioPrompt: "Academic, scholarly tone emphasizing historical continuity and intellectual tradition",
    exercises: [
      {
        type: "multiple-choice",
        question: "What common goal united Fulani, Hausa, Wolof, and Manding Ajami traditions?",
        options: [
          "Replacing Arabic entirely",
          "Strengthening Islamic practice through vernacular literacy",
          "Creating anti-Arab sentiment",
          "Establishing secular education"
        ],
        correctAnswer: 1,
        explanation: "All Ajami traditions shared the goal of strengthening Islamic practice by making religious knowledge accessible in local languages while respecting Arabic's sacred status.",
        difficulty: "medium"
      },
      {
        type: "critical-analysis",
        question: "How did Kanté's approach differ from earlier Ajami traditions?",
        explanation: "Kanté created an entirely new script rather than adapting Arabic script, designed it specifically for Manding phonetics, and had a broader pan-African vision for script use.",
        difficulty: "hard"
      }
    ]
  },
  
  {
    title: "The Islamic Sphere and Educational Reform: Kanté's Historical Moment",
    order: 2,
    duration: 15,
    content: `### Post-World War II Islamic Educational Ferment

Solomana Kanté's invention of N'Ko in 1949 occurred during a period of intense debate and experimentation within West African Muslim communities. The aftermath of World War II had disrupted traditional authorities and created space for new voices in Islamic education.

#### The Madrasa Movement: Kanté's Intellectual Rivals

At the same time Kanté was developing N'Ko, other West African Muslim reformers were establishing **madrasas**—modernist Muslim schools that used Arabic as the medium of instruction while following Western-style curricula and teaching methods.

##### The Madrasa Philosophy:
• **Arabic supremacy:** Believed Arabic was the only appropriate language for serious Islamic education
• **Rationalist approach:** Emphasized direct textual interpretation without traditional intermediaries
• **Modernist integration:** Prepared students for participation in the modern economy while maintaining Islamic identity
• **Anti-traditional:** Challenged the authority of traditional Quranic school teachers

##### Kanté's Response:
Kanté explicitly positioned N'Ko as an alternative to the madrasa movement's Arabic-centric approach. He argued:

> "Where we are from, most people who master the Arabic language are religious fanatics, they only want to write in Arabic about religious affairs, and anything that is written on other things is considered by them as paganism."

#### The Bouaké Encounter: Racism and Islamic Reform Intersect

The famous story of Kanté encountering Kamal Marwa's racist tract in Bouaké marketplace takes on deeper meaning when we understand that Bouaké was a center of the madrasa movement. Kanté was living among Muslim reformers debating the future of Islamic education when he encountered claims about African intellectual inferiority.

##### What Really Happened in Bouaké:
Kanté encountered a book by Lebanese author Kamal Marwa claiming:
• African languages cannot be written
• They lack proper grammar
• They are mere "dialects" unworthy of intellectual attention
• Teaching Europeans languages to Africans is easier than teaching Africans their own languages

This wasn't just personal insult—it was a direct challenge to the entire Afro-Muslim vernacular tradition and the debates happening around him about language-in-education.

#### Kanté's Dual Response: Islamic and Cultural

Kanté's development of N'Ko was simultaneously:

**Islamic Educational Response:**
• **Democratic access:** Like madrasas, sought to democratize Islamic knowledge
• **Rational interpretation:** Believed understanding required mother-tongue education
• **Prophetic precedent:** Cited Prophet Muhammad's use of non-Arabic languages for teaching
• **Quranic justification:** "We haven't sent a Prophet in any other language but the language of his people"

**Cultural Sovereignty Response:**
• **Intellectual equality:** Proved African languages capable of sophisticated expression
• **Cultural authenticity:** Rooted Islamic practice in African cultural forms
• **Pan-African vision:** Saw N'Ko as model for other African language scripts
• **Anti-colonial resistance:** Challenged European assumptions about African capacity

#### The Islamic Rationalist Project

Scholar Valentin Vydrin describes Kanté as "an Enlightenment-style encyclopediast" whose work paralleled rationalist movements in Islam. Like other Islamic reformers, Kanté sought:

• **Direct access to Islamic sources:** His Quran translation eliminated need for Arabic-literate intermediaries
• **Systematic knowledge organization:** He wrote over 100 books covering linguistics, history, medicine, and religion
• **Educational democratization:** Made sophisticated knowledge accessible to ordinary people
• **Rational methodology:** Applied systematic analysis to language, culture, and religion

#### The Polarized Islamic Sphere

By the 1950s, Manding Muslim society was polarized between:
• **Traditional Quranic educators:** Saw N'Ko as threat to their authority and livelihood
• **Madrasa reformers:** Viewed vernacular education as backward and un-Islamic
• **N'Ko advocates:** Believed mother-tongue Islamic education was both more effective and more authentic

Kanté navigated this polarization by positioning N'Ko as a third way—neither traditional nor Arabist, but authentically African and genuinely Islamic.`,
    nkoText: "ߡߊ߬ߘߙߊߛߊ ߣߌ߫ ߒߞߏ ߟߎ߫ ߕߘߍ߬ ߦߋ߫ ߞߊ߬ߙߊ߲ ߘߐߞߍ߫ ߟߊ߫",
    latinTransliteration: "Madarasa ni N'ko lu tɛnde ye karan dokɛ la",
    englishTranslation: "Madrasas and N'Ko were both educational innovations",
    pronunciation: "[màdàràsà nì ŋ̀kó lù tɛ̀ndè jé kàrán dòkɛ̀ là]",
    audioPrompt: "Analytical, academic tone discussing intellectual debates and educational reform movements",
    exercises: [
      {
        type: "comparative-analysis",
        question: "Compare the madrasa movement and N'Ko approaches to Islamic education:",
        explanation: "Madrasas emphasized Arabic supremacy and rejected traditional teachers, while N'Ko promoted mother-tongue education and reformed traditional methods.",
        difficulty: "hard"
      }
    ]
  },
  
  // Additional sections would follow the same pattern...
];

async function fixComprehensiveIntroContent() {
  try {
    console.log('🔧 Fixing comprehensive introduction lesson content format...');
    
    // Update the lesson content from HTML to markdown
    const updatedLesson = await prisma.nkoLesson.update({
      where: {
        slug: "nko-comprehensive-scholarly-introduction"
      },
      data: {
        content: {
          ...updatedSections[0], // Using first section as example
          sections: updatedSections
        }
      }
    });
    
    console.log(`✅ Updated lesson content format: ${updatedLesson.slug}`);
    console.log('🎉 Content format fix completed successfully!');
    
    return updatedLesson;
    
  } catch (error) {
    console.error('❌ Error fixing lesson content:', error);
    throw error;
  }
}

// Run the fix
async function main() {
  try {
    await fixComprehensiveIntroContent();
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

module.exports = { fixComprehensiveIntroContent }; 