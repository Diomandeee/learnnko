"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { 
  CheckCircle, 
  XCircle, 
  Volume2, 
  RefreshCw, 
  BookOpen, 
  RotateCcw,
  Star,
  HelpCircle,
  Lightbulb,
  Pencil,
  AlignLeft
} from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

export function NkoPracticeHub() {
  const [practiceType, setPracticeType] = useState<string>('multiple-choice')
  const [currentQuestion, setCurrentQuestion] = useState<number>(0)
  const [score, setScore] = useState<number>(0)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null)
  const [userInput, setUserInput] = useState<string>('')
  const [showHint, setShowHint] = useState<boolean>(false)
  const { toast } = useToast()

  // Sample questions for multiple choice
  const multipleChoiceQuestions = [
    {
      question: "What is the N'Ko word for 'hello'?",
      options: ["ߌ ߣߊߞߊ߬", "ߌ ߕߌ߰", "ߌ ߘߌ߫", "ߡߊ߰ߞߌ߬"],
      correctAnswer: "ߌ ߣߊߞߊ߬",
      hint: "It's a common greeting that literally translates to 'you have come'",
      audio: "/audio/hello.mp3"
    },
    {
      question: "Which letter represents the sound 'j' in N'Ko?",
      options: ["ߖ", "ߘ", "ߙ", "ߛ"],
      correctAnswer: "ߖ",
      hint: "It looks similar to the number '6' rotated",
      audio: "/audio/j-sound.mp3"
    },
    {
      question: "What is the N'Ko number for '5'?",
      options: ["߃", "߄", "߅", "߆"],
      correctAnswer: "߅",
      hint: "Count from 1: ߁, ߂, ߃, ߄, ...",
      audio: "/audio/five.mp3"
    },
    {
      question: "Which mark is used for nasalization in N'Ko?",
      options: ["߫", "߬", "߭", "߲"],
      correctAnswer: "߲",
      hint: "When a vowel is nasalized, it sounds like it's followed by 'n'",
      audio: "/audio/nasalization.mp3"
    },
    {
      question: "What does 'ߒߞߏ' mean?",
      options: ["My language", "I say", "Our script", "Writing system"],
      correctAnswer: "I say",
      hint: "It's the name of the script itself, which is also a phrase in Mande languages",
      audio: "/audio/nko.mp3"
    }
  ]

  // Sample questions for writing practice
  const writingQuestions = [
    {
      prompt: "Write the N'Ko word for 'water'",
      expectedAnswer: "ߖߌ",
      transliteration: "ji",
      hint: "It starts with the letter that represents 'j' sound",
      audio: "/audio/water.mp3"
    },
    {
      prompt: "Write the N'Ko word for 'sun'",
      expectedAnswer: "ߕߋ߬",
      transliteration: "tɛ",
      hint: "It starts with the letter that represents 't' sound",
      audio: "/audio/sun.mp3"
    },
    {
      prompt: "Write 'thank you' in N'Ko",
      expectedAnswer: "ߌ ߣߌ߫ ߗߋ",
      transliteration: "i ni ce",
      hint: "It's a three-word phrase",
      audio: "/audio/thank-you.mp3"
    },
    {
      prompt: "Write 'good morning' in N'Ko",
      expectedAnswer: "ߌ ߞߋ߲߬ߖߌ",
      transliteration: "i kɛnji",
      hint: "It's a two-word phrase",
      audio: "/audio/good-morning.mp3"
    },
    {
      prompt: "Write the N'Ko number '10'",
      expectedAnswer: "߁߀",
      transliteration: "10",
      hint: "It's a combination of two number characters",
      audio: "/audio/ten.mp3"
    }
  ]

  // Sample questions for reading practice
  const readingQuestions = [
    {
      text: "ߊ߬ߟߎ߬ ߞߊ߲ߞߊ߲ ߞߊ߬ ߓߊ߯ߙߊ ߞߍ߫ ߟߊ߫ ߞߵߊ߬ ߕߘߍ߬ ߊ߬ߟߎ߬ ߡߊ߫ ߓߊ߯ߙߊ ߛߐ߲߬ ߘߌ߫。",
      translation: "They wanted to work but they didn't find work.",
      questions: ["What were they looking for?", "Did they find what they were looking for?"],
      answers: ["Work", "No"],
      audio: "/audio/reading1.mp3"
    },
    {
      text: "ߌ ߘߏ߲߬ ߘߊ߫ ߓߏ߲߬ߘߊ ߟߊ߫ ߞߊ߬ ߞߎ߲߬ߠߊ߬ߛߌ߰ߟߌ ߟߊߛߐ߬ߘߐ߲߬。",
      translation: "You entered the school to seek knowledge.",
      questions: ["Where did you enter?", "What were you seeking?"],
      answers: ["School", "Knowledge"],
      audio: "/audio/reading2.mp3"
    }
  ]

  const currentMultipleChoiceQuestion = multipleChoiceQuestions[currentQuestion]
  const currentWritingQuestion = writingQuestions[currentQuestion]
  const currentReadingQuestion = readingQuestions[0] // Just using the first one for this example

  const checkMultipleChoiceAnswer = (answer: string) => {
    setSelectedAnswer(answer)
    const correct = answer === currentMultipleChoiceQuestion.correctAnswer
    setIsCorrect(correct)
    
    if (correct) {
      setScore(score + 1)
      toast({
        title: "Correct!",
        description: "Well done!",
        variant: "default"
      })
    } else {
      toast({
        title: "Incorrect",
        description: `The correct answer is: ${currentMultipleChoiceQuestion.correctAnswer}`,
        variant: "destructive"
      })
    }
  }

  const checkWritingAnswer = () => {
    // In a real implementation, we'd use a more sophisticated comparison
    // that accounts for minor variations in spelling, diacritics, etc.
    const correctAnswer = currentWritingQuestion.expectedAnswer
    const correct = userInput.trim() === correctAnswer
    
    setIsCorrect(correct)
    
    if (correct) {
      setScore(score + 1)
      toast({
        title: "Correct!",
        description: "You wrote it perfectly!",
        variant: "default"
      })
    } else {
      toast({
        title: "Not quite right",
        description: `The correct answer is: ${correctAnswer}`,
        variant: "destructive"
      })
    }
  }

  const nextQuestion = () => {
    if (currentQuestion < multipleChoiceQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
      setSelectedAnswer(null)
      setIsCorrect(null)
      setUserInput('')
      setShowHint(false)
    } else {
      // End of quiz
      toast({
        title: "Quiz Completed!",
        description: `Your final score: ${score}/${multipleChoiceQuestions.length}`,
      })
      // Optionally reset the quiz
      resetQuiz()
    }
  }

  const resetQuiz = () => {
    setCurrentQuestion(0)
    setScore(0)
    setSelectedAnswer(null)
    setIsCorrect(null)
    setUserInput('')
    setShowHint(false)
  }

  const playAudio = (questionType: string) => {
    let audioUrl = "";
    
    switch (questionType) {
      case 'multiple-choice':
        audioUrl = currentMultipleChoiceQuestion.audio;
        break;
      case 'writing':
        audioUrl = currentWritingQuestion.audio;
        break;
      case 'reading':
        audioUrl = currentReadingQuestion.audio;
        break;
    }
    
    // In a real implementation, we would play the audio file
    toast({
      title: "Audio",
      description: "Playing audio... (simulated in this example)",
    })
  }

  return (
    <div className="space-y-6">
      <Tabs value={practiceType} onValueChange={setPracticeType}>
        <TabsList className="grid grid-cols-3">
          <TabsTrigger value="multiple-choice">Multiple Choice</TabsTrigger>
          <TabsTrigger value="writing">Writing Practice</TabsTrigger>
          <TabsTrigger value="reading">Reading Comprehension</TabsTrigger>
        </TabsList>
        
        <TabsContent value="multiple-choice" className="pt-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center mb-2">
                <Badge>Question {currentQuestion + 1}/{multipleChoiceQuestions.length}</Badge>
                <div className="flex items-center">
                  <Badge variant="outline" className="mr-2">
                    Score: {score}/{multipleChoiceQuestions.length}
                  </Badge>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => playAudio('multiple-choice')}
                  >
                    <Volume2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <CardTitle>{currentMultipleChoiceQuestion.question}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {currentMultipleChoiceQuestion.options.map((option, index) => (
                  <Button
                    key={index}
                    variant={
                      selectedAnswer === option
                        ? isCorrect
                          ? "success"
                          : "destructive"
                        : "outline"
                    }
                    className={`text-lg ${option.match(/[^\u0000-\u007F]/) ? 'font-nko' : ''}`}
                    onClick={() => checkMultipleChoiceAnswer(option)}
                    disabled={selectedAnswer !== null}
                  >
                    {option}
                  </Button>
                ))}
              </div>
              
              {showHint && (
                <div className="mt-4 p-3 bg-muted rounded-md">
                  <div className="flex items-center gap-2">
                    <Lightbulb className="h-4 w-4 text-yellow-500" />
                    <p className="text-sm">{currentMultipleChoiceQuestion.hint}</p>
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button 
                variant="outline" 
                onClick={() => setShowHint(true)}
                disabled={showHint}
              >
                <HelpCircle className="h-4 w-4 mr-2" />
                Show Hint
              </Button>
              
              <div className="flex gap-2">
                <Button 
                  variant="ghost" 
                  onClick={resetQuiz}
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reset
                </Button>
                <Button 
                  onClick={nextQuestion}
                  disabled={selectedAnswer === null}
                >
                  Next Question
                </Button>
              </div>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="writing" className="pt-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center mb-2">
                <Badge>Writing Exercise {currentQuestion + 1}/{writingQuestions.length}</Badge>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => playAudio('writing')}
                >
                  <Volume2 className="h-4 w-4" />
                </Button>
              </div>
              <CardTitle>{currentWritingQuestion.prompt}</CardTitle>
              <CardDescription>
                Type the N'Ko characters in the input field below
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex">
                  <Input
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    className="text-right font-nko text-lg"
                    dir="rtl"
                    placeholder="ߞߊ߬ ߢߊ ߛߓߍ ߣߌ߲߬..."
                  />
                </div>
                
                {isCorrect !== null && (
                  <div className={`p-3 ${isCorrect ? 'bg-green-100' : 'bg-red-100'} rounded-md`}>
                    {isCorrect ? (
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <p>Correct! Well done.</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <XCircle className="h-5 w-5 text-red-600" />
                          <p>Not quite right. The correct answer is:</p>
                        </div>
                        <div className="p-2 bg-white rounded text-right font-nko text-lg" dir="rtl">
                          {currentWritingQuestion.expectedAnswer}
                        </div>
                        <p className="text-sm italic">
                          Transliteration: {currentWritingQuestion.transliteration}
                        </p>
                      </div>
                    )}
                  </div>
                )}
                
                {showHint && (
                  <div className="p-3 bg-muted rounded-md">
                    <div className="flex items-center gap-2">
                      <Lightbulb className="h-4 w-4 text-yellow-500" />
                      <p className="text-sm">{currentWritingQuestion.hint}</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => setShowHint(true)}
                  disabled={showHint}
                >
                  <HelpCircle className="h-4 w-4 mr-2" />
                  Show Hint
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setUserInput('')}
                  disabled={!userInput}
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Clear
                </Button>
              </div>
              
              <div className="flex gap-2">
                {isCorrect === null ? (
                  <Button 
                    onClick={checkWritingAnswer}
                    disabled={!userInput.trim()}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Check Answer
                  </Button>
                ) : (
                  <Button onClick={nextQuestion}>
                    Next Question
                  </Button>
                )}
              </div>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="reading" className="pt-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center mb-2">
                <Badge>Reading Exercise</Badge>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => playAudio('reading')}
                >
                  <Volume2 className="h-4 w-4" />
                </Button>
              </div>
              <CardTitle>Read the text and answer the questions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted p-4 rounded-lg">
                <p className="text-xl font-nko text-right" dir="rtl">
                  {currentReadingQuestion.text}
                </p>
                <p className="text-sm mt-2 italic">
                  Translation: {currentReadingQuestion.translation}
                </p>
              </div>
              
              <div className="space-y-3">
                {currentReadingQuestion.questions.map((question, index) => (
                  <div key={index} className="space-y-2">
                    <p className="font-medium">{index + 1}. {question}</p>
                    <Input 
                      placeholder="Type your answer here..."
                      className="max-w-md"
                    />
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button>
                <CheckCircle className="h-4 w-4 mr-2" />
                Check Answers
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
