"use client"

import { useState, useEffect } from "react"
import { 
  Card, 
  CardContent, 
  CardFooter,
  CardHeader, 
  CardTitle 
} from "@/components/ui/card"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { CheckCircle, Volume2, HelpCircle, CheckCheck } from "lucide-react"
import { useLessonContext } from "@/lib/nko/lessons/lesson-context"
import { Badge } from "@/components/ui/badge"

interface Exercise {
  type: 'multiple-choice' | 'fill-blank' | 'matching' | 'recognition';
  question: string;
  options?: string[];
  correctAnswer: string | number;
  explanation?: string;
}

interface LessonSectionProps {
  section: {
    title: string;
    content: string;
    nkoText?: string;
    pronunciation?: string;
    latinTransliteration?: string;
    exercises?: Exercise[];
    audioPrompt?: string;
  };
  sectionIndex: number;
  isCompleted: boolean;
}

export function LessonSection({
  section,
  sectionIndex,
  isCompleted
}: LessonSectionProps) {
  const { updateSectionProgress } = useLessonContext()
  const [exerciseAnswers, setExerciseAnswers] = useState<(number | null)[]>(
    section.exercises ? Array(section.exercises.length).fill(null) : []
  )
  const [showExplanations, setShowExplanations] = useState<boolean[]>(
    section.exercises ? Array(section.exercises.length).fill(false) : []
  )
  const [allExercisesCorrect, setAllExercisesCorrect] = useState(false)

  // Check if all exercises are answered correctly
  useEffect(() => {
    if (!section.exercises || section.exercises.length === 0) {
      setAllExercisesCorrect(true)
      return
    }

    const allCorrect = exerciseAnswers.every((answer, index) => {
      if (answer === null) return false
      return answer === Number(section.exercises?.[index].correctAnswer)
    })

    setAllExercisesCorrect(allCorrect)

    // If all are correct and not yet marked as completed, update progress
    if (allCorrect && !isCompleted) {
      updateSectionProgress(sectionIndex, true)
    }
  }, [exerciseAnswers, section.exercises, isCompleted, sectionIndex, updateSectionProgress])

  const handleExerciseAnswer = (exerciseIndex: number, answerIndex: number) => {
    const newAnswers = [...exerciseAnswers]
    newAnswers[exerciseIndex] = answerIndex
    setExerciseAnswers(newAnswers)
  }

  const toggleExplanation = (exerciseIndex: number) => {
    const newExplanations = [...showExplanations]
    newExplanations[exerciseIndex] = !newExplanations[exerciseIndex]
    setShowExplanations(newExplanations)
  }

  const playAudio = (text: string) => {
    // In a real implementation, this would call a text-to-speech API
    // For now, we'll just show an alert
    alert(`Playing audio for: ${text}`)
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold mb-2 flex items-center">
          {section.title}
          {isCompleted && <CheckCircle className="h-5 w-5 text-amber-500 ml-2" />}
        </h3>
        <p className="text-muted-foreground">{section.content}</p>
      </div>

      {/* N'Ko text and pronunciation */}
      {section.nkoText && (
        <Card className="bg-muted/30">
          <CardContent className="pt-6">
            <div className="font-nko text-3xl mb-4 text-right" dir="rtl">
              {section.nkoText}
              <Button 
                variant="ghost" 
                size="sm" 
                className="ml-2" 
                onClick={() => section.audioPrompt && playAudio(section.audioPrompt)}
              >
                <Volume2 className="h-4 w-4" />
              </Button>
            </div>
            
            {section.latinTransliteration && (
              <div className="mb-2">
                <Badge variant="outline">Transliteration</Badge>
                <div className="mt-1 text-muted-foreground">
                  {section.latinTransliteration}
                </div>
              </div>
            )}
            
            {section.pronunciation && (
              <div>
                <Badge variant="outline">Pronunciation</Badge>
                <div className="mt-1 text-muted-foreground">
                  {section.pronunciation}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Exercises */}
      {section.exercises && section.exercises.length > 0 && (
        <div className="space-y-4 mt-6">
          <Separator />
          <h4 className="font-semibold">Practice Exercises</h4>
          
          {section.exercises.map((exercise, index) => (
            <Card key={index} className={
              exerciseAnswers[index] !== null
                ? exerciseAnswers[index] === Number(exercise.correctAnswer)
                  ? "border-amber-500"
                  : "border-red-500"
                : ""
            }>
              <CardHeader>
                <CardTitle className="text-base flex items-start gap-2">
                  <span>{index + 1}.</span>
                  <span>{exercise.question}</span>
                </CardTitle>
              </CardHeader>
              
              <CardContent>
                <RadioGroup 
                  value={exerciseAnswers[index]?.toString() || ""} 
                  onValueChange={(value) => handleExerciseAnswer(index, parseInt(value))}
                >
                  {exercise.options?.map((option, optIndex) => (
                    <div key={optIndex} className="flex items-center space-x-2 mb-2">
                      <RadioGroupItem 
                        value={optIndex.toString()} 
                        id={`exercise-${index}-option-${optIndex}`} 
                        disabled={exerciseAnswers[index] !== null}
                      />
                      <Label 
                        htmlFor={`exercise-${index}-option-${optIndex}`}
                        className={
                          exerciseAnswers[index] === optIndex && optIndex === Number(exercise.correctAnswer)
                            ? "text-green-600 font-medium"
                            : exerciseAnswers[index] === optIndex && optIndex !== Number(exercise.correctAnswer)
                            ? "text-red-600"
                            : optIndex === Number(exercise.correctAnswer) && exerciseAnswers[index] !== null
                            ? "text-green-600 font-medium"
                            : ""
                        }
                      >
                        {option}
                        {exerciseAnswers[index] === optIndex && optIndex === Number(exercise.correctAnswer) && (
                          <CheckCheck className="inline h-4 w-4 ml-2 text-green-600" />
                        )}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </CardContent>
              
              <CardFooter className="flex-col items-start">
                {exerciseAnswers[index] !== null && (
                  <>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => toggleExplanation(index)}
                      className="mb-2"
                    >
                      <HelpCircle className="h-4 w-4 mr-2" />
                      {showExplanations[index] ? "Hide Explanation" : "Show Explanation"}
                    </Button>
                    
                    {showExplanations[index] && exercise.explanation && (
                      <div className="text-muted-foreground text-sm mt-2 p-3 bg-muted rounded-md w-full">
                        {exercise.explanation}
                      </div>
                    )}
                  </>
                )}
              </CardFooter>
            </Card>
          ))}
          
          <div className="text-center mt-4">
            {allExercisesCorrect ? (
              <div className="text-green-600 flex items-center justify-center gap-2">
                <CheckCircle className="h-5 w-5" />
                <span>All exercises completed correctly!</span>
              </div>
            ) : (
              <div className="text-muted-foreground">
                Complete all exercises correctly to continue.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
