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
  List
} from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { LessonProvider, useLessonContext } from "@/lib/nko/lessons/lesson-context"
import { LessonSection } from "./lesson-section"
import { LessonQuiz } from "./lesson-quiz"
import { LessonSummary } from "./lesson-summary"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import { getMongoDatabaseId } from "@/lib/nko/modules/module-definitions"

interface LessonLayoutProps {
  lessonId: string
  mongoLessonId?: string // MongoDB compatible ID
  title: string
  description: string
  content: any
  initialProgress?: any
}

export function LessonLayout({
  lessonId,
  mongoLessonId,
  title,
  description,
  content,
  initialProgress
}: LessonLayoutProps) {
  
  // If we have initial progress, use it to determine active tab
  const initialTab = initialProgress?.quizCompleted 
    ? 'summary' 
    : initialProgress?.currentSection >= content.sections.length
      ? 'quiz'
      : 'learn';
  
  const [activeTab, setActiveTab] = useState(initialTab || 'learn')
  const { toast } = useToast()
  const router = useRouter()

  // Define a wrapper component that uses the context
  const LessonContent = () => {
    const { 
      progress, 
      goToNextSection, 
      goToPreviousSection, 
      goToSection,
      saveProgress 
    } = useLessonContext()

    // Automatically save progress when sections are completed and when tab changes
    useEffect(() => {
      const saveCurrentProgress = async () => {
        try {
          await saveProgress()
        } catch (error) {
          // Silent fail - we don't want to interrupt the user experience
          console.error('Error auto-saving progress:', error)
        }
      }
      
      saveCurrentProgress()
    }, [progress.sectionsCompleted, progress.quizCompleted, progress.lessonCompleted, activeTab, saveProgress])

    // Local function to handle manual save
    const handleSave = async () => {
      try {
        await saveProgress()
        toast({
          title: "Progress saved",
          description: "Your lesson progress has been saved."
        })
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to save progress. Please try again.",
          variant: "destructive"
        })
      }
    }

    return (
      <Card className="max-w-4xl mx-auto shadow-md">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">{title}</CardTitle>
              <CardDescription>{description}</CardDescription>
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
        </CardHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
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
              {content.sections.length > 0 && progress.currentSection < content.sections.length && (
                <LessonSection
                  section={content.sections[progress.currentSection]}
                  sectionIndex={progress.currentSection}
                  isCompleted={progress.sectionsCompleted[progress.currentSection]}
                />
              )}
              
              {/* Section navigation */}
              <div className="flex flex-wrap gap-2 mt-6">
                {content.sections.map((_, index) => (
                  <Button
                    key={index}
                    variant={progress.currentSection === index ? "default" : 
                             progress.sectionsCompleted[index] ? "outline" : "ghost"}
                    size="sm"
                    onClick={() => goToSection(index)}
                    className={progress.sectionsCompleted[index] ? "border-green-500" : ""}
                  >
                    {progress.sectionsCompleted[index] && (
                      <CheckCircle className="h-3 w-3 mr-1 text-green-500" />
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
              
              {progress.currentSection < content.sections.length - 1 ? (
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
              <LessonQuiz 
                questions={content.quizQuestions} 
                onComplete={() => setActiveTab('summary')}
              />
            </CardContent>
          </TabsContent>
          
          <TabsContent value="summary">
            <CardContent>
              <LessonSummary 
                summary={content.summary}
                vocabulary={content.vocabulary}
                onComplete={() => {
                  router.push('/dashboard/nko/lessons')
                }}
              />
            </CardContent>
          </TabsContent>
        </Tabs>
      </Card>
    )
  }

  // Use the MongoDB ID if available, otherwise convert the string ID
  const dbLessonId = mongoLessonId || getMongoDatabaseId(lessonId);

  return (
    <LessonProvider 
      lessonId={lessonId}
      mongoLessonId={dbLessonId}
      totalSections={content.sections.length}
      totalQuizQuestions={content.quizQuestions.length}
      initialProgress={initialProgress}
    >
      <LessonContent />
    </LessonProvider>
  )
}
