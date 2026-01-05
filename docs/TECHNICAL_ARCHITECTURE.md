# Organic Vocabulary Acquisition for Low-Resource African Languages: A Video-First Approach to N'Ko and Manding Language Processing

*A Technical Architecture for Continuous Learning from Educational Video Content*

---

## Abstract

This document presents a novel approach to building state-of-the-art natural language processing systems for N'Ko, Bambara, and related Manding languages spoken by approximately forty million people across West Africa. Unlike traditional corpus-driven methodologies that depend on pre-existing parallel texts such as Bible translations or government documents, we introduce a video-first organic vocabulary discovery system that extracts training data directly from educational YouTube content. The system processes video frames through multimodal optical character recognition, cross-references detections against the Ankataa dictionary containing over fifteen hundred verified entries, and expands vocabulary through AI-powered contextual generation across five distinct linguistic registers. This produces contextually-grounded training data suitable for automatic speech recognition, machine translation, and optical character recognition. The architecture currently processes content from seven N'Ko educational channels comprising nine hundred sixty-nine videos representing an estimated five hundred hours of instructional material.

---

## The Current State of Manding Language Technology

The landscape for computational processing of Manding languages remains remarkably sparse compared to high-resource languages. For automatic speech recognition, the most capable publicly available system is the RobotsMali Soloni model, a FastConformer architecture with one hundred fourteen million parameters that achieves a word error rate of forty point six percent when using its CTC decoder. This represents the current benchmark for Bambara speech recognition. The same organization's QuartzNet model, with nineteen million parameters, achieves forty-six point five percent word error rate. Both models were trained on approximately one hundred hours of Bambara audio, a fraction of the ten thousand hours typically available for English systems. Meta's Massively Multilingual Speech project includes Bambara among its eleven hundred supported languages, though specific performance benchmarks for Manding varieties remain unpublished.

Machine translation presents a similar picture of limited but growing resources. Meta's No Language Left Behind initiative, specifically the NLLB-200 distilled model with six hundred million parameters, supports Bambara translation but achieves only approximately twenty BLEU points for Bambara to French translation, trained on roughly fifty-five thousand parallel sentence pairs. The seminal contribution to N'Ko machine translation came from Doumbouya and colleagues at the 2023 Workshop on Machine Translation in Singapore. Their paper "Machine Translation for Nko: Tools, Corpora, and Baseline Results" established the first public benchmarks for N'Ko, achieving thirty point eight three chrF++ on English to N'Ko translation using the FLoRes development test set. More importantly, their work produced the nicolingua-0005 corpus containing one hundred thirty thousand parallel segments and nearly four million monolingual N'Ko words drawn from sources including Quranic texts, smartphone localization strings, dictionaries, the Guinea constitution, and scientific terminology.

The most striking gap exists in optical character recognition. There is no publicly available production-quality OCR model specifically trained for the N'Ko script. Tesseract lacks N'Ko support entirely. Google Cloud Vision may detect N'Ko text but provides no reliable transcription capability. This absence is particularly notable given that the N'Ko script, developed by Solomana Kanté in 1949, has been encoded in Unicode since 2006 and serves as the primary writing system for Manding language communities who choose indigenous rather than Latin orthography.

The Masakhane grassroots NLP community has contributed standardized benchmarks for African languages including named entity recognition with between four thousand eight hundred and eleven thousand sentences for Bambara, translation pairs ranging from fourteen hundred to nearly eight thousand sentences, and part-of-speech tagging with approximately twelve hundred sentences. These benchmarks, while valuable, remain modest compared to resources available for major world languages.

---

## Architectural Philosophy

The fundamental insight driving our architecture is that educational video content represents an underexploited source of naturally-occurring, pedagogically-structured language data. When a teacher writes N'Ko text on a whiteboard while explaining its meaning, that single video frame contains aligned multimodal information: the visual representation of the script, the audio pronunciation, and the contextual explanation. Traditional corpus collection treats text as an artifact to be gathered; we treat video as a generative process from which vocabulary emerges organically.

Our system inverts the conventional corpus-building paradigm. Rather than starting with word lists compiled by lexicographers or parallel texts curated by translators, we begin with raw video and allow vocabulary to emerge through detection. This produces vocabulary distributions reflecting actual pedagogical emphasis rather than lexicographic priorities. Words that teachers choose to explain, write clearly, and contextualize appear frequently in our corpus precisely because they are the words learners need.

The architecture operates as a continuous learning system rather than a batch processing pipeline. Detected vocabulary enters an expansion queue prioritized by source reliability and frequency. The enrichment engine processes queued items through multiple knowledge sources including the Ankataa dictionary for verified translations, community forum discussions for usage examples and cultural context, and generative AI for contextual variants when authoritative sources lack coverage. Each enrichment cycle potentially queues additional related words for future processing, creating a self-sustaining exploration of the vocabulary space.

---

## The Five-World Expansion Framework

A distinctive feature of our approach is the contextual expansion of each vocabulary entry across five linguistic registers we call "worlds." The everyday world captures casual conversational usage including greetings and market transactions. The formal world represents official and written language found in government documents and religious texts. The storytelling world draws from the griot oral tradition encompassing narratives and folktales. The proverbs world focuses on wisdom sayings following Mande proverbial patterns. The educational world provides definitions and examples suitable for language instruction.

This five-fold expansion addresses a critical limitation of low-resource language corpora: the tendency toward register imbalance. A corpus built primarily from religious texts will overrepresent formal register while underrepresenting casual speech. A corpus built from social media will exhibit the opposite bias. By explicitly generating content across all five registers for each vocabulary entry, we produce training data that captures the full range of sociolinguistic variation. A model trained on this data learns not just what words mean but how their usage shifts across contexts.

The expansion is implemented through the Gemini 2.0 Flash model using carefully designed prompts for each world. Given an N'Ko word, its Latin transliteration, and any known translation, the system generates two to three contextual variants per world along with cultural notes explaining usage patterns. This represents approximately a five-fold multiplication of raw detection data into contextually-rich training examples.

---

## From Video to Training Data

The complete transformation from raw video to model-ready training data proceeds through six stages. The acquisition stage downloads videos from configured YouTube channels at seven hundred twenty pixel quality to ensure sufficient resolution for OCR while managing storage costs. Videos upload to Google Cloud Storage for durable retention while local files are deleted after successful upload. The current configuration targets seven channels: babamamadidiane with five hundred thirty-two videos, youbouba with one hundred ninety-seven videos focused on high-quality reading content, alieulawato with ninety-seven educational videos, mamadibabadiane with fifty-eight lessons, moussadiallo with fifty-one educational videos, lonytv with ten content videos, and projetnkopourtous with five project-related videos. Checkpointing enables resumable downloads across network interruptions.

The extraction stage separates video into frames and audio segments. FFmpeg processes each video to extract keyframes, with PySceneDetect filtering to identify content changes and reduce redundant frames. The target of one hundred frames per video captures key instructional moments while limiting API costs. Audio extraction produces aligned segments based on silence detection, preserving timestamp information that will later enable audio-text alignment for speech recognition training.

The analysis stage processes extracted frames through multimodal OCR. Each frame passes to the Gemini 2.0 Flash API with instructions to detect all N'Ko script text, provide Latin transliteration, provide English translation, estimate confidence, and return bounding box coordinates. The response provides structured detection data including the N'Ko Unicode text, romanized representation, meaning, and spatial location within the frame.

The enrichment stage processes each detection through the expansion engine. The engine first normalizes the detected text and checks whether it already exists in the vocabulary database with sufficient confidence. For unknown or low-confidence words, it performs dictionary lookup against the Ankataa cache of fifteen hundred fifty-one verified entries. Dictionary matches receive high confidence and trigger queueing of related variants and synonyms for future processing. Words absent from the dictionary proceed to AI enrichment including five-world expansion. The engine maintains a priority queue ensuring that high-value words from video detections and user queries receive processing before lower-priority AI-suggested related terms.

The storage stage persists all data to Supabase PostgreSQL with triggers automating cross-referencing operations. New detections automatically link to existing vocabulary entries. Dictionary verification cascades to related words. Daily statistics track enrichment progress. The database schema centers on vocabulary entries that accumulate evidence from multiple sources: raw detections, dictionary matches, AI generations, and forum knowledge.

The export stage produces training data in formats suitable for different model training frameworks. HuggingFace JSONL format provides source-target pairs with metadata. OpenAI fine-tuning format structures data as conversation turns. Trajectory format captures the enrichment history of each word for systems that can leverage provenance information.

---

## Training Strategy for Multiple Modalities

The data produced by our pipeline supports training across four complementary model types. For automatic speech recognition, we plan to fine-tune either the RobotsMali Soloni model or OpenAI Whisper Large V3 on video-extracted audio aligned with OCR-derived transcripts. The approach begins with pseudo-labeling using existing models, followed by manual correction of a subset of high-value samples, then iterative fine-tuning with model-in-the-loop labeling. The target is to reduce word error rate below twenty-five percent, a meaningful improvement from the current forty percent baseline.

For machine translation, we fine-tune the NLLB-200 distilled model bidirectionally across N'Ko, English, and French. The training corpus combines the existing nicolingua seed of one hundred thirty thousand segments, Ankataa dictionary pairs multiplied by available translations, five-world expansions estimated at five times the base vocabulary, and video-extracted translations with their contextual information. The target corpus size is five hundred thousand parallel pairs with a target BLEU score exceeding thirty points.

For optical character recognition, we train a custom CNN encoder with transformer decoder architecture from scratch on video frames with detected N'Ko text. The Gemini OCR output provides initial labels subject to human verification for high-frequency words. Synthetic data augmentation varies fonts and adds noise to increase robustness. The target is character accuracy exceeding ninety-five percent. This model would be the first publicly available production-quality N'Ko OCR system.

For conversational applications, we instruction-tune a sequence-to-sequence model such as T5 or mBART on question-answering pairs derived from forum discussions, grammar explanations synthesized from dictionary data, and cultural context from five-world expansions. The target is seventy percent accuracy on a held-out question-answering benchmark.

---

## Conceptual Foundations

The mathematical intuition underlying our system can be understood through several conceptual frameworks without requiring formal notation.

Consider the vocabulary as a network where each word is a node and relationships between words form edges. The system grows this network through discovery and expansion. When OCR detects a new N'Ko word in a video frame, it creates a new node with whatever information the detection provided. When dictionary lookup finds a match, the node gains confidence and new edges form connecting it to variants and synonyms, which themselves become nodes awaiting their own expansion. When AI generates contextual variants, it creates potential new nodes and edges representing contextual relationships. Over time, the network becomes denser. Well-known words accumulate many connections while rare words have fewer. This density reflects actual language structure where common words participate in more expressions and contexts than specialized terms.

Confidence flows through this network based on evidence quality. Dictionary-verified translations start at high confidence. Multiple independent detections of the same word increase confidence. AI-generated translations start at medium confidence. Single detections without dictionary match remain uncertain. When a word gains dictionary verification, this confidence can propagate to related words through their connecting edges. If we verify that one word means "small" and we know another word is its augmentative variant, the variant inherits some confidence even before its own direct verification.

Quality measurement ensures training data meets model requirements. Coverage measures what percentage of the estimated thirty to fifty thousand commonly-used N'Ko words our system has discovered and documented. Depth measures how much we know about each word through the average number of relationships per word including translations, variants, contextual examples, and audio pronunciations. Balance ensures proportional representation across all five worlds, preventing models from performing well on common contexts while failing on rare ones. Verification rate tracks the percentage of vocabulary confirmed by dictionary lookup versus AI generation alone.

Training models requires measuring how wrong predictions are. Translation loss measures semantic distance between predicted and correct translations. Words close in meaning produce small errors while semantically distant predictions produce large errors. OCR loss measures likelihood assigned to the correct character sequence, penalizing both wrong characters and wrong sequence lengths. Speech recognition loss measures alignment errors between audio and text through an intermediate phoneme representation, penalizing misheard sounds, missed sounds, and hallucinated sounds.

---

## Current Status and Trajectory

The system currently operates in the data collection phase. Pipeline infrastructure has been deployed to a DigitalOcean droplet running Docker containers for enrichment, extraction, and forum scraping services. Nine hundred sixty-nine videos have been identified across seven channels. Google Cloud Storage has been configured as the durable video repository. The download pipeline is actively transferring videos to cloud storage using authenticated requests to bypass rate limiting, with checkpointing enabling resumption across interruptions.

Upon completion of video acquisition, the corpus building phase will process all frames through OCR, run dictionary enrichment for all detections, generate five-world expansions for verified vocabulary, integrate forum knowledge from the Ankataa Discourse community, export training datasets in all required formats, and validate quality metrics before proceeding.

The model training phase will fine-tune ASR on video audio, fine-tune MT on the parallel corpus, train OCR from scratch on labeled frames, instruction-tune the conversational model, and evaluate against established benchmarks.

Production deployment will optimize models through quantization and distillation, deploy APIs through serverless infrastructure, integrate with the frontend application, establish continuous learning from new video content, and implement user feedback loops for ongoing improvement.

---

## Significance

This work addresses a fundamental inequity in language technology. The forty million speakers of Manding languages deserve computational tools comparable to those available for major world languages. By treating educational video as the primary knowledge source rather than an afterthought, we tap into the natural pedagogy of language instruction. Teachers already know which words matter, how to explain them, and how to contextualize them. Our system simply captures and structures this expertise at scale.

The video-first approach is replicable. Any language community producing educational content on YouTube can apply these methods. The five-world expansion framework generalizes across languages by adapting the register categories to local sociolinguistic patterns. The continuous learning architecture enables ongoing improvement as more content becomes available.

We anticipate that models trained on our corpus will establish new benchmarks for N'Ko and Bambara processing. More importantly, we hope this work demonstrates that the scarcity of low-resource language data is not an inherent limitation but a consequence of methodological assumptions that privilege text over video and curation over discovery.

---

## References

Doumbouya, M., et al. Machine Translation for Nko: Tools, Corpora, and Baseline Results. Proceedings of the Eighth Conference on Machine Translation, 2023.

nicolingua-0005 corpus. GitHub repository. github.com/mdoumbouya/nicolingua-0005-nqo-nmt-resources

RobotsMali ASR models. HuggingFace repository. huggingface.co/RobotsMali

Costa-jussà, M.R., et al. No Language Left Behind: Scaling Human-Centered Machine Translation. arXiv preprint arXiv:2207.04672, 2022.

Masakhane NLP community. masakhane.io

N'Ko Script Reference. W3C Internationalization. w3c.github.io/afrlreq/nko

---

*Document Version 1.0. December 2024.*
