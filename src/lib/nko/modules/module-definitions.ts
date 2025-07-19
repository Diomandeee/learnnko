import { getMongoDbId } from '../db/id-mapping-store';


export interface NkoModule {
  id: string;
  title: string;
  description: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  order: number;
  track: string;
  lessons: string[]; // Array of lesson IDs in this module
}

export const moduleDefinitions: NkoModule[] = [
  // Foundations Track (Beginner)
  {
    id: "intro-to-nko",
    title: "Introduction to N'Ko",
    description: "Learn about the history and basics of the N'Ko writing system",
    level: "beginner",
    order: 1,
    track: "foundations",
    lessons: [
      "nko-history",
      "writing-system-basics",
      "nko-modern-world"
    ]
  },
  {
    id: "alphabet-fundamentals",
    title: "Alphabet Fundamentals",
    description: "Master the N'Ko alphabet characters and sounds",
    level: "beginner",
    order: 2,
    track: "foundations",
    lessons: [
      "alphabet-vowels",
      "alphabet-consonants-1",
      "alphabet-consonants-2",
      "nasalized-vowels",
      "tone-marks"
    ]
  },
  {
    id: "writing-basics",
    title: "Writing Basics",
    description: "Learn proper N'Ko handwriting techniques",
    level: "beginner",
    order: 3,
    track: "foundations",
    lessons: [
      "hand-positioning",
      "letterforms",
      "digital-input",
      "connected-forms"
    ]
  },
  
  // Vocabulary Track (Beginner)
  {
    id: "essential-words",
    title: "Essential Words",
    description: "Learn fundamental vocabulary for everyday communication",
    level: "beginner",
    order: 4,
    track: "vocabulary",
    lessons: [
      "greetings-introductions",
      "numbers-counting",
      "time-expressions",
      "common-objects"
    ]
  },
  {
    id: "thematic-vocabulary-beginner",
    title: "Thematic Vocabulary",
    description: "Expand your vocabulary with themed word groups",
    level: "beginner",
    order: 5,
    track: "vocabulary",
    lessons: [
      "family-relationships",
      "food-dining",
      "travel-transportation",
      "work-education"
    ]
  }
];

export function getModuleById(id: string): NkoModule | undefined {
  return moduleDefinitions.find(module => module.id === id);
}

export function getModulesByTrack(track: string): NkoModule[] {
  return moduleDefinitions.filter(module => module.track === track);
}

export function getModulesByLevel(level: string): NkoModule[] {
  return moduleDefinitions.filter(module => module.level === level);
}

export function getLessonModuleId(lessonId: string): string | undefined {
  for (const moduleItem of moduleDefinitions) {
    if (moduleItem.lessons.includes(lessonId)) {
      return moduleItem.id;
    }
  }
  return undefined;
}

export function getNextLesson(currentLessonId: string): string | undefined {
  for (const moduleItem of moduleDefinitions) {
    const index = moduleItem.lessons.indexOf(currentLessonId);
    if (index >= 0 && index < moduleItem.lessons.length - 1) {
      return moduleItem.lessons[index + 1];
    } else if (index === moduleItem.lessons.length - 1) {
      // Last lesson in module, find first lesson in next module
      const nextModuleIndex = moduleDefinitions.findIndex(m => m.id === moduleItem.id) + 1;
      if (nextModuleIndex < moduleDefinitions.length) {
        return moduleDefinitions[nextModuleIndex].lessons[0];
      }
    }
  }
  return undefined;
}

export function getPrerequisiteLessons(lessonId: string): string[] {
  for (const moduleItem of moduleDefinitions) {
    const index = moduleItem.lessons.indexOf(lessonId);
    if (index > 0) {
      // If not first lesson in module, previous lesson is prerequisite
      return [moduleItem.lessons[index - 1]];
    } else if (index === 0) {
      // First lesson in module, check if there's a previous module
      const moduleIndex = moduleDefinitions.findIndex(m => m.id === moduleItem.id);
      if (moduleIndex > 0) {
        const prevModule = moduleDefinitions[moduleIndex - 1];
        return [prevModule.lessons[prevModule.lessons.length - 1]];
      }
    }
  }
  return [];
}

export function getLearningPath(level: string): {moduleId: string, lessonId: string}[] {
  const path: {moduleId: string, lessonId: string}[] = [];
  
  // Get all modules for the specified level
  const levelModules = moduleDefinitions
    .filter(module => module.level === level)
    .sort((a, b) => a.order - b.order);
    
  // Add all lessons from each module to the path
  for (const moduleItem of levelModules) {
    for (const lessonId of moduleItem.lessons) {
      path.push({
        moduleId: moduleItem.id,
        lessonId
      });
    }
  }
  
  return path;
}

export function getCompletionPercentage(completedLessons: string[]): number {
  // Count total lessons across all modules
  const totalLessons = moduleDefinitions.reduce(
    (total, module) => total + module.lessons.length, 
    0
  );
  
  // Calculate percentage
  return Math.round((completedLessons.length / totalLessons) * 100);
}

export function getTrackCompletionPercentage(track: string, completedLessons: string[]): number {
  // Get all lessons in this track
  const trackLessons: string[] = [];
  
  moduleDefinitions
    .filter(module => module.track === track)
    .forEach(module => {
      trackLessons.push(...module.lessons);
    });
  
  // Count completed lessons in this track
  const completedTrackLessons = completedLessons.filter(
    lessonId => trackLessons.includes(lessonId)
  );
  
  // Calculate percentage
  return trackLessons.length === 0 ? 0 : 
    Math.round((completedTrackLessons.length / trackLessons.length) * 100);
}


// Helper function to convert string ID to MongoDB ObjectID
export function getMongoDatabaseId(stringId: string): string {
  // Generate a timestamp portion (first 8 chars)
  const timestamp = Math.floor(Date.now() / 1000).toString(16).padStart(8, '0');
  
  // Generate a hash from the string ID
  let hash = 0;
  for (let i = 0; i < stringId.length; i++) {
    const char = stringId.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  
  // Create machine id portion (6 chars)
  const machineId = Math.abs(hash).toString(16).slice(0, 6).padStart(6, '0');
  
  // Create counter portion (10 chars)
  const counter = Math.floor(Math.random() * 16777216).toString(16).padStart(6, '0');
  const randomPart = Math.floor(Math.random() * 16777216).toString(16).padStart(4, '0');
  
  // Full 24-char MongoDB ObjectID
  return timestamp + machineId + counter + randomPart;
}