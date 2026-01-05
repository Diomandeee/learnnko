"use client"

import { useState, useEffect } from "react"
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader,
  CardTitle,
  CardDescription 
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { 
  ChevronLeft, 
  ChevronRight, 
  BookOpen, 
  CheckCircle, 
  Home, 
  Save,
  List,
  XCircle
} from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"

interface ParsedLesson {
  id: string;
  frontmatter: {
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
  };
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

interface LessonProgress {
  currentSection: number;
  sectionsCompleted: boolean[];
  quizAnswers: number[];
  quizCompleted: boolean;
  lessonCompleted: boolean;
  overallProgress: number;
}

interface MarkdownLessonViewProps {
  lesson: ParsedLesson;
  onSaveProgress: (progress: LessonProgress) => Promise<void>;
  initialProgress?: Partial<LessonProgress>;
}

export function MarkdownLessonView({
  lesson,
  onSaveProgress,
  initialProgress = {}
}: MarkdownLessonViewProps) {
  // Progress state
  const [progress, setProgress] = useState<LessonProgress>({
    currentSection: initialProgress.currentSection || 0,
    sectionsCompleted: initialProgress.sectionsCompleted || Array(lesson.sections.length).fill(false),
    quizAnswers: initialProgress.quizAnswers || Array(lesson.quiz.questions.length).fill(-1),
    quizCompleted: initialProgress.quizCompleted || false,
    lessonCompleted: initialProgress.lessonCompleted || false,
    overallProgress: initialProgress.overallProgress || 0
  });
  
  // Active tab state
  const [activeTab, setActiveTab] = useState<'learn' | 'quiz' | 'summary'>(
    initialProgress.quizCompleted ? 'summary' : 
    initialProgress.currentSection >= lesson.sections.length ? 'quiz' : 'learn'
  );
  
  const { toast } = useToast();
  const router = useRouter();
  
  // Calculate overall progress whenever component state changes
  useEffect(() => {
    const totalSections = lesson.sections.length;
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
    lesson.sections.length
  ]);
  
  // Automatically save progress when significant state changes
  useEffect(() => {
    const saveCurrentProgress = async () => {
      try {
        await onSaveProgress(progress);
      } catch (error) {
        // Silent fail - we don't want to interrupt the user experience
        console.error('Error auto-saving progress:', error);
      }
    };
    
    saveCurrentProgress();
  }, [
    progress.sectionsCompleted, 
    progress.quizCompleted, 
    progress.lessonCompleted, 
    activeTab, 
    onSaveProgress, 
    progress
  ]);
  
  const goToNextSection = () => {
    if (progress.currentSection < lesson.sections.length - 1) {
      setProgress(prev => ({
        ...prev,
        currentSection: prev.currentSection + 1
      }));
    } else {
      // If at last section, go to quiz
      setActiveTab('quiz');
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
    if (sectionIndex >= 0 && sectionIndex < lesson.sections.length) {
      setProgress(prev => ({
        ...prev,
        currentSection: sectionIndex
      }));
    }
  };
  
  const updateSectionProgress = (sectionIndex: number, completed: boolean) => {
    if (sectionIndex >= 0 && sectionIndex < lesson.sections.length) {
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
  
  const handleExerciseAnswer = (questionIndex: number, answerIndex: number) => {
    // Check if the answer is correct
    const currentSection = lesson.sections[progress.currentSection];
    const exercise = currentSection.exercises?.[questionIndex];
    
    if (exercise && exercise.correctAnswer === answerIndex) {
      // Mark exercise as completed
      toast({
        title: "Correct!",
        description: exercise.explanation || "Good job!",
      });
      
      // If all exercises in the section are answered correctly, mark section as completed
      if (currentSection.exercises && 
          currentSection.exercises.every((ex, idx) => 
            idx === questionIndex || progress.sectionsCompleted[progress.currentSection]
          )) {
        updateSectionProgress(progress.currentSection, true);
      }
    } else {
      toast({
        title: "Incorrect",
        description: exercise?.explanation || "Try again!",
        variant: "destructive"
      });
    }
  };
  
  const updateQuizAnswer = (questionIndex: number, answerIndex: number) => {
    if (questionIndex >= 0 && questionIndex < lesson.quiz.questions.length) {
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
    setActiveTab('summary');
  };
  
  const completeLesson = () => {
    setProgress(prev => ({
      ...prev,
      lessonCompleted: true
    }));
    
    // Save final progress
    onSaveProgress({
      ...progress,
      lessonCompleted: true,
      overallProgress: 100
    }).then(() => {
      toast({
        title: "Lesson Completed!",
        description: "You've successfully completed this lesson."
      });
    });
  };
  
  // Render a section with its exercises
  const renderSection = (section: typeof lesson.sections[0], index: number) => {
    return (
      <div>
        <h2 className="text-2xl font-bold mb-4">{section.title}</h2>
        <div dangerouslySetInnerHTML={{ __html: section.html }} />
        
        {section.exercises && section.exercises.length > 0 && (
          <div className="mt-6 space-y-4">
            <h3 className="text-xl font-semibold">Exercises</h3>
            {section.exercises.map((exercise, exIndex) => (
              <Card key={exIndex} className="border-2 border-primary/20">
                <CardHeader>
                  <CardTitle className="text-lg">{exercise.question}</CardTitle>
                </CardHeader>
                <CardContent>
                  {exercise.options && (
                    <RadioGroup
                      onValueChange={(value) => 
                        handleExerciseAnswer(exIndex, parseInt(value))
                      }
                    >
                      {exercise.options.map((option, optIndex) => (
                        <div key={optIndex} className="flex items-start space-x-2 py-2">
                          <RadioGroupItem 
                            value={optIndex.toString()} 
                            id={`ex-${index}-${exIndex}-${optIndex}`}
                          />
                          <Label 
                            htmlFor={`ex-${index}-${exIndex}-${optIndex}`}
                            className="text-base"
                          >
                            {option}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    );
  };
  
  // Quiz Component
  const QuizComponent = () => {
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [showResults, setShowResults] = useState(false);
    const [score, setScore] = useState(0);
    
    // Calculate score when showing results
    useEffect(() => {
      if (showResults) {
        const correct = progress.quizAnswers.reduce((acc, answer, index) => {
          return acc + (answer === lesson.quiz.questions[index].correctAnswer ? 1 : 0);
        }, 0);
        setScore(correct);
      }
    }, [showResults, progress.quizAnswers]);
    
    // If quiz is already completed, show results
    useEffect(() => {
      if (progress.quizCompleted) {
        setShowResults(true);
      }
    }, [progress.quizCompleted]);
    
    if (showResults) {
      const quizPassed = score >= Math.ceil(lesson.quiz.questions.length * 0.7); // 70% to pass
      
      return (
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">
              Quiz Results: {score} / {lesson.quiz.questions.length}
            </h2>
            <p className={quizPassed ? "text-green-600" : "text-red-600"}>
              {quizPassed ? "Congratulations! You passed the quiz!" : "Keep practicing and try again."}
            </p>
          </div>
          
          <Separator />
          
          <div className="space-y-4">
            {lesson.quiz.questions.map((question, index) => (
              <Card key={index} className={
                progress.quizAnswers[index] === question.correctAnswer
                  ? "border-amber-500"
                  : "border-red-500"
              }>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    {progress.quizAnswers[index] === question.correctAnswer ? (
                      <CheckCircle className="h-5 w-5 text-amber-500 flex-shrink-0" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                    )}
                    <span>{question.question}</span>
                  </CardTitle>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-2">
                    {question.options.map((option, optIndex) => (
                      <div 
                        key={optIndex} 
                        className={`px-3 py-2 rounded-md ${
                          optIndex === question.correctAnswer 
                            ? "bg-amber-900/30 border border-amber-500" 
                            : optIndex === progress.quizAnswers[index] 
                              ? "bg-red-100 border border-red-500" 
                              : "bg-muted"
                        }`}
                      >
                        {option}
                      </div>
                    ))}
                  </div>
                  
                  {question.explanation && (
                    <div className="mt-4 text-sm text-muted-foreground p-3 bg-muted rounded-md">
                      <strong>Explanation:</strong> {question.explanation}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
          
          {!progress.quizCompleted && (
            <div className="flex justify-center mt-6">
              <Button onClick={completeQuiz}>
                Continue to Summary
              </Button>
            </div>
          )}
        </div>
      );
    }
    
    return (
      <div className="space-y-6">
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">Question {currentQuestion + 1} of {lesson.quiz.questions.length}</span>
            <span className="text-sm">{Math.round((currentQuestion / lesson.quiz.questions.length) * 100)}% complete</span>
          </div>
          <Progress value={(currentQuestion / lesson.quiz.questions.length) * 100} className="h-2" />
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>{lesson.quiz.questions[currentQuestion].question}</CardTitle>
          </CardHeader>
          
          <CardContent>
            <RadioGroup 
              value={progress.quizAnswers[currentQuestion]?.toString() || ""} 
              onValueChange={(value) => updateQuizAnswer(currentQuestion, parseInt(value))}
            >
              {lesson.quiz.questions[currentQuestion].options.map((option, index) => (
                <div key={index} className="flex items-center space-x-2 py-2">
                  <RadioGroupItem 
                    value={index.toString()} 
                    id={`quiz-question-${currentQuestion}-option-${index}`}
                  />
                  <Label 
                    htmlFor={`quiz-question-${currentQuestion}-option-${index}`}
                    className="text-base"
                  >
                    {option}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </CardContent>
          
          <CardFooter className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => setCurrentQuestion(prev => Math.max(0, prev - 1))}
              disabled={currentQuestion === 0}
            >
              <ChevronLeft className="h-4 w-4 mr-2" /> Previous
            </Button>
            
            <Button 
              onClick={() => {
                if (currentQuestion < lesson.quiz.questions.length - 1) {
                  setCurrentQuestion(prev => prev + 1);
                } else {
                  setShowResults(true);
                }
              }}
              disabled={progress.quizAnswers[currentQuestion] === undefined || progress.quizAnswers[currentQuestion] === -1}
            >
              {currentQuestion < lesson.quiz.questions.length - 1 ? (
                <>Next <ChevronRight className="h-4 w-4 ml-2" /></>
              ) : (
                "Finish Quiz"
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  };
  
  // Render summary and vocabulary
  const renderSummary = () => {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Lesson Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div dangerouslySetInnerHTML={{ __html: lesson.summary }} />
          </CardContent>
        </Card>
        
        {lesson.vocabulary.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Vocabulary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr>
                      <th className="border p-2 text-left">N'Ko</th>
                      <th className="border p-2 text-left">Transliteration</th>
                      <th className="border p-2 text-left">English</th>
                      <th className="border p-2 text-left">French</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lesson.vocabulary.map((word, index) => (
                      <tr key={index}>
                        <td dir="rtl" className="border p-2 font-nko text-xl">{word.nko}</td>
                        <td className="border p-2">{word.latin}</td>
                        <td className="border p-2">{word.english}</td>
                        <td className="border p-2">{word.french}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
        
        <div className="flex flex-col items-center justify-center py-4 space-y-4">
          <p className="text-center text-muted-foreground">
            You've completed the lesson! Click the button below to mark it as complete.
          </p>
          <Button 
            onClick={completeLesson} 
            className="px-8"
            disabled={progress.lessonCompleted}
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            {progress.lessonCompleted ? "Lesson Completed" : "Complete Lesson"}
          </Button>
        </div>
      </div>
    );
  };
  
  // Manual save function
  const handleSave = async () => {
    try {
      await onSaveProgress(progress);
      toast({
        title: "Progress saved",
        description: "Your lesson progress has been saved."
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save progress. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  return (
    <Card className="max-w-4xl mx-auto shadow-md">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl">{lesson.frontmatter.title}</CardTitle>
            <CardDescription>{lesson.frontmatter.description}</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href="/dashboard/nko/lessons">
                <Home className="h-4 w-4 mr-2" />
                Lessons
              </Link>
            </Button>
            <Button variant="outline" size="sm" onClick={handleSave}>
              <Save className="h-4 w-4 mr-2" />
              Save
            </Button>
          </div>
        </div>
        
        <div className="mt-4">
          <div className="flex justify-between mb-1 text-sm">
            <span>Progress</span>
            <span className="font-medium">{progress.overallProgress}%</span>
          </div>
          <Progress value={progress.overallProgress} className="h-2" />
        </div>
        
        <div className="flex flex-wrap gap-2 mt-4">
          {lesson.frontmatter.topics.map(topic => (
            <Badge key={topic} variant="outline">{topic}</Badge>
          ))}
          <Badge className={
            lesson.frontmatter.level === 'beginner' ? 'bg-amber-500' : 
            lesson.frontmatter.level === 'intermediate' ? 'bg-orange-500' : 'bg-purple-500'
          }>
            {lesson.frontmatter.level}
          </Badge>
          <Badge variant="secondary">
            {lesson.frontmatter.duration} min
          </Badge>
        </div>
      </CardHeader>
      
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="learn">
            <BookOpen className="h-4 w-4 mr-2" />
            Learn
          </TabsTrigger>
          <TabsTrigger 
            value="quiz" 
            disabled={!progress.sectionsCompleted.every(Boolean)}
          >
            <List className="h-4 w-4 mr-2" />
            Quiz
          </TabsTrigger>
          <TabsTrigger 
            value="summary"
            disabled={!progress.quizCompleted}
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Summary
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="learn">
          <CardContent>
            {lesson.sections.length > 0 && progress.currentSection < lesson.sections.length && (
              renderSection(lesson.sections[progress.currentSection], progress.currentSection)
            )}
            
            {/* Section navigation */}
            <div className="flex flex-wrap gap-2 mt-6">
              {lesson.sections.map((_, index) => (
                <Button
                  key={index}
                  variant={progress.currentSection === index ? "default" : 
                           progress.sectionsCompleted[index] ? "outline" : "ghost"}
                  size="sm"
                  onClick={() => goToSection(index)}
                  className={progress.sectionsCompleted[index] ? "border-amber-500" : ""}
                >
                  {progress.sectionsCompleted[index] && (
                    <CheckCircle className="h-3 w-3 mr-1 text-amber-500" />
                  )}
                  {index + 1}
                </Button>
              ))}
            </div>
          </CardContent>
          
          <CardFooter className="flex justify-between">
            <Button
              variant="outline"
              onClick={goToPreviousSection}
              disabled={progress.currentSection === 0}
            >
              <ChevronLeft className="h-4 w-4 mr-2" /> Previous
            </Button>
            
            {progress.currentSection < lesson.sections.length - 1 ? (
              <Button 
                onClick={goToNextSection} 
                disabled={!progress.sectionsCompleted[progress.currentSection]}
              >
                Next <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button 
                onClick={() => setActiveTab('quiz')} 
                disabled={!progress.sectionsCompleted.every(Boolean)}
              >
                Take Quiz <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            )}
          </CardFooter>
        </TabsContent>
        
        <TabsContent value="quiz">
          <CardContent>
            <QuizComponent />
          </CardContent>
        </TabsContent>
        
        <TabsContent value="summary">
          <CardContent>
            {renderSummary()}
          </CardContent>
        </TabsContent>
      </Tabs>
    </Card>
  );
}
