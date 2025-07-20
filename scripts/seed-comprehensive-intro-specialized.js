const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Ultra-Comprehensive N'Ko Introduction Lesson Based on Academic Research
const specializedIntroLesson = {
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
    "Understand the script's role in re-inventing oral tradition for the modern era",
    "Appreciate N'Ko's unique position competing with established writing systems"
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
    introduction: `This lesson presents N'Ko not as an isolated invention, but as a culminating achievement within a centuries-old tradition of African Islamic intellectual innovation. Drawing on recent scholarly research by Coleman Donaldson, Christopher Wyrod, and Dianne White Oyler, we explore how Solomana Kanté's creation represents both a continuation of and revolution within the Afro-Muslim vernacular tradition—a tradition where African scholars have long used local languages to strengthen Islam while asserting African intellectual equality.`,
    
    sections: [
      {
        title: "The Afro-Muslim Vernacular Tradition: N'Ko's Intellectual Ancestry",
        order: 1,
        duration: 18,
        content: `
          <h3>Understanding the Deeper Story</h3>
          <p>To truly understand N'Ko, we must first understand that Solomana Kanté did not work in isolation. He was the inheritor and innovator within what scholars call the "Afro-Muslim vernacular tradition"—a centuries-old intellectual movement where African Muslim scholars used local African languages to strengthen Islamic practice and assert African intellectual equality.</p>
          
          <h4>The Ajami Precedent: Writing African Languages in Arabic Script</h4>
          <p>For over three centuries before Kanté, African Muslim scholars across West Africa had been experimenting with writing their languages using adapted Arabic script—a practice known as <strong>Ajami</strong> (from Arabic عجم 'ajam, meaning "non-Arab").</p>
          
          <div class="ajami-tradition-overview">
            <h5>Key Ajami Traditions That Influenced N'Ko:</h5>
            
            <div class="tradition-example">
              <h6>Fulani Ajami (18th-19th Century)</h6>
              <p><strong>Pioneer:</strong> Cerno Samba Mambeyaa (1755-1852) in Fuuta Jaloo (Guinea)</p>
              <p><strong>Philosophy:</strong> "I shall use the Fulfulde tongue to explain the dogma... For only your own tongue will allow you to understand what the Original texts say."</p>
              <p><strong>Innovation:</strong> Believed regular people should access Islamic commentaries in written form in their own language</p>
            </div>
            
            <div class="tradition-example">
              <h6>Hausa Ajami (19th Century)</h6>
              <p><strong>Pioneer:</strong> Shaykh Usman Dan Fodio (1754-1817) in Sokoto Caliphate</p>
              <p><strong>Philosophy:</strong> "When we compose in Arabic only the learned benefit. When we compose it in Fulfulde the unlettered also gain."</p>
              <p><strong>Innovation:</strong> Used vernacular writing to spread Islam to the masses while maintaining Arabic for scholarly discourse</p>
            </div>
            
            <div class="tradition-example">
              <h6>Wolof Ajami (19th-20th Century)</h6>
              <p><strong>Pioneer:</strong> Shaykh Amadu Bamba (1850-1927) and disciples like Muusaa Ka</p>
              <p><strong>Philosophy:</strong> Asserted strong African identity within Islam: "skin color cannot be the cause of stupidity or ignorance"</p>
              <p><strong>Innovation:</strong> Explicitly engaged with race and cultural autonomy within Islamic practice</p>
            </div>
            
            <div class="tradition-example">
              <h6>Manding Ajami (17th-19th Century)</h6>
              <p><strong>Regional Centers:</strong> Jakhanke clerics in Senegambia, Kong Empire scholarly tradition</p>
              <p><strong>Local Predecessors:</strong> Alfa Mahmud Kàbá and Jakagbɛ Talibi Kàbá in Kankan region</p>
              <p><strong>Innovation:</strong> Kanté considered himself heir to these local Ajami experimenters</p>
            </div>
          </div>
          
          <h4>The Common Thread: Language as Tool for Islamic Strengthening</h4>
          <p>What united all these traditions was a shared belief that:</p>
          <ul>
            <li><strong>Mother-tongue education enhances understanding:</strong> People learn Islamic principles better in their own languages</li>
            <li><strong>African languages are intellectually capable:</strong> African languages can express sophisticated theological, philosophical, and scientific concepts</li>
            <li><strong>Cultural authenticity strengthens faith:</strong> Islamic practice is stronger when rooted in local cultural understanding</li>
            <li><strong>Literacy democratizes knowledge:</strong> Written vernacular languages break down elite knowledge barriers</li>
          </ul>
          
          <h4>Kanté's Innovation Within Tradition</h4>
          <p>Solomana Kanté emerged directly from this tradition. His father was a renowned <em>kàramɔ́ɔ</em> (Quranic teacher) whose innovative teaching methods attracted students from across West Africa. Kanté himself was deeply educated in Arabic and the Islamic sciences.</p>
          
          <p>However, Kanté's approach differed from his predecessors in crucial ways:</p>
          <ul>
            <li><strong>Script Innovation:</strong> Rather than adapting Arabic script, he created an entirely new writing system</li>
            <li><strong>Phonetic Precision:</strong> N'Ko was designed specifically for Manding phonetic features (tone, vowel length, nasalization)</li>
            <li><strong>Pan-African Vision:</strong> He saw N'Ko as potentially serving all African languages</li>
            <li><strong>Modern Context:</strong> He responded to 20th-century challenges including colonialism and Islamic reform movements</li>
          </ul>
          
          <h4>The Intellectual Courage of the Tradition</h4>
          <p>What makes this tradition remarkable is its intellectual courage. These scholars challenged the assumption that Islamic knowledge required Arabic language mastery. They argued that <em>understanding</em> rather than <em>linguistic form</em> was the essence of Islamic practice.</p>
          
          <blockquote class="scholarly-insight">
            <p>"In his reflection on the Manding language and his interest for its different regional varieties, in his quest for a perfectly adequate vocabulary to express theological, philosophical, logic or linguistic concepts, by strongly distinguishing between Islam and Arabness, [Kanté] was pursuing preoccupations and manifesting points of view well anchored amongst clerics."</p>
            <cite>— Tal Tamari, Islamic Education Scholar</cite>
          </blockquote>
        `,
        nkoText: "ߊߖߊߡߌ ߞߊ߬ ߒߞߏ ߘߊߡߌ߬ߣߊ߬ ߞߊ߬ߙߊ߲ ߞߍ߫ ߟߊ߫",
        latinTransliteration: "Ajami ka N'ko damina karan kɛ la",
        englishTranslation: "Ajami paved the way for N'Ko learning",
        pronunciation: "[àʒàmì ká ŋ̀kó dàmìnà kàrán kɛ̀ là]",
        audioPrompt: "Academic, scholarly tone emphasizing historical continuity and intellectual tradition",
        exercises: [
          {
            type: "analytical-thinking",
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
          },
          {
            type: "historical-context",
            question: "Why is the phrase 'skin color cannot be the cause of stupidity or ignorance' significant in this tradition?",
            explanation: "This quote from Amadu Bamba explicitly challenges racist assumptions about African intellectual capacity—a theme that runs through the entire Afro-Muslim vernacular tradition and directly influenced Kanté's motivation.",
            difficulty: "hard"
          }
        ]
      },
      
      {
        title: "The Islamic Sphere and Educational Reform: Kanté's Historical Moment",
        order: 2,
        duration: 15,
        content: `
          <h3>Post-World War II Islamic Educational Ferment</h3>
          <p>Solomana Kanté's invention of N'Ko in 1949 occurred during a period of intense debate and experimentation within West African Muslim communities. The aftermath of World War II had disrupted traditional authorities and created space for new voices in Islamic education.</p>
          
          <h4>The Madrasa Movement: Kanté's Intellectual Rivals</h4>
          <p>At the same time Kanté was developing N'Ko, other West African Muslim reformers were establishing <strong>madrasas</strong>—modernist Muslim schools that used Arabic as the medium of instruction while following Western-style curricula and teaching methods.</p>
          
          <div class="madrasa-movement-analysis">
            <h5>The Madrasa Philosophy:</h5>
            <ul>
              <li><strong>Arabic supremacy:</strong> Believed Arabic was the only appropriate language for serious Islamic education</li>
              <li><strong>Rationalist approach:</strong> Emphasized direct textual interpretation without traditional intermediaries</li>
              <li><strong>Modernist integration:</strong> Prepared students for participation in the modern economy while maintaining Islamic identity</li>
              <li><strong>Anti-traditional:</strong> Challenged the authority of traditional Quranic school teachers</li>
            </ul>
            
            <h5>Kanté's Response:</h5>
            <p>Kanté explicitly positioned N'Ko as an alternative to the madrasa movement's Arabic-centric approach. He argued:</p>
            <blockquote>
              <p>"Where we are from, most people who master the Arabic language are religious fanatics, they only want to write in Arabic about religious affairs, and anything that is written on other things is considered by them as paganism."</p>
            </blockquote>
          </div>
          
          <h4>The Bouaké Encounter: Racism and Islamic Reform Intersect</h4>
          <p>The famous story of Kanté encountering Kamal Marwa's racist tract in Bouaké marketplace takes on deeper meaning when we understand that Bouaké was a center of the madrasa movement. Kanté was living among Muslim reformers debating the future of Islamic education when he encountered claims about African intellectual inferiority.</p>
          
          <div class="bouake-context">
            <h5>What Really Happened in Bouaké:</h5>
            <p>Kanté encountered a book by Lebanese author Kamal Marwa claiming:</p>
            <ul>
              <li>African languages cannot be written</li>
              <li>They lack proper grammar</li>
              <li>They are mere "dialects" unworthy of intellectual attention</li>
              <li>Teaching Europeans languages to Africans is easier than teaching Africans their own languages</li>
            </ul>
            
            <p>This wasn't just personal insult—it was a direct challenge to the entire Afro-Muslim vernacular tradition and the debates happening around him about language-in-education.</p>
          </div>
          
          <h4>Kanté's Dual Response: Islamic and Cultural</h4>
          <p>Kanté's development of N'Ko was simultaneously:</p>
          
          <div class="dual-response-framework">
            <div class="islamic-response">
              <h5>Islamic Educational Response:</h5>
              <ul>
                <li><strong>Democratic access:</strong> Like madrasas, sought to democratize Islamic knowledge</li>
                <li><strong>Rational interpretation:</strong> Believed understanding required mother-tongue education</li>
                <li><strong>Prophetic precedent:</strong> Cited Prophet Muhammad's use of non-Arabic languages for teaching</li>
                <li><strong>Quranic justification:</strong> "We haven't sent a Prophet in any other language but the language of his people"</li>
              </ul>
            </div>
            
            <div class="cultural-response">
              <h5>Cultural Sovereignty Response:</h5>
              <ul>
                <li><strong>Intellectual equality:</strong> Proved African languages capable of sophisticated expression</li>
                <li><strong>Cultural authenticity:</strong> Rooted Islamic practice in African cultural forms</li>
                <li><strong>Pan-African vision:</strong> Saw N'Ko as model for other African language scripts</li>
                <li><strong>Anti-colonial resistance:</strong> Challenged European assumptions about African capacity</li>
              </ul>
            </div>
          </div>
          
          <h4>The Islamic Rationalist Project</h4>
          <p>Scholar Valentin Vydrin describes Kanté as "an Enlightenment-style encyclopediast" whose work paralleled rationalist movements in Islam. Like other Islamic reformers, Kanté sought:</p>
          <ul>
            <li><strong>Direct access to Islamic sources:</strong> His Quran translation eliminated need for Arabic-literate intermediaries</li>
            <li><strong>Systematic knowledge organization:</strong> He wrote over 100 books covering linguistics, history, medicine, and religion</li>
            <li><strong>Educational democratization:</strong> Made sophisticated knowledge accessible to ordinary people</li>
            <li><strong>Rational methodology:</strong> Applied systematic analysis to language, culture, and religion</li>
          </ul>
          
          <h4>The Polarized Islamic Sphere</h4>
          <p>By the 1950s, Manding Muslim society was polarized between:</p>
          <ul>
            <li><strong>Traditional Quranic educators:</strong> Saw N'Ko as threat to their authority and livelihood</li>
            <li><strong>Madrasa reformers:</strong> Viewed vernacular education as backward and un-Islamic</li>
            <li><strong>N'Ko advocates:</strong> Believed mother-tongue Islamic education was both more effective and more authentic</li>
          </ul>
          
          <p>Kanté navigated this polarization by positioning N'Ko as a third way—neither traditional nor Arabist, but authentically African and genuinely Islamic.</p>
        `,
        nkoText: "ߡߊ߬ߘߙߊߛߊ ߣߌ߫ ߒߞߏ ߟߎ߫ ߕߘߍ߬ ߦߋ߫ ߞߊ߬ߙߊ߲ ߘߐߞߍ߫ ߟߊ߫",
        latinTransliteration: "Madarasa ni N'ko lu tɛnde ye karan dokɛ la",
        englishTranslation: "Madrasas and N'Ko were both educational innovations",
        pronunciation: "[màdàràsà nì ŋ̀kó lù tɛ̀ndè jé kàrán dòkɛ̀ là]",
        audioPrompt: "Analytical, academic tone discussing intellectual debates and educational reform movements",
        exercises: [
          {
            type: "comparative-analysis",
            question: "Compare the madrasa movement and N'Ko approaches to Islamic education:",
            framework: {
              "Language policy": "Madrasas: Arabic supremacy vs N'Ko: Mother-tongue primacy",
              "Traditional authority": "Madrasas: Reject traditional teachers vs N'Ko: Reform traditional methods",
              "Cultural stance": "Madrasas: Pan-Islamic identity vs N'Ko: Afro-Islamic identity"
            },
            explanation: "Both were reformist but took opposite approaches to language and cultural identity within Islamic education.",
            difficulty: "hard"
          },
          {
            type: "contextual-understanding",
            question: "Why was Bouaké significant as the location of Kanté's encounter with Marwa's book?",
            answer: "Bouaké was a center of the madrasa movement, meaning Kanté was surrounded by Islamic educational debates when he encountered racist claims about African intellectual capacity.",
            difficulty: "medium"
          }
        ]
      },
      
      {
        title: "N'Ko as 'Social Orthography of Identity': Cultural and Political Dimensions",
        order: 3,
        duration: 12,
        content: `
          <h3>Beyond Script: N'Ko as Symbol and Movement</h3>
          <p>Scholar Christopher Wyrod coined the term "social orthography of identity" to describe how N'Ko functions far beyond its technical role as a writing system. N'Ko has become a powerful symbol of Mande cultural identity, intellectual capability, and cultural sovereignty.</p>
          
          <h4>The Competitive Success Story</h4>
          <p>N'Ko presents a rare case of an indigenous script successfully competing against older, better-financed, and institutionally supported writing systems. Consider the odds N'Ko faced:</p>
          
          <div class="competitive-landscape">
            <h5>Established Competitors:</h5>
            <ul>
              <li><strong>Arabic script:</strong> 1300+ years in West Africa, religiously sanctioned, traditional scholarly prestige</li>
              <li><strong>Latin script:</strong> Colonial government support, modern educational systems, international commerce</li>
              <li><strong>French language:</strong> Official status, economic advancement opportunities, administrative power</li>
            </ul>
            
            <h5>N'Ko's Advantages:</h5>
            <ul>
              <li><strong>Linguistic precision:</strong> Designed specifically for Manding phonetic features</li>
              <li><strong>Cultural resonance:</strong> Symbolizes African intellectual independence</li>
              <li><strong>Educational effectiveness:</strong> Dramatically higher literacy success rates</li>
              <li><strong>Community ownership:</strong> Grassroots movement with deep local support</li>
            </ul>
          </div>
          
          <h4>The Identity Formation Process</h4>
          <p>N'Ko's role in Mande identity formation operates on multiple levels:</p>
          
          <div class="identity-levels">
            <h5>1. Individual Level: Personal Empowerment</h5>
            <ul>
              <li>Adults who struggled with Arabic or French find N'Ko remarkably easy to learn</li>
              <li>Literacy in one's mother tongue provides psychological validation</li>
              <li>Writing in N'Ko connects individuals to cultural heritage</li>
              <li>N'Ko literacy becomes marker of cultural authenticity</li>
            </ul>
            
            <h5>2. Community Level: Cultural Preservation</h5>
            <ul>
              <li>N'Ko enables recording of oral histories and traditions</li>
              <li>Traditional knowledge (medicine, agriculture, crafts) is documented</li>
              <li>Religious practices are explained in culturally relevant terms</li>
              <li>Community narratives are preserved for future generations</li>
            </ul>
            
            <h5>3. Ethnic Level: Mande Unity and Pride</h5>
            <ul>
              <li>N'Ko transcends national borders, uniting Mande speakers across countries</li>
              <li>Shared script creates sense of pan-Mande identity</li>
              <li>N'Ko literature celebrates Mande historical achievements</li>
              <li>Script becomes symbol of Mande intellectual sophistication</li>
            </ul>
            
            <h5>4. Continental Level: African Renaissance</h5>
            <ul>
              <li>N'Ko serves as proof of African intellectual capability</li>
              <li>Inspires other African language script development projects</li>
              <li>Challenges assumptions about African "oral" vs "literate" cultures</li>
              <li>Contributes to broader African cultural renaissance movements</li>
            </ul>
          </div>
          
          <h4>The Literary Explosion</h4>
          <p>One of N'Ko's most remarkable achievements is the literary tradition it has generated. Scholars note that N'Ko practitioners today produce more printed text annually than all official state-backed Latin orthographies for Manding languages combined.</p>
          
          <div class="literary-genres">
            <h5>N'Ko Literary Production:</h5>
            <ul>
              <li><strong>Historical chronicles:</strong> Mande empire histories, genealogies, cultural narratives</li>
              <li><strong>Religious texts:</strong> Quran translations, Islamic commentaries, prayer books</li>
              <li><strong>Educational materials:</strong> Textbooks, literacy primers, reference works</li>
              <li><strong>Creative literature:</strong> Poetry, fiction, modern adaptations of traditional stories</li>
              <li><strong>Technical works:</strong> Medical texts, agricultural manuals, linguistic studies</li>
              <li><strong>Contemporary media:</strong> Newspapers, magazines, digital content</li>
            </ul>
          </div>
          
          <h4>The Political Dimension: Cultural Sovereignty</h4>
          <p>N'Ko's political significance extends beyond cultural pride to assertions of intellectual and cultural sovereignty:</p>
          
          <div class="political-implications">
            <h5>Challenging Colonial Assumptions:</h5>
            <ul>
              <li>Disproves claims about African intellectual inferiority</li>
              <li>Demonstrates African languages' capacity for sophisticated expression</li>
              <li>Shows indigenous knowledge systems can compete with imported ones</li>
              <li>Asserts right to education in mother tongue</li>
            </ul>
            
            <h5>Modern Nation-State Tensions:</h5>
            <ul>
              <li>N'Ko's trans-national character challenges colonial borders</li>
              <li>Mande cultural unity transcends Mali, Guinea, Burkina Faso, Ivory Coast boundaries</li>
              <li>Vernacular literacy movements challenge state language policies</li>
              <li>N'Ko represents alternative to both Arabic and European language hegemony</li>
            </ul>
          </div>
          
          <h4>The Double-Edged Nature of Identity</h4>
          <p>While N'Ko's strong association with Mande identity provides strength, it also presents challenges:</p>
          
          <div class="identity-tensions">
            <h5>Strengths:</h5>
            <ul>
              <li>Deep community investment and ownership</li>
              <li>Strong motivation for learning and preservation</li>
              <li>Cultural authenticity and relevance</li>
              <li>Resistance to external pressures and assimilation</li>
            </ul>
            
            <h5>Challenges:</h5>
            <ul>
              <li>May limit appeal to non-Mande speakers</li>
              <li>Could reinforce ethnic divisions in multi-ethnic societies</li>
              <li>Might face resistance from state authorities promoting national unity</li>
              <li>Risk of being seen as "tribal" rather than modern/universal</li>
            </ul>
          </div>
        `,
        nkoText: "ߒߞߏ ߦߋ߫ ߡߊ߲߬ߘߋ߲߫ ߖߊ߯ߓߊߟߌ ߟߋ߬ ߘߌ߫",
        latinTransliteration: "N'ko ye Mandɛn jawbali le di",
        englishTranslation: "N'Ko is Mande identity/answer",
        pronunciation: "[ŋ̀kó jé màndɛ̀n ʒàwbàlì lé dì]",
        audioPrompt: "Proud, confident tone emphasizing cultural identity and achievement",
        exercises: [
          {
            type: "analysis-synthesis",
            question: "Why is N'Ko's competitive success against Arabic and Latin scripts remarkable?",
            factors: [
              "Faced established scripts with institutional support",
              "Had no government backing or official status",
              "Competed against scripts linked to economic/religious power",
              "Succeeded through grassroots community adoption"
            ],
            explanation: "N'Ko's success demonstrates the power of cultural authenticity and linguistic precision over institutional advantage.",
            difficulty: "medium"
          },
          {
            type: "critical-thinking",
            question: "How does N'Ko function as both unifying and potentially divisive force?",
            paradox: "Unifies Mande speakers across national boundaries while potentially creating ethnic boundaries with non-Mande groups",
            difficulty: "hard"
          }
        ]
      },
      
      {
        title: "Re-Inventing Oral Tradition: N'Ko and the Modern Epic",
        order: 4,
        duration: 12,
        content: `
          <h3>From Spoken Word to Written Heritage</h3>
          <p>Scholar Dianne White Oyler's research reveals how N'Ko has enabled a remarkable transformation: the "re-invention of oral tradition" for the modern era. Traditional Mande oral narratives, genealogies, and historical accounts are being systematically recorded, preserved, and revitalized through N'Ko literacy.</p>
          
          <h4>The Oral-Literate Bridge</h4>
          <p>Mande societies have maintained sophisticated oral traditions for over a millennium, including:</p>
          
          <div class="oral-traditions">
            <h5>Traditional Oral Genres:</h5>
            <ul>
              <li><strong>Epic narratives:</strong> Sundiata epic, other founding stories</li>
              <li><strong>Historical chronicles:</strong> Dynasty lists, migration narratives, war accounts</li>
              <li><strong>Genealogical recitations:</strong> Family lineages, clan relationships</li>
              <li><strong>Praise poetry:</strong> Royal praise, professional accomplishments</li>
              <li><strong>Proverbial wisdom:</strong> Moral teachings, practical knowledge</li>
              <li><strong>Technical knowledge:</strong> Agricultural cycles, medical practices, craft techniques</li>
            </ul>
            
            <h5>The Griot Tradition:</h5>
            <p>Traditional knowledge preservation was the responsibility of <em>jalilu</em> (griots)—hereditary oral historians, musicians, and praise singers who:</p>
            <ul>
              <li>Memorized vast amounts of historical and genealogical information</li>
              <li>Performed these narratives in musical/poetic form</li>
              <li>Served as living libraries for their communities</li>
              <li>Transmitted knowledge through apprenticeship systems</li>
            </ul>
          </div>
          
          <h4>The Crisis of Oral Transmission</h4>
          <p>By the 20th century, the traditional oral transmission system faced unprecedented challenges:</p>
          
          <div class="transmission-crisis">
            <h5>Modern Pressures:</h5>
            <ul>
              <li><strong>Urbanization:</strong> Young people migrating to cities, away from traditional teachers</li>
              <li><strong>Education systems:</strong> Colonial schools devaluing traditional knowledge</li>
              <li><strong>Economic changes:</strong> Traditional patronage systems breaking down</li>
              <li><strong>Cultural pressure:</strong> Modern lifestyles leaving less time for traditional learning</li>
              <li><strong>Generational gaps:</strong> Reduced interest among youth in traditional roles</li>
            </ul>
            
            <h5>Risk of Loss:</h5>
            <p>Scholars and community leaders recognized that centuries of accumulated knowledge could be lost within a generation if not preserved in written form.</p>
          </div>
          
          <h4>N'Ko as Preservation Technology</h4>
          <p>N'Ko provided the technological and cultural bridge needed to preserve oral traditions while maintaining their authenticity:</p>
          
          <div class="preservation-advantages">
            <h5>Technical Advantages:</h5>
            <ul>
              <li><strong>Phonetic accuracy:</strong> N'Ko captures subtle linguistic features (tone, length, nasalization) crucial to oral performance</li>
              <li><strong>Cultural authenticity:</strong> Uses indigenous script rather than colonial languages</li>
              <li><strong>Accessibility:</strong> Community members can learn to read their own traditions</li>
              <li><strong>Portability:</strong> Written texts can travel beyond original communities</li>
            </ul>
            
            <h5>Cultural Advantages:</h5>
            <ul>
              <li><strong>Respect for tradition:</strong> Preservation effort shows value for ancestral knowledge</li>
              <li><strong>Community ownership:</strong> Local communities control the recording process</li>
              <li><strong>Intergenerational transmission:</strong> Enables parents to teach children traditional knowledge</li>
              <li><strong>Cultural pride:</strong> Seeing traditions in sophisticated written form enhances their prestige</li>
            </ul>
          </div>
          
          <h4>The New Literary Tradition</h4>
          <p>N'Ko has enabled not just preservation but creative adaptation of oral traditions:</p>
          
          <div class="literary-innovation">
            <h5>Preservation Projects:</h5>
            <ul>
              <li><strong>Historical documentation:</strong> Recording traditional versions of major historical events</li>
              <li><strong>Genealogical projects:</strong> Writing down family and clan histories</li>
              <li><strong>Cultural encyclopedias:</strong> Comprehensive recording of traditional practices</li>
              <li><strong>Language documentation:</strong> Preserving regional dialects and specialized vocabularies</li>
            </ul>
            
            <h5>Creative Adaptations:</h5>
            <ul>
              <li><strong>Modern epics:</strong> New narrative works using traditional epic structures</li>
              <li><strong>Contemporary praise poetry:</strong> Adapting traditional forms for modern subjects</li>
              <li><strong>Educational literature:</strong> Using traditional narrative styles to teach modern subjects</li>
              <li><strong>Cultural journalism:</strong> Reporting contemporary events using traditional narrative frameworks</li>
            </ul>
          </div>
          
          <h4>Kanté's Own Historical Project</h4>
          <p>Solomana Kanté himself exemplified this re-invention of oral tradition. His historical writings demonstrate sophisticated methodology:</p>
          
          <div class="kante-methodology">
            <h5>Historical Research Approach:</h5>
            <ul>
              <li><strong>Source collection:</strong> Gathered oral accounts from multiple elderly informants</li>
              <li><strong>Cross-verification:</strong> Compared versions from different regions and families</li>
              <li><strong>Critical analysis:</strong> Evaluated reliability and consistency of different accounts</li>
              <li><strong>Systematic organization:</strong> Arranged historical materials chronologically and thematically</li>
            </ul>
            
            <h5>Major Historical Works:</h5>
            <ul>
              <li><em>Manden Dabalo</em> - Comprehensive history of the Mali Empire</li>
              <li><em>Manden Kurfaba</em> - Study of traditional Mande political structures</li>
              <li>Genealogical works documenting major Mande families and clans</li>
              <li>Cultural studies explaining traditional practices and beliefs</li>
            </ul>
          </div>
          
          <h4>Impact on Cultural Transmission</h4>
          <p>The N'Ko preservation movement has transformed how Mande communities relate to their cultural heritage:</p>
          
          <div class="cultural-transformation">
            <h5>Educational Revolution:</h5>
            <ul>
              <li>Children can now learn traditional stories by reading as well as listening</li>
              <li>Cultural knowledge becomes accessible to wider community</li>
              <li>Traditional learning becomes compatible with modern literacy</li>
              <li>Cultural education can happen in formal school settings</li>
            </ul>
            
            <h5>Intergenerational Dialogue:</h5>
            <ul>
              <li>Written traditions facilitate conversation between elders and youth</li>
              <li>Young people gain new appreciation for traditional knowledge</li>
              <li>Elders see their knowledge valued and preserved</li>
              <li>Cultural transmission becomes more systematic and comprehensive</li>
            </ul>
          </div>
          
          <h4>Global Implications</h4>
          <p>The N'Ko model of preserving oral traditions has implications far beyond Mande communities:</p>
          <ul>
            <li><strong>Indigenous rights:</strong> Demonstrates communities' rights to preserve culture in their own languages</li>
            <li><strong>Cultural diversity:</strong> Shows how written and oral traditions can complement rather than compete</li>
            <li><strong>Educational methodology:</strong> Provides model for culturally relevant literacy programs</li>
            <li><strong>Digital preservation:</strong> Traditional oral knowledge can be preserved using modern technology</li>
          </ul>
        `,
        nkoText: "ߒߞߏ ߞߊ߬ ߞߘߐߝߐߦߊ ߟߊߞߍ߬ߙߍ߲߬ ߛߓߍߛߎ߲ ߘߐ߫",
        latinTransliteration: "N'ko ka kɛnodofɔya lakɛrɛn sɛbɛsi do",
        englishTranslation: "N'Ko preserves oral tradition in writing",
        pronunciation: "[ŋ̀kó ká kɛ̀nòdòfɔ̀jà làkɛ̀rɛ̀n sɛ̀bɛ̀sì dò]",
        audioPrompt: "Reverent, cultural preservation tone emphasizing the bridge between oral and written traditions",
        exercises: [
          {
            type: "cultural-analysis",
            question: "How does N'Ko solve the crisis of oral tradition transmission in modern times?",
            solution_framework: {
              "Technical": "Accurate phonetic representation preserves oral features",
              "Cultural": "Indigenous script maintains cultural authenticity", 
              "Social": "Community ownership ensures relevant preservation",
              "Educational": "Written form enables systematic teaching"
            },
            difficulty: "hard"
          },
          {
            type: "comparative-understanding",
            question: "Compare the role of griots in traditional society vs N'Ko in modern society:",
            comparison: {
              "Knowledge storage": "Griots: human memory vs N'Ko: written texts",
              "Access": "Griots: limited to specific families vs N'Ko: community-wide",
              "Transmission": "Griots: oral apprenticeship vs N'Ko: literate education"
            },
            difficulty: "medium"
          }
        ]
      },
      
      {
        title: "Contemporary Significance and Future Implications",
        order: 5,
        duration: 18,
        content: `
          <h3>N'Ko in the 21st Century: Digital Renaissance and Global Reach</h3>
          <p>Today, more than 75 years after its creation, N'Ko continues to evolve and expand, demonstrating remarkable vitality and adaptability. Contemporary developments reveal N'Ko's potential as a model for indigenous script revitalization and cultural sovereignty movements worldwide.</p>
          
          <h4>Digital Age Adaptation</h4>
          <p>N'Ko's integration into digital technologies has accelerated its growth and global reach:</p>
          
          <div class="digital-developments">
            <h5>Technological Milestones:</h5>
            <ul>
              <li><strong>Unicode Integration (2006):</strong> N'Ko officially entered Unicode 5.0, ensuring global digital compatibility</li>
              <li><strong>Font Development:</strong> Professional N'Ko fonts enable high-quality publishing and display</li>
              <li><strong>Input Methods:</strong> Keyboard layouts available for all major operating systems</li>
              <li><strong>Mobile Technology:</strong> N'Ko keyboards and apps for smartphones and tablets</li>
              <li><strong>Web Presence:</strong> Growing number of N'Ko websites, social media content, and online resources</li>
            </ul>
            
            <h5>Digital Publishing Revolution:</h5>
            <ul>
              <li><strong>Desktop Publishing:</strong> Community members can now produce professional-quality N'Ko publications</li>
              <li><strong>Online Libraries:</strong> Digital archives of N'Ko texts accessible worldwide</li>
              <li><strong>E-books and Digital Media:</strong> Modern distribution methods for N'Ko literature</li>
              <li><strong>Educational Software:</strong> Interactive N'Ko learning programs and games</li>
            </ul>
          </div>
          
          <h4>Educational Institutionalization</h4>
          <p>N'Ko is increasingly being integrated into formal educational systems, representing a significant shift from its grassroots origins:</p>
          
          <div class="educational-integration">
            <h5>Formal Recognition:</h5>
            <ul>
              <li><strong>Guinea:</strong> N'Ko recognized as national script, taught in some public schools</li>
              <li><strong>Mali:</strong> Experimental N'Ko education programs in selected regions</li>
              <li><strong>International Universities:</strong> N'Ko courses offered in academic institutions worldwide</li>
              <li><strong>Research Centers:</strong> Academic centers dedicated to N'Ko and Mande studies</li>
            </ul>
            
            <h5>Pedagogical Innovations:</h5>
            <ul>
              <li><strong>Mother-tongue Education:</strong> N'Ko used as medium of instruction for other subjects</li>
              <li><strong>Bilingual Programs:</strong> Integration with French/English education systems</li>
              <li><strong>Adult Literacy:</strong> Highly successful adult education programs using N'Ko</li>
              <li><strong>Teacher Training:</strong> Professional development programs for N'Ko educators</li>
            </ul>
          </div>
          
          <h4>Global Diaspora Networks</h4>
          <p>N'Ko has become a unifying force for Mande diaspora communities worldwide:</p>
          
          <div class="diaspora-networks">
            <h5>Geographic Spread:</h5>
            <ul>
              <li><strong>Europe:</strong> Active N'Ko communities in France, Belgium, Spain, UK</li>
              <li><strong>North America:</strong> Growing N'Ko groups in USA and Canada</li>
              <li><strong>Middle East:</strong> Mande migrant workers maintaining N'Ko literacy</li>
              <li><strong>Asia:</strong> Small but dedicated N'Ko communities in China and other Asian countries</li>
            </ul>
            
            <h5>Diaspora Functions:</h5>
            <ul>
              <li><strong>Cultural Maintenance:</strong> Preserving Mande identity in foreign countries</li>
              <li><strong>Intergenerational Transmission:</strong> Teaching N'Ko to children born abroad</li>
              <li><strong>Transnational Networks:</strong> Connecting Mande communities across continents</li>
              <li><strong>Cultural Diplomacy:</strong> Representing Mande culture in international contexts</li>
            </ul>
          </div>
          
          <h4>Academic and Scholarly Recognition</h4>
          <p>N'Ko has gained significant recognition in academic circles, contributing to broader scholarly discussions:</p>
          
          <div class="scholarly-recognition">
            <h5>Research Fields:</h5>
            <ul>
              <li><strong>African Studies:</strong> N'Ko as case study in African intellectual achievement</li>
              <li><strong>Linguistics:</strong> Script design and language adaptation studies</li>
              <li><strong>Education:</strong> Mother-tongue education and literacy research</li>
              <li><strong>Islamic Studies:</strong> Vernacular Islamic traditions and Ajami scholarship</li>
              <li><strong>Digital Humanities:</strong> Script digitization and preservation projects</li>
            </ul>
            
            <h5>Scholarly Publications:</h5>
            <ul>
              <li>Peer-reviewed articles in major academic journals</li>
              <li>Doctoral dissertations and academic theses</li>
              <li>Conference presentations at international venues</li>
              <li>Collaborative research projects with African institutions</li>
            </ul>
          </div>
          
          <h4>Contemporary Challenges and Opportunities</h4>
          <p>N'Ko faces both challenges and opportunities in the contemporary global context:</p>
          
          <div class="challenges-opportunities">
            <h5>Challenges:</h5>
            <ul>
              <li><strong>Government Resistance:</strong> Some states view N'Ko as threat to national unity</li>
              <li><strong>Economic Pressures:</strong> Limited economic incentives for N'Ko literacy</li>
              <li><strong>Educational Competition:</strong> Competition with international languages for educational time</li>
              <li><strong>Generational Gaps:</strong> Younger generations sometimes prefer international scripts</li>
              <li><strong>Resource Limitations:</strong> Limited funding for N'Ko educational materials and programs</li>
            </ul>
            
            <h5>Opportunities:</h5>
            <ul>
              <li><strong>Digital Revolution:</strong> Technology makes N'Ko production and distribution easier</li>
              <li><strong>Cultural Renaissance:</strong> Growing global interest in indigenous cultures and languages</li>
              <li><strong>Educational Research:</strong> Evidence supporting mother-tongue education effectiveness</li>
              <li><strong>International Support:</strong> UNESCO and other organizations supporting linguistic diversity</li>
              <li><strong>Diaspora Resources:</strong> Overseas communities providing financial and intellectual support</li>
            </ul>
          </div>
          
          <h4>N'Ko as Model for Global Indigenous Movements</h4>
          <p>N'Ko's success provides inspiration and practical lessons for other indigenous script and literacy movements:</p>
          
          <div class="global-model">
            <h5>Transferable Principles:</h5>
            <ul>
              <li><strong>Community Ownership:</strong> Grassroots control ensures cultural authenticity</li>
              <li><strong>Linguistic Precision:</strong> Scripts designed for specific languages are more effective</li>
              <li><strong>Cultural Pride:</strong> Indigenous scripts can enhance rather than threaten modern development</li>
              <li><strong>Educational Effectiveness:</strong> Mother-tongue literacy dramatically improves learning outcomes</li>
              <li><strong>Digital Adaptation:</strong> Traditional scripts can successfully adapt to modern technology</li>
            </ul>
            
            <h5>Influence on Other Movements:</h5>
            <ul>
              <li>Revival of other African scripts (Vai, Tifinagh, Ge'ez)</li>
              <li>Indigenous script movements in Asia and Americas</li>
              <li>Academic interest in script creation and language revitalization</li>
              <li>UNESCO policies supporting indigenous writing systems</li>
            </ul>
          </div>
          
          <h4>Future Directions and Implications</h4>
          <p>Looking ahead, N'Ko's trajectory suggests several important developments:</p>
          
          <div class="future-implications">
            <h5>Educational Evolution:</h5>
            <ul>
              <li>Greater integration into formal education systems</li>
              <li>Development of comprehensive N'Ko curricula for all educational levels</li>
              <li>Teacher training programs and professional certification</li>
              <li>Research on N'Ko's effectiveness for STEM education</li>
            </ul>
            
            <h5>Technological Innovation:</h5>
            <ul>
              <li>Advanced N'Ko input methods and voice recognition</li>
              <li>Artificial intelligence applications for N'Ko text processing</li>
              <li>Virtual and augmented reality N'Ko learning environments</li>
              <li>Blockchain technology for preserving and authenticating N'Ko texts</li>
            </ul>
            
            <h5>Cultural and Political Impact:</h5>
            <ul>
              <li>Potential influence on language policies in West African states</li>
              <li>Role in Pan-African cultural and political movements</li>
              <li>Contribution to global discussions about linguistic rights</li>
              <li>Model for post-colonial cultural sovereignty movements</li>
            </ul>
          </div>
          
          <h4>Your Role in the N'Ko Story</h4>
          <p>As you begin your N'Ko learning journey, you become part of this remarkable story of intellectual courage, cultural preservation, and educational innovation. Whether you are:</p>
          <ul>
            <li>A heritage learner reconnecting with Mande culture</li>
            <li>A scholar studying African linguistic traditions</li>
            <li>An educator interested in mother-tongue education</li>
            <li>A global citizen supporting cultural diversity</li>
          </ul>
          
          <p>You join a movement that has proven the power of indigenous knowledge systems to compete and thrive in the modern world. Your learning contributes to the ongoing vitality of this remarkable African intellectual achievement.</p>
        `,
        nkoText: "ߒߞߏ ߦߋ߫ ߘߎ߱ ߞߎߘߊ ߣߌ߫ ߞߘߐߕߊߟߌ ߢߍ߫ ߞߘߐ ߘߐ߫",
        latinTransliteration: "N'ko ye du kunda ni kɛnodotali bɛɛ kɛndo do",
        englishTranslation: "N'Ko is in the world's future and all developments",
        pronunciation: "[ŋ̀kó jé dù kùndà nì kɛ̀nòdòtàlì bɛ̀ɛ̀ kɛ̀ndò dò]",
        audioPrompt: "Forward-looking, inspiring tone emphasizing N'Ko's continued relevance and future potential",
        exercises: [
          {
            type: "future-thinking",
            question: "How might N'Ko's success influence other indigenous script movements globally?",
            framework: {
              "Demonstration effect": "Proves indigenous scripts can compete with established systems",
              "Methodological model": "Provides template for community-based script development",
              "Educational validation": "Shows effectiveness of mother-tongue literacy approaches",
              "Digital integration": "Demonstrates successful adaptation to modern technology"
            },
            difficulty: "hard"
          },
          {
            type: "personal-reflection",
            question: "What aspects of the N'Ko story are most relevant to contemporary global challenges?",
            themes: [
              "Cultural sovereignty in globalized world",
              "Indigenous knowledge preservation",
              "Educational equity and effectiveness",
              "Technological adaptation for traditional cultures"
            ],
            difficulty: "medium"
          },
          {
            type: "synthesis-application",
            question: "How does understanding N'Ko's scholarly context change your approach to learning the script?",
            explanation: "Recognizing N'Ko's intellectual sophistication and cultural significance should motivate serious, respectful engagement with the script as part of a major African intellectual tradition.",
            difficulty: "medium"
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
          question: "How did the post-WWII madrasa movement influence Kanté's development of N'Ko?",
          options: [
            "It directly supported his work",
            "It provided the model he followed exactly",
            "It represented the Arabic-centric approach he opposed", 
            "It had no influence on his thinking"
          ],
          correctAnswer: 2,
          explanation: "The madrasa movement's emphasis on Arabic-only Islamic education represented the approach Kanté opposed with his mother-tongue education philosophy.",
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
          question: "Which Ajami tradition explicitly addressed race and cultural autonomy within Islam?",
          options: [
            "Fulani Ajami in Fuuta Jaloo",
            "Hausa Ajami in Sokoto",
            "Wolof Ajami under Amadu Bamba",
            "Manding Ajami in Kong"
          ],
          correctAnswer: 2,
          explanation: "Amadu Bamba's Wolof Ajami tradition explicitly engaged with race and cultural autonomy, stating 'skin color cannot be the cause of stupidity or ignorance.'",
          difficulty: "hard",
          points: 4
        },
        {
          question: "What was Kanté's response to traditional Quranic scholars who opposed N'Ko?",
          options: [
            "He abandoned the project",
            "He cited Prophet Muhammad's use of non-Arabic languages for teaching",
            "He agreed to use only Arabic",
            "He left Islam entirely"
          ],
          correctAnswer: 1,
          explanation: "Kanté invoked Islamic precedent, citing how Prophet Muhammad used non-Arabic speakers to teach literacy and Quranic verse about prophets speaking in their people's languages.",
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
        },
        {
          question: "What makes N'Ko's competitive success against Arabic and Latin scripts remarkable?",
          options: [
            "It had more government support",
            "It was easier to learn",
            "It succeeded despite facing established scripts with institutional backing",
            "It was promoted by foreign missionaries"
          ],
          correctAnswer: 2,
          explanation: "N'Ko succeeded as a grassroots movement against scripts with centuries of institutional support, proving the power of cultural authenticity and linguistic precision.",
          difficulty: "medium",
          points: 3
        },
        {
          question: "According to academic research, what is N'Ko's relationship to Islamic practice?",
          options: [
            "It opposes Islamic practice",
            "It represents an iteration of Islamic educational reform",
            "It is secular and non-religious",
            "It only focuses on cultural, not religious, matters"
          ],
          correctAnswer: 1,
          explanation: "Scholarly research shows N'Ko represents an Islamic educational reform movement seeking to strengthen Islamic practice through vernacular literacy.",
          difficulty: "hard",
          points: 4
        },
        {
          question: "What contemporary global implications does N'Ko's success have?",
          options: [
            "None beyond West Africa",
            "Only linguistic implications",
            "It provides a model for indigenous script and cultural sovereignty movements worldwide",
            "Only educational implications"
          ],
          correctAnswer: 2,
          explanation: "N'Ko's success demonstrates principles transferable to global indigenous movements: community ownership, linguistic precision, and cultural pride.",
          difficulty: "hard",
          points: 4
        },
        {
          question: "How does understanding N'Ko's scholarly context affect your approach to learning it?",
          options: [
            "It makes it less important to learn accurately",
            "It shows N'Ko is only for academics",
            "It reveals N'Ko as part of a major African intellectual tradition deserving serious respect",
            "It proves N'Ko is outdated"
          ],
          correctAnswer: 2,
          explanation: "Understanding N'Ko's sophisticated intellectual foundations and cultural significance should motivate serious, respectful engagement with this major African achievement.",
          difficulty: "medium",
          points: 3
        }
      ],
      passingScore: 24,
      totalPoints: 35
    },
    
    summary: `
      You have completed a scholarly exploration of N'Ko that reveals its true significance as a major African intellectual achievement. You now understand:
      
      • N'Ko's place within the centuries-old Afro-Muslim vernacular tradition
      • The complex Islamic educational reform context that shaped Kanté's innovation
      • How N'Ko functions as a "social orthography of identity" for Mande communities
      • The script's role in preserving and re-inventing oral traditions for the modern era
      • N'Ko's remarkable competitive success against established writing systems
      • Its contemporary global significance as a model for indigenous movements
      
      This foundation reveals N'Ko not as a simple writing system, but as a sophisticated response to historical challenges that continues to offer insights for contemporary global issues of cultural sovereignty, educational equity, and indigenous rights.
    `,
    
    nextSteps: [
      "Begin practical study of N'Ko characters with deep appreciation for their cultural significance",
      "Explore the actual texts and literature that embody this intellectual tradition",
      "Connect with the global N'Ko learning community that continues this tradition",
      "Consider how N'Ko's principles might apply to other cultural and educational contexts"
    ],
    
    culturalConnections: [
      "Read scholarly articles about N'Ko to deepen your academic understanding",
      "Explore digitized N'Ko manuscripts and historical texts online",
      "Learn about other African scripts and writing systems (Ge'ez, Tifinagh, Vai)",
      "Study the broader context of Islamic education and Ajami traditions in West Africa",
      "Connect with diaspora N'Ko communities and cultural organizations"
    ]
  }
};

async function seedSpecializedIntroLesson() {
  try {
    console.log('🌱 Starting specialized comprehensive N\'Ko introduction lesson seeding...');
    
    const createdLesson = await prisma.nkoLesson.create({
      data: specializedIntroLesson
    });
    
    console.log(`✅ Created specialized introduction lesson: ${createdLesson.slug}`);
    console.log('🎉 Specialized introduction lesson seeding completed successfully!');
    
    return createdLesson;
    
  } catch (error) {
    console.error('❌ Error seeding specialized introduction lesson:', error);
    throw error;
  }
}

// Run the seeding
async function main() {
  try {
    await seedSpecializedIntroLesson();
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

module.exports = { seedSpecializedIntroLesson, specializedIntroLesson }; 