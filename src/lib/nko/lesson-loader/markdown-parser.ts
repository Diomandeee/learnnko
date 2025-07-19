import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';
import remarkGfm from 'remark-gfm';

export interface LessonFrontmatter {
  id: string;
  title: string;
  description: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  module: string;
  moduleOrder: number;
  order: number;
  duration: number;
  prerequisites: string[];
  topics: string[];
}

export interface ParsedLesson {
  id: string;
  frontmatter: LessonFrontmatter;
  htmlContent: string;
  sections: {
    title: string;
    html: string;
    exercises?: {
      question: string;
      options?: string[];
      correctAnswer?: number | string;
      explanation?: string;
    }[];
  }[];
  quiz: {
    questions: {
      question: string;
      options: string[];
      correctAnswer: number;
      explanation?: string;
    }[];
  };
  summary: string;
  vocabulary: {
    nko: string;
    latin: string;
    english: string;
    french: string;
  }[];
}

export async function parseLessonMarkdown(filePath: string): Promise<ParsedLesson> {
  const fullPath = path.resolve(process.cwd(), filePath);
  const fileContents = fs.readFileSync(fullPath, 'utf8');

  // Parse frontmatter
  const { data, content } = matter(fileContents);
  const frontmatter = data as LessonFrontmatter;

  // Convert Markdown to HTML
  const processedContent = await remark()
    .use(remarkGfm) // Support tables, strikethrough, etc.
    .use(html, { sanitize: false }) // Convert markdown to HTML
    .process(content);
  
  const htmlContent = processedContent.toString();

  // Split content into sections
  const sectionRegex = /<h2>(.*?)<\/h2>([\s\S]*?)(?=<h2>|<h1>|$)/g;
  const sections: { title: string; html: string; exercises?: any[] }[] = [];
  
  let match;
  while ((match = sectionRegex.exec(htmlContent)) !== null) {
    const sectionTitle = match[1];
    const sectionContent = match[2];
    
    // Extract exercises from section content
    const exercises = extractExercises(sectionContent);
    
    sections.push({
      title: sectionTitle,
      html: sectionContent,
      exercises: exercises.length > 0 ? exercises : undefined
    });
  }

  // Extract quiz questions
  const quizSection = sections.find(section => section.title.toLowerCase().includes('quiz'));
  const quiz = quizSection ? {
    questions: extractExercises(quizSection.html)
  } : { questions: [] };

  // Extract summary
  const summarySection = sections.find(section => section.title.toLowerCase().includes('summary'));
  const summary = summarySection ? summarySection.html : '';

  // Extract vocabulary
  const vocabularySection = sections.find(section => section.title.toLowerCase().includes('vocabulary'));
  const vocabulary = vocabularySection ? extractVocabulary(vocabularySection.html) : [];

  return {
    id: frontmatter.id,
    frontmatter,
    htmlContent,
    sections,
    quiz,
    summary,
    vocabulary
  };
}

function extractExercises(html: string): any[] {
  const exerciseRegex = /<p><strong>Question:(.*?)<\/strong><\/p>([\s\S]*?)(?=<p><strong>Question:|<h|$)/g;
  const exercises = [];
  
  let match;
  while ((match = exerciseRegex.exec(html)) !== null) {
    const question = match[1].trim();
    const content = match[2];
    
    // Check if it's a multiple choice question
    const optionsMatch = content.match(/<li>\[([ x])\](.*?)<\/li>/g);
    
    if (optionsMatch) {
      const options = optionsMatch.map(option => {
        const text = option.match(/<li>\[([ x])\](.*?)<\/li>/);
        return text ? text[2].trim() : '';
      });
      
      const correctAnswerIndex = optionsMatch.findIndex(option => option.includes('[x]'));
      
      // Look for explanation
      const explanation = content.match(/<p><strong>Explanation:<\/strong>(.*?)<\/p>/);
      
      exercises.push({
        question,
        options,
        correctAnswer: correctAnswerIndex !== -1 ? correctAnswerIndex : 0,
        explanation: explanation ? explanation[1].trim() : undefined
      });
    } else {
      // It might be a fill-in-the-blank or matching question
      // Handle those cases if needed
      exercises.push({
        question,
        content
      });
    }
  }
  
  return exercises;
}

function extractVocabulary(html: string): any[] {
  const vocabulary = [];
  
  // Extract table rows
  const tableRowRegex = /<tr>([\s\S]*?)<\/tr>/g;
  let match;
  
  let isHeader = true;
  while ((match = tableRowRegex.exec(html)) !== null) {
    if (isHeader) {
      isHeader = false;
      continue; // Skip header row
    }
    
    const cellRegex = /<td>([\s\S]*?)<\/td>/g;
    const cells = [];
    
    let cellMatch;
    while ((cellMatch = cellRegex.exec(match[1])) !== null) {
      cells.push(cellMatch[1].trim());
    }
    
    if (cells.length >= 4) {
      vocabulary.push({
        nko: cells[0],
        latin: cells[1],
        english: cells[2],
        french: cells[3]
      });
    }
  }
  
  return vocabulary;
}
