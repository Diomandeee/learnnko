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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { CheckCircle, XCircle, Trophy, ChevronLeft, ChevronRight } from "lucide-react"
import { useLessonContext } from "@/lib/nko/lessons/lesson-context"
import { Separator } from "@/components/ui/separator"

interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

interface LessonQuizProps {
  questions: QuizQuestion[];
  onComplete: () => void;
}

export function LessonQuiz({ questions, onComplete }: LessonQuizProps) {
  const { progress, updateQuizAnswer, completeQuiz } = useLessonContext()
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [showResults, setShowResults] = useState(false)
  const [score, setScore] = useState(0)

  // Calculate score when showing results
  useEffect(() => {
    if (showResults) {
      const correct = progress.quizAnswers.reduce((acc, answer, index) => {
        return acc + (answer === questions[index].correctAnswer ? 1 : 0)
      }, 0)
      setScore(correct)
    }
  }, [showResults, progress.quizAnswers, questions])

  const handleAnswer = (answerIndex: number) => {
    updateQuizAnswer(currentQuestion, answerIndex)
  }

  const goToNextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    } else {
      setShowResults(true)
    }
  }

  const goToPreviousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
    }
  }

  const finishQuiz = () => {
    completeQuiz()
    onComplete()
  }

  // If quiz is already completed, show results
  useEffect(() => {
    if (progress.quizCompleted) {
      setShowResults(true)
    }
  }, [progress.quizCompleted])

  if (showResults) {
    const quizPassed = score >= Math.ceil(questions.length * 0.7) // 70% to pass
    
    return (
      <div className="space-y-6">
        <div className="text-center">
          <Trophy className={`h-16 w-16 mx-auto mb-4 ${quizPassed ? 'text-yellow-500' : 'text-muted-foreground'}`} />
          <h2 className="text-2xl font-bold mb-2">
            Quiz Results: {score} / {questions.length}
          </h2>
          <p className={quizPassed ? "text-green-600" : "text-red-600"}>
            {quizPassed ? "Congratulations! You passed the quiz!" : "Keep practicing and try again."}
          </p>
        </div>
        
        <Separator />
        
        <div className="space-y-4">
          {questions.map((question, index) => (
            <Card key={index} className={
              progress.quizAnswers[index] === question.correctAnswer
                ? "border-green-500"
                : "border-red-500"
            }>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-base flex items-center gap-2">
                    {progress.quizAnswers[index] === question.correctAnswer ? (
                      <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                    )}
                    <span>{question.question}</span>
                  </CardTitle>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-2">
                  {question.options.map((option, optIndex) => (
                    <div 
                      key={optIndex} 
                      className={`px-3 py-2 rounded-md ${
                        optIndex === question.correctAnswer 
                          ? "bg-green-100 border border-green-500" 
                          : optIndex === progress.quizAnswers[index] 
                            ? "bg-red-100 border border-red-500" 
                            : "bg-muted"
                      }`}
                    >
                      {option}
                    </div>
                  ))}
                </div>
                
                <div className="mt-4 text-sm text-muted-foreground p-3 bg-muted rounded-md">
                  <strong>Explanation:</strong> {question.explanation}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="flex justify-center mt-6">
          <Button onClick={finishQuiz}>
            Continue to Summary
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium">Question {currentQuestion + 1} of {questions.length}</span>
          <span className="text-sm">{Math.round((currentQuestion / questions.length) * 100)}% complete</span>
        </div>
        <Progress value={(currentQuestion / questions.length) * 100} className="h-2" />
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>{questions[currentQuestion].question}</CardTitle>
        </CardHeader>
        
        <CardContent>
          <RadioGroup 
            value={progress.quizAnswers[currentQuestion]?.toString() || ""} 
            onValueChange={(value) => handleAnswer(parseInt(value))}
          >
            {questions[currentQuestion].options.map((option, index) => (
              <div key={index} className="flex items-center space-x-2 py-2">
                <RadioGroupItem 
                  value={index.toString()} 
                  id={`quiz-question-${currentQuestion}-option-${index}`}
                />
                <Label htmlFor={`quiz-question-${currentQuestion}-option-${index}`}>
                  {option}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </CardContent>
        
        <CardFooter className="flex justify-between">
          <Button
            variant="outline"
            onClick={goToPreviousQuestion}
            disabled={currentQuestion === 0}
          >
            <ChevronLeft className="h-4 w-4 mr-2" /> Previous
          </Button>
          
          <Button 
            onClick={goToNextQuestion} 
            disabled={progress.quizAnswers[currentQuestion] === undefined || progress.quizAnswers[currentQuestion] === -1}
          >
            {currentQuestion < questions.length - 1 ? (
              <>Next <ChevronRight className="h-4 w-4 ml-2" /></>
            ) : (
              "Finish Quiz"
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
