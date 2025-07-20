const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Ultra-Comprehensive N'Ko Introduction Lesson with Markdown Content
const markdownIntroLesson = {
  slug: "nko-comprehensive-scholarly-introduction",
  title: "N'Ko: African Intellectual Revolution and the Afro-Muslim Vernacular Tradition",
  description: "A scholarly exploration of N'Ko as a revolutionary African script within the broader context of Islamic education, vernacular literacy traditions, and post-colonial intellectual movements in West Africa",
  level: "beginner",
  module: "foundations", 
  moduleOrder: 1,
  track: "foundations",
  order: 1,
  prerequisites: [],
  topics: ["intellectual-history", "islamic-education", "vernacular-literacy", "afro-muslim-tradition", "post-colonial-thought", "script-creation"],
  estimatedTime: 75,
  duration: "75 minutes",
  tags: ["academic", "scholarly", "comprehensive", "cultural-analysis", "intellectual-history"],
  objectives: [
    "Understand N'Ko within the broader Afro-Muslim vernacular literacy tradition spanning centuries",
    "Analyze Solomana Kanté's work as both Islamic educational reform and anti-colonial resistance",
    "Explore the intellectual and cultural context of post-WWII West African Islamic sphere",
    "Examine N'Ko as a 'social orthography of identity' for Mande communities",
    "Connect N'Ko to earlier Ajami traditions and Islamic pedagogical innovations",
    "Understand the script's role in re-inventing oral tradition for the modern era"
  ],
  vocabulary: [
    "ߒߞߏ", "ߞߊ߬ߙߊ߲߬ߡߐ߮", "ߊߖߊߡߌ", "ߡߊ߬ߘߙߊߛߊ", "ߝߎߞߊ߸ ߖߊߟߏ߸ ߛߏߞߏߕߏ",
    "ߝߘߏ߬ߓߊ߬ ߞߊ߲", "ߖߎ߬ߟߊ", "ߞߊ߬ߙߊ߲", "ߞߎ߬ߙߣߊ߬ ߞߊߟߊߒߞߋ"
  ],
  grammarPoints: [
    "Arabic script adaptations for African languages (Ajami tradition)",
    "Right-to-left writing systems and directionality", 
    "Vernacular literacy in Islamic contexts"
  ],
  culturalNotes: [
    "N'Ko as continuation of centuries-old Afro-Muslim intellectual tradition",
    "The role of Quranic education in West African intellectual development",
    "Islamic reform movements and language-in-education debates"
  ],
  isActive: true,
  difficulty: 2,
  content: {
    introduction: `This lesson presents N'Ko not as an isolated invention, but as a culminating achievement within a centuries-old tradition of African Islamic intellectual innovation. Drawing on recent scholarly research by Coleman Donaldson, Christopher Wyrod, and Dianne White Oyler, we explore how Solomana Kanté's creation represents both a continuation of and revolution within the Afro-Muslim vernacular tradition.`,
    
    sections: [
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

#### The Polarized Islamic Sphere

By the 1950s, Manding Muslim society was polarized between:
• **Traditional Quranic educators:** Saw N'Ko as threat to their authority and livelihood
• **Madrasa reformers:** Viewed vernacular education as backward and un-Islamic
• **N'Ko advocates:** Believed mother-tongue Islamic education was both more effective and more authentic

Kanté navigated this polarization by positioning N'Ko as a third way—neither traditional nor Arabist, but authentically African and genuinely Islamic.`,
        nkoText: "ߡߊ߬ߘߙߊߛߊ ߣߌ߫ ߒߞߏ ߟߎ߫ ߕߘߍ߬ ߦߋ߫ ߞߊ߬ߙߊ߲ ߘߐߞߍ߫ ߟߊ߫",
        latinTransliteration: "Madarasa ni N'ko lu tɛnde ye karan dokɛ la",
        englishTransliteration: "Madrasas and N'Ko were both educational innovations",
        pronunciation: "[màdàràsà nì ŋ̀kó lù tɛ̀ndè jé kàrán dòkɛ̀ là]",
        audioPrompt: "Analytical, academic tone discussing intellectual debates and educational reform movements",
        exercises: [
          {
            type: "comparative-analysis",
            question: "How did the madrasa movement influence Kanté's development of N'Ko?",
            options: [
              "It directly supported his work",
              "It provided the model he followed exactly",
              "It represented the Arabic-centric approach he opposed",
              "It had no influence on his thinking"
            ],
            correctAnswer: 2,
            explanation: "The madrasa movement's emphasis on Arabic-only Islamic education represented the approach Kanté opposed with his mother-tongue education philosophy.",
            difficulty: "hard"
          }
        ]
      },
      
      {
        title: "N'Ko as 'Social Orthography of Identity': Cultural and Political Dimensions",
        order: 3,
        duration: 12,
        content: `### Beyond Script: N'Ko as Symbol and Movement

Scholar Christopher Wyrod coined the term "social orthography of identity" to describe how N'Ko functions far beyond its technical role as a writing system. N'Ko has become a powerful symbol of Mande cultural identity, intellectual capability, and cultural sovereignty.

#### The Competitive Success Story

N'Ko presents a rare case of an indigenous script successfully competing against older, better-financed, and institutionally supported writing systems. Consider the odds N'Ko faced:

**Established Competitors:**
• **Arabic script:** 1300+ years in West Africa, religiously sanctioned, traditional scholarly prestige
• **Latin script:** Colonial government support, modern educational systems, international commerce
• **French language:** Official status, economic advancement opportunities, administrative power

**N'Ko's Advantages:**
• **Linguistic precision:** Designed specifically for Manding phonetic features
• **Cultural resonance:** Symbolizes African intellectual independence
• **Educational effectiveness:** Dramatically higher literacy success rates
• **Community ownership:** Grassroots movement with deep local support

#### The Identity Formation Process

N'Ko's role in Mande identity formation operates on multiple levels:

**1. Individual Level: Personal Empowerment**
• Adults who struggled with Arabic or French find N'Ko remarkably easy to learn
• Literacy in one's mother tongue provides psychological validation
• Writing in N'Ko connects individuals to cultural heritage
• N'Ko literacy becomes marker of cultural authenticity

**2. Community Level: Cultural Preservation**
• N'Ko enables recording of oral histories and traditions
• Traditional knowledge (medicine, agriculture, crafts) is documented
• Religious practices are explained in culturally relevant terms
• Community narratives are preserved for future generations

**3. Ethnic Level: Mande Unity and Pride**
• N'Ko transcends national borders, uniting Mande speakers across countries
• Shared script creates sense of pan-Mande identity
• N'Ko literature celebrates Mande historical achievements
• Script becomes symbol of Mande intellectual sophistication

**4. Continental Level: African Renaissance**
• N'Ko serves as proof of African intellectual capability
• Inspires other African language script development projects
• Challenges assumptions about African "oral" vs "literate" cultures
• Contributes to broader African cultural renaissance movements

#### The Literary Explosion

One of N'Ko's most remarkable achievements is the literary tradition it has generated. Scholars note that N'Ko practitioners today produce more printed text annually than all official state-backed Latin orthographies for Manding languages combined.

**N'Ko Literary Production:**
• **Historical chronicles:** Mande empire histories, genealogies, cultural narratives
• **Religious texts:** Quran translations, Islamic commentaries, prayer books
• **Educational materials:** Textbooks, literacy primers, reference works
• **Creative literature:** Poetry, fiction, modern adaptations of traditional stories
• **Technical works:** Medical texts, agricultural manuals, linguistic studies
• **Contemporary media:** Newspapers, magazines, digital content

#### The Double-Edged Nature of Identity

While N'Ko's strong association with Mande identity provides strength, it also presents challenges:

**Strengths:**
• Deep community investment and ownership
• Strong motivation for learning and preservation
• Cultural authenticity and relevance
• Resistance to external pressures and assimilation

**Challenges:**
• May limit appeal to non-Mande speakers
• Could reinforce ethnic divisions in multi-ethnic societies
• Might face resistance from state authorities promoting national unity
• Risk of being seen as "tribal" rather than modern/universal`,
        nkoText: "ߒߞߏ ߦߋ߫ ߡߊ߲߬ߘߋ߲߫ ߖߊ߯ߓߊߟߌ ߟߋ߬ ߘߌ߫",
        latinTransliteration: "N'ko ye Mandɛn jawbali le di",
        englishTranslation: "N'Ko is Mande identity/answer",
        pronunciation: "[ŋ̀kó jé màndɛ̀n ʒàwbàlì lé dì]",
        audioPrompt: "Proud, confident tone emphasizing cultural identity and achievement",
        exercises: [
          {
            type: "analysis-synthesis",
            question: "Why is N'Ko's competitive success against Arabic and Latin scripts remarkable?",
            options: [
              "It had more government support",
              "It was easier to learn",
              "It succeeded despite facing established scripts with institutional backing",
              "It was promoted by foreign missionaries"
            ],
            correctAnswer: 2,
            explanation: "N'Ko succeeded as a grassroots movement against scripts with centuries of institutional support, proving the power of cultural authenticity and linguistic precision.",
            difficulty: "medium"
          }
        ]
      },
      
      {
        title: "Re-Inventing Oral Tradition: N'Ko and the Modern Epic",
        order: 4,
        duration: 12,
        content: `### From Spoken Word to Written Heritage

Scholar Dianne White Oyler's research reveals how N'Ko has enabled a remarkable transformation: the "re-invention of oral tradition" for the modern era. Traditional Mande oral narratives, genealogies, and historical accounts are being systematically recorded, preserved, and revitalized through N'Ko literacy.

#### The Oral-Literate Bridge

Mande societies have maintained sophisticated oral traditions for over a millennium, including:

**Traditional Oral Genres:**
• **Epic narratives:** Sundiata epic, other founding stories
• **Historical chronicles:** Dynasty lists, migration narratives, war accounts
• **Genealogical recitations:** Family lineages, clan relationships
• **Praise poetry:** Royal praise, professional accomplishments
• **Proverbial wisdom:** Moral teachings, practical knowledge
• **Technical knowledge:** Agricultural cycles, medical practices, craft techniques

**The Griot Tradition:**
Traditional knowledge preservation was the responsibility of *jalilu* (griots)—hereditary oral historians, musicians, and praise singers who:
• Memorized vast amounts of historical and genealogical information
• Performed these narratives in musical/poetic form
• Served as living libraries for their communities
• Transmitted knowledge through apprenticeship systems

#### The Crisis of Oral Transmission

By the 20th century, the traditional oral transmission system faced unprecedented challenges:

**Modern Pressures:**
• **Urbanization:** Young people migrating to cities, away from traditional teachers
• **Education systems:** Colonial schools devaluing traditional knowledge
• **Economic changes:** Traditional patronage systems breaking down
• **Cultural pressure:** Modern lifestyles leaving less time for traditional learning
• **Generational gaps:** Reduced interest among youth in traditional roles

#### N'Ko as Preservation Technology

N'Ko provided the technological and cultural bridge needed to preserve oral traditions while maintaining their authenticity:

**Technical Advantages:**
• **Phonetic accuracy:** N'Ko captures subtle linguistic features (tone, length, nasalization) crucial to oral performance
• **Cultural authenticity:** Uses indigenous script rather than colonial languages
• **Accessibility:** Community members can learn to read their own traditions
• **Portability:** Written texts can travel beyond original communities

**Cultural Advantages:**
• **Respect for tradition:** Preservation effort shows value for ancestral knowledge
• **Community ownership:** Local communities control the recording process
• **Intergenerational transmission:** Enables parents to teach children traditional knowledge
• **Cultural pride:** Seeing traditions in sophisticated written form enhances their prestige

#### The New Literary Tradition

N'Ko has enabled not just preservation but creative adaptation of oral traditions:

**Preservation Projects:**
• **Historical documentation:** Recording traditional versions of major historical events
• **Genealogical projects:** Writing down family and clan histories
• **Cultural encyclopedias:** Comprehensive recording of traditional practices
• **Language documentation:** Preserving regional dialects and specialized vocabularies

**Creative Adaptations:**
• **Modern epics:** New narrative works using traditional epic structures
• **Contemporary praise poetry:** Adapting traditional forms for modern subjects
• **Educational literature:** Using traditional narrative styles to teach modern subjects
• **Cultural journalism:** Reporting contemporary events using traditional narrative frameworks

#### Global Implications

The N'Ko model of preserving oral traditions has implications far beyond Mande communities:
• **Indigenous rights:** Demonstrates communities' rights to preserve culture in their own languages
• **Cultural diversity:** Shows how written and oral traditions can complement rather than compete
• **Educational methodology:** Provides model for culturally relevant literacy programs
• **Digital preservation:** Traditional oral knowledge can be preserved using modern technology`,
        nkoText: "ߒߞߏ ߞߊ߬ ߞߘߐߝߐߦߊ ߟߊߞߍ߬ߙߍ߲߬ ߛߓߍߛߎ߲ ߘߐ߫",
        latinTransliteration: "N'ko ka kɛnodofɔya lakɛrɛn sɛbɛsi do",
        englishTranslation: "N'Ko preserves oral tradition in writing",
        pronunciation: "[ŋ̀kó ká kɛ̀nòdòfɔ̀jà làkɛ̀rɛ̀n sɛ̀bɛ̀sì dò]",
        audioPrompt: "Reverent, cultural preservation tone emphasizing the bridge between oral and written traditions",
        exercises: [
          {
            type: "cultural-analysis", 
            question: "How does N'Ko solve the crisis of oral tradition transmission in modern times?",
            options: [
              "By replacing oral traditions entirely",
              "By providing accurate written preservation while maintaining cultural authenticity",
              "By translating traditions into foreign languages",
              "By modernizing traditions beyond recognition"
            ],
            correctAnswer: 1,
            explanation: "N'Ko provides a bridge that preserves oral traditions in written form while maintaining their cultural authenticity and accessibility.",
            difficulty: "medium"
          }
        ]
      },
      
      {
        title: "Contemporary Significance and Future Implications",
        order: 5,
        duration: 18,
        content: `### N'Ko in the 21st Century: Digital Renaissance and Global Reach

Today, more than 75 years after its creation, N'Ko continues to evolve and expand, demonstrating remarkable vitality and adaptability. Contemporary developments reveal N'Ko's potential as a model for indigenous script revitalization and cultural sovereignty movements worldwide.

#### Digital Age Adaptation

N'Ko's integration into digital technologies has accelerated its growth and global reach:

**Technological Milestones:**
• **Unicode Integration (2006):** N'Ko officially entered Unicode 5.0, ensuring global digital compatibility
• **Font Development:** Professional N'Ko fonts enable high-quality publishing and display
• **Input Methods:** Keyboard layouts available for all major operating systems
• **Mobile Technology:** N'Ko keyboards and apps for smartphones and tablets
• **Web Presence:** Growing number of N'Ko websites, social media content, and online resources

**Digital Publishing Revolution:**
• **Desktop Publishing:** Community members can now produce professional-quality N'Ko publications
• **Online Libraries:** Digital archives of N'Ko texts accessible worldwide
• **E-books and Digital Media:** Modern distribution methods for N'Ko literature
• **Educational Software:** Interactive N'Ko learning programs and games

#### Educational Institutionalization

N'Ko is increasingly being integrated into formal educational systems, representing a significant shift from its grassroots origins:

**Formal Recognition:**
• **Guinea:** N'Ko recognized as national script, taught in some public schools
• **Mali:** Experimental N'Ko education programs in selected regions
• **International Universities:** N'Ko courses offered in academic institutions worldwide
• **Research Centers:** Academic centers dedicated to N'Ko and Mande studies

**Pedagogical Innovations:**
• **Mother-tongue Education:** N'Ko used as medium of instruction for other subjects
• **Bilingual Programs:** Integration with French/English education systems
• **Adult Literacy:** Highly successful adult education programs using N'Ko
• **Teacher Training:** Professional development programs for N'Ko educators

#### Global Diaspora Networks

N'Ko has become a unifying force for Mande diaspora communities worldwide:

**Geographic Spread:**
• **Europe:** Active N'Ko communities in France, Belgium, Spain, UK
• **North America:** Growing N'Ko groups in USA and Canada
• **Middle East:** Mande migrant workers maintaining N'Ko literacy
• **Asia:** Small but dedicated N'Ko communities in China and other Asian countries

**Diaspora Functions:**
• **Cultural Maintenance:** Preserving Mande identity in foreign countries
• **Intergenerational Transmission:** Teaching N'Ko to children born abroad
• **Transnational Networks:** Connecting Mande communities across continents
• **Cultural Diplomacy:** Representing Mande culture in international contexts

#### Contemporary Challenges and Opportunities

N'Ko faces both challenges and opportunities in the contemporary global context:

**Challenges:**
• **Government Resistance:** Some states view N'Ko as threat to national unity
• **Economic Pressures:** Limited economic incentives for N'Ko literacy
• **Educational Competition:** Competition with international languages for educational time
• **Generational Gaps:** Younger generations sometimes prefer international scripts
• **Resource Limitations:** Limited funding for N'Ko educational materials and programs

**Opportunities:**
• **Digital Revolution:** Technology makes N'Ko production and distribution easier
• **Cultural Renaissance:** Growing global interest in indigenous cultures and languages
• **Educational Research:** Evidence supporting mother-tongue education effectiveness
• **International Support:** UNESCO and other organizations supporting linguistic diversity
• **Diaspora Resources:** Overseas communities providing financial and intellectual support

#### N'Ko as Model for Global Indigenous Movements

N'Ko's success provides inspiration and practical lessons for other indigenous script and literacy movements:

**Transferable Principles:**
• **Community Ownership:** Grassroots control ensures cultural authenticity
• **Linguistic Precision:** Scripts designed for specific languages are more effective
• **Cultural Pride:** Indigenous scripts can enhance rather than threaten modern development
• **Educational Effectiveness:** Mother-tongue literacy dramatically improves learning outcomes
• **Digital Adaptation:** Traditional scripts can successfully adapt to modern technology

#### Your Role in the N'Ko Story

As you begin your N'Ko learning journey, you become part of this remarkable story of intellectual courage, cultural preservation, and educational innovation. Whether you are a heritage learner reconnecting with Mande culture, a scholar studying African linguistic traditions, an educator interested in mother-tongue education, or a global citizen supporting cultural diversity, you join a movement that has proven the power of indigenous knowledge systems to compete and thrive in the modern world.`,
        nkoText: "ߒߞߏ ߦߋ߫ ߘߎ߱ ߞߎߘߊ ߣߌ߫ ߞߘߐߕߊߟߌ ߢߍ߫ ߞߘߐ ߘߐ߫",
        latinTransliteration: "N'ko ye du kunda ni kɛnodotali bɛɛ kɛndo do",
        englishTranslation: "N'Ko is in the world's future and all developments",
        pronunciation: "[ŋ̀kó jé dù kùndà nì kɛ̀nòdòtàlì bɛ̀ɛ̀ kɛ̀ndò dò]",
        audioPrompt: "Forward-looking, inspiring tone emphasizing N'Ko's continued relevance and future potential",
        exercises: [
          {
            type: "future-thinking",
            question: "What contemporary global implications does N'Ko's success have?",
            options: [
              "None beyond West Africa",
              "Only linguistic implications",
              "It provides a model for indigenous script and cultural sovereignty movements worldwide",
              "Only educational implications"
            ],
            correctAnswer: 2,
            explanation: "N'Ko's success demonstrates principles transferable to global indigenous movements: community ownership, linguistic precision, and cultural pride.",
            difficulty: "hard"
          }
        ]
      }
    ],
    
    quiz: {
      title: "Comprehensive Scholarly Assessment: N'Ko as African Intellectual Achievement",
      description: "Demonstrate your understanding of N'Ko's place within African intellectual history, Islamic educational traditions, and contemporary cultural movements",
      questions: [
        {
          question: "What is the 'Afro-Muslim vernacular tradition' and how does N'Ko relate to it?",
          options: [
            "A recent movement started by Kanté",
            "A centuries-old tradition of using African languages to strengthen Islamic practice",
            "An anti-Arabic movement in West Africa",
            "A colonial-era educational policy"
          ],
          correctAnswer: 1,
          explanation: "The Afro-Muslim vernacular tradition spans centuries of African Muslim scholars using local languages for Islamic education, with N'Ko representing its culmination.",
          difficulty: "hard",
          points: 4
        },
        {
          question: "What does Christopher Wyrod mean by 'social orthography of identity'?",
          options: [
            "A script that is easy to write",
            "A writing system that becomes a symbol of cultural identity",
            "A script designed for social media",
            "An orthography approved by society"
          ],
          correctAnswer: 1,
          explanation: "Wyrod's term describes how N'Ko functions beyond writing to serve as a powerful symbol of Mande cultural identity and intellectual capability.",
          difficulty: "medium",
          points: 3
        },
        {
          question: "How has N'Ko enabled the 're-invention of oral tradition'?",
          options: [
            "By replacing oral traditions with written ones",
            "By recording and preserving oral traditions in written form while maintaining cultural authenticity",
            "By translating oral traditions into foreign languages",
            "By modernizing oral traditions beyond recognition"
          ],
          correctAnswer: 1,
          explanation: "N'Ko provides a bridge that preserves oral traditions in written form while maintaining their cultural authenticity and accessibility.",
          difficulty: "medium",
          points: 3
        }
      ],
      passingScore: 7,
      totalPoints: 10
    },
    
    summary: `You have completed a scholarly exploration of N'Ko that reveals its true significance as a major African intellectual achievement. You now understand N'Ko's place within the centuries-old Afro-Muslim vernacular tradition, the complex Islamic educational reform context that shaped Kanté's innovation, how N'Ko functions as a "social orthography of identity" for Mande communities, the script's role in preserving and re-inventing oral traditions for the modern era, and its contemporary global significance as a model for indigenous movements.`,
    
    nextSteps: [
      "Begin practical study of N'Ko characters with deep appreciation for their cultural significance",
      "Explore the actual texts and literature that embody this intellectual tradition",
      "Connect with the global N'Ko learning community that continues this tradition"
    ]
  }
};

async function replaceWithMarkdownLesson() {
  try {
    console.log('🔄 Replacing comprehensive introduction lesson with markdown content...');
    
    // First delete the existing lesson
    await prisma.nkoLesson.delete({
      where: {
        slug: "nko-comprehensive-scholarly-introduction"
      }
    });
    
    // Create the new lesson with markdown content
    const createdLesson = await prisma.nkoLesson.create({
      data: markdownIntroLesson
    });
    
    console.log(`✅ Replaced lesson with markdown content: ${createdLesson.slug}`);
    console.log('🎉 Markdown lesson replacement completed successfully!');
    
    return createdLesson;
    
  } catch (error) {
    console.error('❌ Error replacing lesson:', error);
    // If delete fails, try update instead
    try {
      const updatedLesson = await prisma.nkoLesson.update({
        where: {
          slug: "nko-comprehensive-scholarly-introduction"
        },
        data: markdownIntroLesson
      });
      console.log(`✅ Updated lesson with markdown content: ${updatedLesson.slug}`);
      return updatedLesson;
    } catch (updateError) {
      console.error('❌ Error updating lesson:', updateError);
      throw updateError;
    }
  }
}

// Run the replacement
async function main() {
  try {
    await replaceWithMarkdownLesson();
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

module.exports = { replaceWithMarkdownLesson, markdownIntroLesson }; 