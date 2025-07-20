const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Comprehensive N'Ko Introduction with Many Short Sections
const detailedIntroLesson = {
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
  estimatedTime: 90,
  duration: "90 minutes",
  tags: ["academic", "scholarly", "comprehensive", "cultural-analysis", "intellectual-history"],
  objectives: [
    "Understand N'Ko within the broader Afro-Muslim vernacular literacy tradition spanning centuries",
    "Analyze Solomana Kanté's work as both Islamic educational reform and anti-colonial resistance",
    "Explore the intellectual and cultural context of post-WWII West African Islamic sphere",
    "Examine N'Ko as a 'social orthography of identity' for Mande communities",
    "Connect N'Ko to earlier Ajami traditions and Islamic pedagogical innovations",
    "Understand the script's role in re-inventing oral tradition for the modern era",
    "Appreciate N'Ko's contemporary global significance and future implications"
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
    "Islamic reform movements and language-in-education debates",
    "Pan-Africanist and ethno-nationalist dimensions of script creation",
    "N'Ko as symbol of Mande cultural sovereignty and intellectual capability"
  ],
  isActive: true,
  difficulty: 2,
  content: {
    introduction: `This lesson presents N'Ko not as an isolated invention, but as a culminating achievement within a centuries-old tradition of African Islamic intellectual innovation. Drawing on recent scholarly research, we explore how Solomana Kanté's creation represents both a continuation of and revolution within the Afro-Muslim vernacular tradition.`,
    
    sections: [
      {
        title: "Introduction: Beyond the Simple Story",
        order: 1,
        duration: 8,
        content: `Most people know the basic story: Solomana Kanté invented N'Ko in 1949 after reading a racist book claiming African languages couldn't be written. But this simple narrative misses the deeper, more fascinating truth.

N'Ko didn't emerge from nowhere. It represents the culmination of a centuries-old intellectual tradition where African Muslim scholars used local languages to strengthen Islamic practice while asserting African intellectual equality.

This lesson reveals the sophisticated academic context behind N'Ko's creation. You'll discover how Kanté built upon traditions stretching back 300 years, how his work responded to complex debates about Islamic education, and why N'Ko became far more than just a writing system.

By understanding this deeper story, you'll appreciate N'Ko not just as a script, but as a major African intellectual achievement with profound implications for education, culture, and identity.`,
        nkoText: "ߒߞߏ ߦߋ߫ ߞߊ߬ߙߊ߲ ߞߎ߲߬ߠߊ߬ߛߌ߮ ߟߋ߬ ߘߌ߫",
        latinTransliteration: "N'ko ye karan kulasiw le di",
        englishTranslation: "N'Ko is an ancient learning tradition",
        pronunciation: "[ŋ̀kó jé kàrán kùlàsìw lé dì]",
        audioPrompt: "Thoughtful, academic introduction setting scholarly tone",
        exercises: [
          {
            type: "multiple-choice",
            question: "What does this lesson reveal about N'Ko's origins?",
            options: [
              "It was invented completely from scratch",
              "It builds on centuries-old African intellectual traditions",
              "It copied other writing systems",
              "It was created only as a response to racism"
            ],
            correctAnswer: 1,
            explanation: "N'Ko represents the culmination of a centuries-old tradition of African scholars using local languages for Islamic education and intellectual work.",
            difficulty: "easy"
          }
        ]
      },

      {
        title: "The Afro-Muslim Vernacular Tradition: Setting the Context",
        order: 2,
        duration: 7,
        content: `To understand N'Ko, you must first understand the "Afro-Muslim vernacular tradition"—a term scholars use to describe centuries of African Muslim intellectuals who used local African languages to strengthen Islamic practice.

This wasn't a minor footnote in history. For over 300 years before Kanté, brilliant African scholars across West Africa were experimenting with writing their languages, developing educational methods, and creating literature—all while maintaining their Islamic identity.

These scholars shared a revolutionary idea: that people learn religious and intellectual concepts better in their own languages, and that African languages were perfectly capable of expressing sophisticated ideas.

What makes this tradition remarkable is its intellectual courage. These scholars challenged the assumption that serious Islamic knowledge required Arabic language mastery. They argued that understanding, not linguistic form, was the essence of Islamic practice.

Kanté emerged directly from this tradition. He wasn't inventing something completely new—he was innovating within a well-established intellectual framework.`,
        nkoText: "ߊߖߊߡߌ ߞߊ߬ߙߊ߲߬ߡߐ߮ ߟߎ߬ ߞߊ߬ ߛߌ߬ߟߡߊ߬ߦߊ ߞߍ߫ ߒߞߏ ߟߊ߫",
        latinTransliteration: "Ajami karamɔw lu ka silamaya kɛ N'ko la",
        englishTranslation: "Ajami scholars brought Islam to N'Ko",
        pronunciation: "[àʒàmì kàràmɔ̀w lù ká sìlàmàjà kɛ̀ ŋ̀kó là]",
        audioPrompt: "Respectful, scholarly tone emphasizing intellectual tradition",
        exercises: [
          {
            type: "multiple-choice",
            question: "What characterized the Afro-Muslim vernacular tradition?",
            options: [
              "Opposition to Islam",
              "Using only Arabic for all religious matters",
              "Using local African languages to strengthen Islamic practice",
              "Rejecting all traditional learning"
            ],
            correctAnswer: 2,
            explanation: "The Afro-Muslim vernacular tradition was characterized by scholars using local African languages to make Islamic knowledge more accessible while strengthening religious practice.",
            difficulty: "medium"
          }
        ]
      },

      {
        title: "Ajami: The 300-Year Foundation",
        order: 3,
        duration: 8,
        content: `The foundation for N'Ko was laid by "Ajami"—the practice of writing African languages using adapted Arabic script. The word comes from Arabic 'ajam, meaning "non-Arab," and represents one of Africa's most significant intellectual achievements.

Starting in the 17th century, African Muslim scholars across West Africa began experimenting with writing their languages. They adapted Arabic letters to capture sounds unique to African languages, developed new symbols for tones, and created entire libraries of literature.

This wasn't just practical—it was revolutionary. These scholars were proving that African languages could express any concept that Arabic could, from complex theology to sophisticated poetry to scientific knowledge.

Four major Ajami traditions directly influenced N'Ko:

Fulani scholars in Guinea wrote religious commentaries, arguing "only your own tongue will allow you to understand what the Original texts say."

Hausa scholars in Nigeria composed poetry and educational texts, believing "when we compose in Arabic only the learned benefit, but in Fulani the unlettered also gain."

Wolof scholars in Senegal created extensive literature while asserting that "skin color cannot be the cause of stupidity or ignorance."

Manding scholars in various regions, including Kanté's own area, had been experimenting with writing their language for generations.`,
        nkoText: "ߊߖߊߡߌ ߞߊ߬ ߒߞߏ ߘߊߡߌ߬ߣߊ߬ ߞߊ߬ߙߊ߲ ߞߍ߫ ߟߊ߫",
        latinTransliteration: "Ajami ka N'ko damina karan kɛ la",
        englishTranslation: "Ajami paved the way for N'Ko learning",
        pronunciation: "[àʒàmì ká ŋ̀kó dàmìnà kàrán kɛ̀ là]",
        audioPrompt: "Academic tone emphasizing historical continuity and achievement",
        exercises: [
          {
            type: "multiple-choice",
            question: "What does 'Ajami' refer to?",
            options: [
              "A type of Arabic calligraphy",
              "African languages written in Arabic script",
              "A religious movement",
              "A trading network"
            ],
            correctAnswer: 1,
            explanation: "Ajami refers to the practice of writing African languages using adapted Arabic script, representing centuries of African intellectual innovation.",
            difficulty: "easy"
          },
          {
            type: "multiple-choice",
            question: "Which quote demonstrates the philosophy behind vernacular Islamic education?",
            options: [
              "'Arabic is the only sacred language'",
              "'Only your own tongue will allow you to understand what the Original texts say'",
              "'Local languages are inferior'",
              "'Religious knowledge must remain secret'"
            ],
            correctAnswer: 1,
            explanation: "This quote from Fulani scholar Cerno Samba Mambeyaa captures the core belief that people understand religious concepts better in their mother tongue.",
            difficulty: "medium"
          }
        ]
      },

      {
        title: "Kanté's Intellectual Heritage",
        order: 4,
        duration: 6,
        content: `Solomana Kanté didn't work in isolation. He was the direct intellectual heir of specific scholars who had been experimenting with writing Manding in his very region.

His father, Amara Kanté, was a renowned kàramɔ́ɔ (Quranic teacher) whose innovative teaching methods attracted students from across West Africa. Kanté grew up surrounded by educational innovation and linguistic experimentation.

In his local area around Kankan, two important predecessors had already been working on similar problems:

Alfa Mahmud Kàbá, a 19th-century leader who unified the Batè region, was known for translating Islamic poems into Manding and may have been the first to attempt writing Manding in Arabic script.

Jakagbɛ Talibi Kàbá, a contemporary of Kanté's father, was also concerned with translating Islamic rites into Manding and reportedly attempted to create a unique writing system.

Kanté explicitly considered himself the heir to these men's work. He saw N'Ko not as a completely new invention, but as the successful completion of what his predecessors had begun.

This intellectual lineage is crucial for understanding N'Ko's legitimacy and depth. Kanté wasn't a lone genius—he was the culmination of generations of African intellectual effort.`,
        nkoText: "ߛߟߏ߬ߡߣߊ߫ ߞߊ߲ߕߍ߫ ߞߊ߬ ߞߊ߬ߙߊ߲߬ߡߐ߮ ߓߊ ߟߎ߬ ߕߏ߫",
        latinTransliteration: "Sulemana Kante ka karamɔw ba lu to",
        englishTranslation: "Solomana Kanté followed the scholar fathers",
        pronunciation: "[sùlèmànà kàntè ká kàràmɔ̀w bá lù tó]",
        audioPrompt: "Respectful tone emphasizing intellectual lineage and heritage",
        exercises: [
          {
            type: "multiple-choice",
            question: "How did Kanté view his relationship to previous scholars?",
            options: [
              "He ignored their work completely",
              "He saw himself as their intellectual heir",
              "He opposed their methods",
              "He had no knowledge of them"
            ],
            correctAnswer: 1,
            explanation: "Kanté explicitly considered himself the heir to local scholars like Alfa Mahmud Kàbá and Jakagbɛ Talibi Kàbá who had experimented with writing Manding.",
            difficulty: "easy"
          }
        ]
      },

      {
        title: "Post-WWII Islamic Reform: The Historical Moment",
        order: 5,
        duration: 7,
        content: `Kanté's invention of N'Ko in 1949 occurred during a period of intense debate within West African Muslim communities. The aftermath of World War II had disrupted traditional authorities and created space for new voices in Islamic education.

Two major forces were reshaping Islamic education across West Africa:

Traditional Quranic schools, which had educated Muslims for centuries using Arabic and oral instruction, suddenly faced questions about their effectiveness in the modern world.

The new "madrasa movement"—modernist Muslim schools that used Arabic as the medium of instruction while following Western-style curricula and teaching methods.

This created a three-way tension that directly influenced Kanté's thinking:

Traditional educators saw both madrasas and N'Ko as threats to their authority and livelihood.

Madrasa reformers believed Arabic was the only appropriate language for serious Islamic education and viewed vernacular education as backward.

N'Ko advocates, led by Kanté, argued that mother-tongue Islamic education was both more effective and more authentically African.

Understanding this context is crucial because N'Ko wasn't just responding to colonial racism—it was also a sophisticated intervention in contemporary Islamic educational debates.`,
        nkoText: "ߡߊ߬ߘߙߊߛߊ ߣߌ߫ ߒߞߏ ߟߎ߫ ߕߘߍ߬ ߦߋ߫ ߞߊ߬ߙߊ߲ ߘߐߞߍ߫ ߟߊ߫",
        latinTransliteration: "Madarasa ni N'ko lu tɛnde ye karan dokɛ la",
        englishTranslation: "Madrasas and N'Ko were both educational innovations",
        pronunciation: "[màdàràsà nì ŋ̀kó lù tɛ̀ndè jé kàrán dòkɛ̀ là]",
        audioPrompt: "Analytical tone discussing complex intellectual debates",
        exercises: [
          {
            type: "multiple-choice",
            question: "What created the need for educational reform in post-WWII West Africa?",
            options: [
              "Nothing - the old system was perfect",
              "Colonial authorities demanded changes",
              "Traditional authorities were disrupted and new voices emerged",
              "Arabic was being forgotten"
            ],
            correctAnswer: 2,
            explanation: "The aftermath of WWII disrupted traditional authorities and created space for new voices to question and reform Islamic educational methods.",
            difficulty: "medium"
          }
        ]
      },

      {
        title: "The Bouaké Encounter: Racism Meets Educational Reform",
        order: 6,
        duration: 6,
        content: `The famous story of Kanté encountering Kamal Marwa's racist book in Bouaké marketplace takes on deeper meaning when we understand the intellectual context.

Bouaké wasn't just any marketplace—it was a center of the madrasa movement. Kanté was living among Muslim reformers who were actively debating the future of Islamic education when he encountered a Lebanese author's claims about African intellectual inferiority.

Marwa's book claimed:
- African languages cannot be written
- They lack proper grammar
- They are mere "dialects" unworthy of intellectual attention
- Teaching European languages to Africans is easier than teaching Africans their own languages

This wasn't just personal insult—it was a direct challenge to everything the Afro-Muslim vernacular tradition represented and to the educational debates happening around Kanté.

What makes Kanté's response sophisticated is that it operated on two levels simultaneously:

As an Islamic educational reform, proving that mother-tongue education could democratize religious knowledge more effectively than Arabic-only approaches.

As a cultural sovereignty statement, demonstrating that African languages could express any concept as sophisticated as Arabic or European languages.

This dual response explains why N'Ko became both a religious and cultural movement.`,
        nkoText: "ߓߎ߬ߊߞߍ߫ ߘߐ߫ ߞߊ߲ߕߍ߫ ߞߊ߬ ߝߊ߯ߘߐߞߍ ߡߍ߲",
        latinTransliteration: "Buake do Kante ka fayidakɛ mɛn",
        englishTranslation: "In Bouaké, Kanté made a discovery",
        pronunciation: "[bùàkè dò kàntè ká fàjìdàkɛ̀ mɛ̀n]",
        audioPrompt: "Dramatic, pivotal moment tone emphasizing historical significance",
        exercises: [
          {
            type: "multiple-choice",
            question: "Why was Bouaké significant as the location of this encounter?",
            options: [
              "It was just a random marketplace",
              "It was a center of the madrasa movement where educational debates were happening",
              "It was Kanté's hometown",
              "It was where Arabic was first taught"
            ],
            correctAnswer: 1,
            explanation: "Bouaké was a center of the madrasa movement, meaning Kanté was surrounded by Islamic educational debates when he encountered racist claims about African languages.",
            difficulty: "medium"
          }
        ]
      },

      {
        title: "N'Ko as Islamic Educational Reform",
        order: 7,
        duration: 6,
        content: `While many see N'Ko primarily as a cultural movement, it's essential to understand that Kanté positioned it as serious Islamic educational reform.

Kanté made sophisticated religious arguments for N'Ko:

He cited the Prophet Muhammad's use of non-Arabic teachers and translators, arguing that the Prophet himself had demonstrated that Islamic knowledge could be transmitted in any language.

He quoted the Quran: "We haven't sent a Prophet in any other language but the language of his people so that he can explain things to them."

He argued that understanding, not linguistic form, was the essence of Islamic practice: "How will religion be understood in the fatherland's language if it isn't written?"

Like the madrasa reformers, Kanté sought to democratize access to Islamic knowledge. But while they used Arabic to bypass traditional authorities, Kanté used vernacular literacy to bypass both traditional authorities AND the Arabic-educated elite.

His Quran translation was revolutionary—it eliminated the need for Arabic-literate intermediaries entirely. Any Manding speaker could now read the holy book directly.

This rationalist approach positioned N'Ko within broader Islamic reform movements while maintaining its African character.

Kanté explicitly distanced himself from religious extremists: "Most people who master the Arabic language are religious fanatics... anything written on other things is considered by them as paganism."`,
        nkoText: "ߞߎ߬ߙߣߊ߬ ߞߊߟߊߒߞߋ ߘߐ߫ ߒߞߏ ߟߊ߫",
        latinTransliteration: "Kurana kalanbɛ do N'ko la",
        englishTranslation: "The Quran is available in N'Ko",
        pronunciation: "[kùrànà kàlànbɛ̀ dò ŋ̀kó là]",
        audioPrompt: "Serious, scholarly tone emphasizing religious legitimacy",
        exercises: [
          {
            type: "multiple-choice",
            question: "How did Kanté justify N'Ko from an Islamic perspective?",
            options: [
              "He argued Islam should abandon Arabic entirely",
              "He cited Quranic verses about prophets speaking in their people's languages",
              "He claimed N'Ko was superior to Arabic",
              "He rejected Islamic teachings"
            ],
            correctAnswer: 1,
            explanation: "Kanté used Islamic precedent, including Quranic verses about prophets communicating in their people's languages, to justify vernacular religious education.",
            difficulty: "medium"
          }
        ]
      },

      {
        title: "N'Ko as Cultural Sovereignty Movement",
        order: 8,
        duration: 6,
        content: `Beyond its religious dimensions, N'Ko became a powerful assertion of African cultural sovereignty and intellectual equality.

Scholar Christopher Wyrod coined the term "social orthography of identity" to describe how N'Ko functions far beyond its technical role as a writing system. It became a symbol of:

Intellectual equality: Proving that African languages could express sophisticated concepts in theology, philosophy, science, and literature.

Cultural authenticity: Demonstrating that Islamic practice could be genuinely African without being less Islamic.

Educational effectiveness: Showing dramatically higher literacy success rates than Arabic or French instruction.

Pan-African potential: Inspiring other African communities to develop their own indigenous scripts and educational systems.

What makes N'Ko remarkable is its competitive success against much older, better-financed systems:

Arabic script had 1300+ years in West Africa, religious sanction, and traditional scholarly prestige.

Latin script had colonial government support, modern educational systems, and international commercial advantages.

French language had official status, economic advancement opportunities, and administrative power.

Yet N'Ko succeeded through grassroots community adoption, proving that cultural authenticity and linguistic precision could triumph over institutional advantage.`,
        nkoText: "ߒߞߏ ߦߋ߫ ߡߊ߲߬ߘߋ߲߫ ߖߊ߯ߓߊߟߌ ߟߋ߬ ߘߌ߫",
        latinTransliteration: "N'ko ye Mandɛn jawbali le di",
        englishTranslation: "N'Ko is Mande identity/answer",
        pronunciation: "[ŋ̀kó jé màndɛ̀n ʒàwbàlì lé dì]",
        audioPrompt: "Proud, confident tone emphasizing cultural achievement",
        exercises: [
          {
            type: "multiple-choice",
            question: "What does 'social orthography of identity' mean?",
            options: [
              "A writing system that's easy to learn",
              "A script that becomes a symbol of cultural identity beyond its technical function",
              "An official government writing system",
              "A religious writing system"
            ],
            correctAnswer: 1,
            explanation: "The term describes how N'Ko functions beyond writing to serve as a powerful symbol of Mande cultural identity and intellectual capability.",
            difficulty: "medium"
          }
        ]
      },

      {
        title: "Preserving Oral Traditions: The Re-invention Revolution",
        order: 9,
        duration: 6,
        content: `One of N'Ko's most remarkable achievements is how it solved a cultural crisis: the potential loss of centuries of oral traditions in an increasingly modern world.

Traditional Mande societies had maintained sophisticated oral traditions for over a millennium:
- Epic narratives like the Sundiata story
- Historical chronicles of dynasties and migrations
- Genealogical records of families and clans
- Praise poetry and moral teachings
- Technical knowledge about agriculture, medicine, and crafts

This knowledge was preserved by jalilu (griots)—hereditary oral historians who memorized vast amounts of information and performed it in musical/poetic form.

But by the 20th century, this system faced unprecedented threats:
- Urbanization pulled young people away from traditional teachers
- Colonial schools devalued traditional knowledge
- Economic changes broke down traditional patronage systems
- Modern lifestyles left less time for traditional learning

N'Ko provided the perfect bridge: it could preserve oral traditions in written form while maintaining their cultural authenticity.

Scholar Dianne White Oyler calls this the "re-invention of oral tradition"—transforming spoken heritage into written literature without losing its essence.

Today, N'Ko practitioners produce more printed text annually than all official state-backed Latin orthographies for Manding languages combined. They've created historical chronicles, religious texts, educational materials, creative literature, and technical works.`,
        nkoText: "ߒߞߏ ߞߊ߬ ߞߘߐߝߐߦߊ ߟߊߞߍ߬ߙߍ߲߬ ߛߓߍߛߎ߲ ߘߐ߫",
        latinTransliteration: "N'ko ka kɛnodofɔya lakɛrɛn sɛbɛsi do",
        englishTranslation: "N'Ko preserves oral tradition in writing",
        pronunciation: "[ŋ̀kó ká kɛ̀nòdòfɔ̀jà làkɛ̀rɛ̀n sɛ̀bɛ̀sì dò]",
        audioPrompt: "Reverent tone emphasizing cultural preservation and innovation",
        exercises: [
          {
            type: "multiple-choice",
            question: "What crisis did N'Ko help solve regarding oral traditions?",
            options: [
              "There were no oral traditions to preserve",
              "The risk of losing centuries of oral knowledge in the modern world",
              "Oral traditions were too numerous to remember",
              "People preferred written traditions"
            ],
            correctAnswer: 1,
            explanation: "N'Ko provided a bridge that preserves oral traditions in written form while maintaining their cultural authenticity and accessibility.",
            difficulty: "easy"
          }
        ]
      },

      {
        title: "Digital Age Renaissance: N'Ko Goes Global",
        order: 10,
        duration: 6,
        content: `N'Ko's integration into digital technologies has accelerated its growth and transformed it into a global movement.

Key technological milestones include:

Unicode Integration (2006): N'Ko officially entered Unicode 5.0, ensuring global digital compatibility. This was a major achievement that put N'Ko on equal footing with other world scripts.

Font Development: Professional N'Ko fonts now enable high-quality publishing and display across all platforms.

Digital Publishing Revolution: Community members can produce professional N'Ko publications using desktop publishing, creating online libraries and e-books.

Mobile Technology: N'Ko keyboards and apps for smartphones have made the script accessible to younger generations worldwide.

Educational Software: Interactive N'Ko learning programs and games are bringing traditional knowledge to modern learners.

This digital adaptation has enabled N'Ko to transcend its geographic origins. Today there are active N'Ko communities in:
- Europe (France, Belgium, Spain, UK)
- North America (USA, Canada)
- Middle East (among Mande migrant workers)
- Asia (small but dedicated communities)

These diaspora communities use N'Ko for cultural maintenance, teaching children born abroad, and creating transnational networks that connect Mande speakers across continents.`,
        nkoText: "ߒߞߏ ߦߋ߫ ߘߎ߱ ߞߎߘߊ ߣߌ߫ ߞߘߐߕߊߟߌ ߢߍ߫ ߞߘߐ ߘߐ߫",
        latinTransliteration: "N'ko ye du kunda ni kɛnodotali bɛɛ kɛndo do",
        englishTranslation: "N'Ko is in the world's future and all developments",
        pronunciation: "[ŋ̀kó jé dù kùndà nì kɛ̀nòdòtàlì bɛ̀ɛ̀ kɛ̀ndò dò]",
        audioPrompt: "Forward-looking, inspiring tone emphasizing global reach",
        exercises: [
          {
            type: "multiple-choice",
            question: "What was significant about N'Ko entering Unicode in 2006?",
            options: [
              "It was the first African script in Unicode",
              "It ensured global digital compatibility and put N'Ko on equal footing with world scripts",
              "It made N'Ko the official script of West Africa",
              "It replaced Arabic script entirely"
            ],
            correctAnswer: 1,
            explanation: "Unicode integration ensured N'Ko could be used across all digital platforms globally, giving it the same technical status as other major world scripts.",
            difficulty: "medium"
          }
        ]
      },

      {
        title: "Educational Revolution: From Grassroots to Institutions",
        order: 11,
        duration: 5,
        content: `N'Ko has undergone a remarkable transformation from grassroots movement to institutional recognition, representing one of the most successful indigenous script revivals in modern history.

Formal Recognition Milestones:

Guinea: N'Ko has been recognized as a national script and is taught in some public schools, representing official acknowledgment of its educational value.

Mali: Experimental N'Ko education programs are being tested in selected regions, with promising results showing higher literacy rates than French-only instruction.

International Universities: N'Ko courses are now offered in academic institutions worldwide, legitimizing it as a subject of serious scholarly study.

Research Centers: Academic centers dedicated to N'Ko and Mande studies have been established, generating scholarly research and preserving knowledge.

The pedagogical innovations enabled by N'Ko are particularly impressive:

Mother-tongue Education: N'Ko is being used as the medium of instruction for other subjects, proving that indigenous languages can serve all educational functions.

Bilingual Programs: Integration with French/English education systems shows how indigenous and international languages can complement each other.

Adult Literacy: N'Ko adult education programs achieve remarkably high success rates, often surpassing programs using colonial languages.

This educational success validates centuries of Afro-Muslim vernacular tradition arguments about the effectiveness of mother-tongue education.`,
        nkoText: "ߒߞߏ ߞߊ߬ߙߊ߲ ߦߋ߫ ߢߊ߫ ߝߌ߬ߟߊ߬ ߟߊ߫",
        latinTransliteration: "N'ko karan ye ba fila la",
        englishTranslation: "N'Ko education is very successful",
        pronunciation: "[ŋ̀kó kàrán jé bá fìlà là]",
        audioPrompt: "Proud, achievement-focused tone emphasizing educational success",
        exercises: [
          {
            type: "multiple-choice",
            question: "What makes N'Ko's educational success particularly significant?",
            options: [
              "It's the only literacy program in West Africa",
              "It validates centuries of arguments about mother-tongue education effectiveness",
              "It's easier than other writing systems",
              "It requires no teaching"
            ],
            correctAnswer: 1,
            explanation: "N'Ko's educational success validates the centuries-old Afro-Muslim vernacular tradition argument that people learn more effectively in their mother tongue.",
            difficulty: "medium"
          }
        ]
      },

      {
        title: "Global Model: Inspiring Indigenous Movements Worldwide",
        order: 12,
        duration: 5,
        content: `N'Ko's success has made it a powerful model for indigenous script and cultural sovereignty movements around the world.

The transferable principles from N'Ko's success include:

Community Ownership: Grassroots control ensures cultural authenticity and sustainability. External imposition of scripts typically fails, but community-driven initiatives succeed.

Linguistic Precision: Scripts designed specifically for particular languages are far more effective than adapted foreign scripts.

Cultural Pride: Indigenous scripts can enhance rather than threaten modern development when they strengthen cultural identity.

Educational Effectiveness: Mother-tongue literacy dramatically improves learning outcomes across all subjects.

Digital Adaptation: Traditional scripts can successfully integrate with modern technology without losing their authenticity.

These principles are now influencing:
- Revival of other African scripts (Vai, Tifinagh, Ge'ez)
- Indigenous script movements in Asia and the Americas
- Academic research on script creation and language revitalization
- UNESCO policies supporting indigenous writing systems

N'Ko demonstrates that in our globalized world, local authenticity and universal modernity can reinforce rather than compete with each other.

For scholars of education, linguistics, cultural studies, and development, N'Ko provides a compelling case study of how indigenous knowledge systems can not only survive but thrive in the modern world.`,
        nkoText: "ߒߞߏ ߦߋ߫ ߞߙߊߥߟߊ ߟߋ߬ ߘߌ߫ ߝߊ߬ߘߌ߬ߘߊ ߟߎ߬ ߢߍ߫",
        latinTransliteration: "N'ko ye kɛnyawla le di fadidida lu bɛɛ",
        englishTranslation: "N'Ko is an example for all creators",
        pronunciation: "[ŋ̀kó jé kɛ̀njàwlà lé dì fàdìdìdà lù bɛ̀ɛ̀]",
        audioPrompt: "Inspiring, forward-looking tone emphasizing global significance",
        exercises: [
          {
            type: "multiple-choice",
            question: "What makes N'Ko a model for other indigenous movements?",
            options: [
              "It's the oldest African script",
              "It demonstrates principles like community ownership and cultural pride that others can apply",
              "It's the easiest script to learn",
              "It only works for African languages"
            ],
            correctAnswer: 1,
            explanation: "N'Ko provides transferable principles like community ownership, linguistic precision, and cultural pride that other indigenous movements can adapt to their contexts.",
            difficulty: "medium"
          }
        ]
      },

      {
        title: "Your Role in the Continuing Story",
        order: 13,
        duration: 4,
        content: `As you begin your N'Ko learning journey, you become part of this remarkable story of intellectual courage, cultural preservation, and educational innovation.

Whether you are:
- A heritage learner reconnecting with Mande culture
- A scholar studying African linguistic traditions
- An educator interested in mother-tongue education methods
- A global citizen supporting cultural diversity
- Someone fascinated by writing systems and their social impact

You join a movement that has proven the power of indigenous knowledge systems to compete and thrive in the modern world.

Your learning contributes to the ongoing vitality of this African intellectual achievement. Every person who learns N'Ko:

Validates the centuries of African scholars who believed in vernacular education
Supports the continued development of N'Ko literature and digital resources
Helps preserve and transmit cultural knowledge to future generations
Demonstrates global interest in authentic African intellectual traditions

The story of N'Ko teaches us that authentic cultural traditions and modern global participation can strengthen each other. In learning N'Ko, you're not just acquiring a script—you're participating in one of Africa's most significant contemporary intellectual movements.

This is your invitation to join a tradition of learning that stretches back centuries while pointing toward a future where cultural diversity and intellectual equality flourish together.`,
        nkoText: "ߊ߬ ߦߋ߫ ߒߞߏ ߞߊ߬ߙߊ߲߬ߞߊ߲ ߠߋ߬ ߘߌ߫ ߓߌ߬",
        latinTransliteration: "A ye N'ko karankalan le di bi",
        englishTranslation: "You are now a N'Ko student",
        pronunciation: "[á jé ŋ̀kó kàrànkàlàn lé dì bì]",
        audioPrompt: "Welcoming, encouraging tone inviting participation in the tradition",
        exercises: [
          {
            type: "multiple-choice",
            question: "What does this lesson suggest about learning N'Ko?",
            options: [
              "It's just learning another writing system",
              "It's participating in a significant African intellectual tradition",
              "It's only useful for academic research",
              "It's a hobby with no broader significance"
            ],
            correctAnswer: 1,
            explanation: "Learning N'Ko means participating in a significant African intellectual tradition that spans centuries and continues to evolve in the modern world.",
            difficulty: "easy"
          }
        ]
      }
    ],
    
    quiz: {
      title: "Comprehensive Assessment: N'Ko as African Intellectual Achievement",
      description: "Demonstrate your understanding of N'Ko's place within African intellectual history, Islamic educational traditions, and contemporary cultural movements",
      questions: [
        {
          question: "What is the 'Afro-Muslim vernacular tradition'?",
          options: [
            "A recent movement started by Kanté",
            "A centuries-old tradition of African Muslim scholars using local languages to strengthen Islamic practice",
            "An anti-Arabic movement in West Africa",
            "A colonial-era educational policy"
          ],
          correctAnswer: 1,
          explanation: "The Afro-Muslim vernacular tradition spans centuries of African Muslim scholars using local languages for Islamic education, with N'Ko representing its culmination.",
          difficulty: "hard",
          points: 4
        },
        {
          question: "What does 'Ajami' refer to?",
          options: [
            "A type of Arabic calligraphy",
            "African languages written in Arabic script",
            "A religious movement",
            "A trading network"
          ],
          correctAnswer: 1,
          explanation: "Ajami refers to the practice of writing African languages using adapted Arabic script, representing centuries of African intellectual innovation.",
          difficulty: "medium",
          points: 3
        },
        {
          question: "What does 'social orthography of identity' mean?",
          options: [
            "A writing system that's easy to learn",
            "A script that becomes a symbol of cultural identity beyond its technical function",
            "An official government writing system",
            "A religious writing system"
          ],
          correctAnswer: 1,
          explanation: "The term describes how N'Ko functions beyond writing to serve as a powerful symbol of Mande cultural identity and intellectual capability.",
          difficulty: "medium",
          points: 3
        },
        {
          question: "How did N'Ko solve the crisis of oral tradition preservation?",
          options: [
            "By replacing oral traditions entirely",
            "By providing a bridge to preserve oral traditions in written form while maintaining cultural authenticity",
            "By translating traditions into foreign languages",
            "By modernizing traditions beyond recognition"
          ],
          correctAnswer: 1,
          explanation: "N'Ko provided a bridge that preserves oral traditions in written form while maintaining their cultural authenticity and accessibility.",
          difficulty: "medium",
          points: 3
        },
        {
          question: "What makes N'Ko a model for other indigenous movements?",
          options: [
            "It's the oldest African script",
            "It demonstrates principles like community ownership and cultural pride that others can apply",
            "It's the easiest script to learn",
            "It only works for African languages"
          ],
          correctAnswer: 1,
          explanation: "N'Ko provides transferable principles like community ownership, linguistic precision, and cultural pride that other indigenous movements can adapt.",
          difficulty: "hard",
          points: 4
        }
      ],
      passingScore: 12,
      totalPoints: 17
    },
    
    summary: `You have completed a comprehensive scholarly exploration of N'Ko that reveals its true significance as a major African intellectual achievement. You now understand N'Ko's place within the centuries-old Afro-Muslim vernacular tradition, how it emerged from complex Islamic educational debates, its role as both religious reform and cultural sovereignty movement, and its contemporary global significance as a model for indigenous script movements worldwide. This foundation prepares you to engage with N'Ko not just as a writing system, but as participation in one of Africa's most important ongoing intellectual traditions.`,
    
    nextSteps: [
      "Begin practical study of N'Ko characters with appreciation for their cultural significance",
      "Explore actual N'Ko texts and literature that embody this intellectual tradition",
      "Connect with the global N'Ko learning community",
      "Consider how N'Ko's principles might apply to other cultural preservation efforts"
    ]
  }
};

async function createDetailedIntroLesson() {
  try {
    console.log('🚀 Creating detailed N\'Ko introduction lesson with many sections...');
    
    // First delete the existing lesson
    await prisma.nkoLesson.delete({
      where: {
        slug: "nko-comprehensive-scholarly-introduction"
      }
    });
    
    // Create the new detailed lesson
    const createdLesson = await prisma.nkoLesson.create({
      data: detailedIntroLesson
    });
    
    console.log(`✅ Created detailed lesson with ${detailedIntroLesson.content.sections.length} sections: ${createdLesson.slug}`);
    console.log('🎉 Detailed lesson creation completed successfully!');
    
    return createdLesson;
    
  } catch (error) {
    console.error('❌ Error creating detailed lesson:', error);
    // If delete fails, try update instead
    try {
      const updatedLesson = await prisma.nkoLesson.update({
        where: {
          slug: "nko-comprehensive-scholarly-introduction"
        },
        data: detailedIntroLesson
      });
      console.log(`✅ Updated lesson with ${detailedIntroLesson.content.sections.length} sections: ${updatedLesson.slug}`);
      return updatedLesson;
    } catch (updateError) {
      console.error('❌ Error updating lesson:', updateError);
      throw updateError;
    }
  }
}

// Run the creation
async function main() {
  try {
    await createDetailedIntroLesson();
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

module.exports = { createDetailedIntroLesson, detailedIntroLesson }; 