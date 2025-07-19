"use client"

import React, { createContext, useContext, useState, useEffect } from 'react';
import { getMongoDatabaseId } from '@/lib/nko/modules/module-definitions';

interface LessonProgress {
  currentSection: number;
  sectionsCompleted: boolean[];
  quizAnswers: number[];
  quizCompleted: boolean;
  lessonCompleted: boolean;
  overallProgress: number;
  lessonId: string;
  mongoLessonId: string; // MongoDB compatible ID
}

interface LessonContextType {
  progress: LessonProgress;
  goToNextSection: () => void;
  goToPreviousSection: () => void;
  goToSection: (sectionIndex: number) => void;
  updateSectionProgress: (sectionIndex: number, completed: boolean) => void;
  updateQuizAnswer: (questionIndex: number, answerIndex: number) => void;
  completeQuiz: () => void;
  completeLesson: () => void;
  saveProgress: () => Promise<void>;
}

const LessonContext = createContext<LessonContextType | undefined>(undefined);

interface LessonProviderProps {
  children: React.ReactNode;
  lessonId: string;
  mongoLessonId?: string; // MongoDB compatible ID
  totalSections: number;
  totalQuizQuestions: number;
  initialProgress?: Partial<LessonProgress>;
}

export const LessonProvider: React.FC<LessonProviderProps> = ({
  children,
  lessonId,
  mongoLessonId,
  totalSections,
  totalQuizQuestions,
  initialProgress = {}
}) => {
  // Use provided MongoDB ID or convert the string ID
  const dbLessonId = mongoLessonId || getMongoDatabaseId(lessonId);
  
  const [progress, setProgress] = useState<LessonProgress>({
    currentSection: initialProgress.currentSection || 0,
    sectionsCompleted: initialProgress.sectionsCompleted || Array(totalSections).fill(false),
    quizAnswers: initialProgress.quizAnswers || Array(totalQuizQuestions).fill(-1),
    quizCompleted: initialProgress.quizCompleted || false,
    lessonCompleted: initialProgress.lessonCompleted || false,
    overallProgress: initialProgress.overallProgress || 0,
    lessonId,
    mongoLessonId: dbLessonId
  });

  // Calculate overall progress whenever component state changes
  useEffect(() => {
    const completedSections = progress.sectionsCompleted.filter(Boolean).length;
    const totalSteps = totalSections + 1; // +1 for quiz
    
    let currentProgress = 0;
    
    if (progress.lessonCompleted) {
      currentProgress = 100;
    } else if (progress.quizCompleted) {
      currentProgress = Math.floor((totalSteps - 0.1) / totalSteps * 100);
    } else {
      currentProgress = Math.floor((completedSections / totalSteps) * 100);
    }
    
    setProgress(prev => ({
      ...prev,
      overallProgress: currentProgress
    }));
  }, [
    progress.sectionsCompleted, 
    progress.quizCompleted, 
    progress.lessonCompleted, 
    totalSections
  ]);

  const goToNextSection = () => {
    if (progress.currentSection < totalSections - 1) {
      setProgress(prev => ({
        ...prev,
        currentSection: prev.currentSection + 1
      }));
    }
  };

  const goToPreviousSection = () => {
    if (progress.currentSection > 0) {
      setProgress(prev => ({
        ...prev,
        currentSection: prev.currentSection - 1
      }));
    }
  };

  const goToSection = (sectionIndex: number) => {
    if (sectionIndex >= 0 && sectionIndex < totalSections) {
      setProgress(prev => ({
        ...prev,
        currentSection: sectionIndex
      }));
    }
  };

  const updateSectionProgress = (sectionIndex: number, completed: boolean) => {
    if (sectionIndex >= 0 && sectionIndex < totalSections) {
      setProgress(prev => {
        const newSectionsCompleted = [...prev.sectionsCompleted];
        newSectionsCompleted[sectionIndex] = completed;
        return {
          ...prev,
          sectionsCompleted: newSectionsCompleted
        };
      });
    }
  };

  const updateQuizAnswer = (questionIndex: number, answerIndex: number) => {
    if (questionIndex >= 0 && questionIndex < totalQuizQuestions) {
      setProgress(prev => {
        const newQuizAnswers = [...prev.quizAnswers];
        newQuizAnswers[questionIndex] = answerIndex;
        return {
          ...prev,
          quizAnswers: newQuizAnswers
        };
      });
    }
  };

  const completeQuiz = () => {
    setProgress(prev => ({
      ...prev,
      quizCompleted: true
    }));
  };

  const completeLesson = () => {
    setProgress(prev => ({
      ...prev,
      lessonCompleted: true
    }));
  };

  const saveProgress = async () => {
    try {
      // Convert the progress object to the format expected by the API
      const progressData = {
        lessonId: progress.mongoLessonId, // Use MongoDB ID for the API
        progress: progress.overallProgress,
        completed: progress.lessonCompleted,
        sectionsCompleted: progress.sectionsCompleted,
        quizAnswers: progress.quizAnswers,
        quizCompleted: progress.quizCompleted,
        timeSpent: 0, // Would be tracked separately
        lastPosition: progress.currentSection.toString(),
      };

      // Call API to save progress
      const response = await fetch(`/api/nko/lessons/${progress.lessonId}/progress`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(progressData),
      });

      if (!response.ok) {
        throw new Error('Failed to save progress');
      }

      return await response.json();
    } catch (error) {
      console.error('Error saving progress:', error);
      throw error;
    }
  };

  const contextValue: LessonContextType = {
    progress,
    goToNextSection,
    goToPreviousSection,
    goToSection,
    updateSectionProgress,
    updateQuizAnswer,
    completeQuiz,
    completeLesson,
    saveProgress,
  };

  return (
    <LessonContext.Provider value={contextValue}>
      {children}
    </LessonContext.Provider>
  );
};

export const useLessonContext = () => {
  const context = useContext(LessonContext);
  if (context === undefined) {
    throw new Error('useLessonContext must be used within a LessonProvider');
  }
  return context;
};
