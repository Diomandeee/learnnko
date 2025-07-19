"use client"

import { useState } from "react"
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Volume2, Trophy, Download, Check, BookOpen } from "lucide-react"
import { useLessonContext } from "@/lib/nko/lessons/lesson-context"
import { Separator } from "@/components/ui/separator"
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { useToast } from "@/components/ui/use-toast"

interface LessonSummaryProps {
  summary: string;
  vocabulary: {
    nko: string;
    latin: string;
    english: string;
    french: string;
  }[];
  onComplete: () => void;
}

export function LessonSummary({ summary, vocabulary, onComplete }: LessonSummaryProps) {
  const { progress, completeLesson, saveProgress } = useLessonContext()
  const [showCertificate, setShowCertificate] = useState(false)
  const { toast } = useToast()

  const playAudio = (text: string) => {
    // In a real implementation, this would call a text-to-speech API
    alert(`Playing audio for: ${text}`)
  }

  const handleComplete = async () => {
    if (!progress.lessonCompleted) {
      completeLesson()
      await saveProgress()
    }
    
    setShowCertificate(true)
  }

  const downloadCertificate = () => {
    toast({
      title: "Certificate Downloaded",
      description: "Your certificate has been downloaded.",
    })
  }

  if (showCertificate) {
    return (
      <div className="text-center space-y-6 py-8">
        <Trophy className="h-20 w-20 text-yellow-500 mx-auto" />
        
        <div>
          <h2 className="text-2xl font-bold mb-1">Congratulations!</h2>
          <p className="text-muted-foreground">You've successfully completed this lesson.</p>
        </div>
        
        <Card className="bg-gradient-to-br from-purple-50 to-blue-50 p-8 max-w-xl mx-auto border-2 border-primary/20">
          <CardContent className="text-center p-6">
            <h3 className="text-xl font-bold mb-6">Certificate of Completion</h3>
            <p className="mb-2">This certifies that</p>
            <p className="text-2xl font-bold mb-2">Student Name</p>
            <p className="mb-6">has successfully completed the</p>
            <p className="text-xl font-bold mb-8 text-primary">{progress.lessonId} Course</p>
            <div className="flex justify-center space-x-4">
              <Button onClick={downloadCertificate}>
                <Download className="h-4 w-4 mr-2" />
                Download Certificate
              </Button>
              <Button variant="outline" onClick={onComplete}>
                Continue Learning
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Lesson Summary</CardTitle>
          <CardDescription>Review what you've learned</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="whitespace-pre-line">{summary}</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Vocabulary</CardTitle>
          <CardDescription>Key words and phrases from this lesson</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>N'Ko</TableHead>
                <TableHead>Transliteration</TableHead>
                <TableHead>English</TableHead>
                <TableHead>French</TableHead>
                <TableHead className="w-10"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vocabulary.map((word, index) => (
                <TableRow key={index}>
                  <TableCell dir="rtl" className="font-nko text-xl">{word.nko}</TableCell>
                  <TableCell>{word.latin}</TableCell>
                  <TableCell>{word.english}</TableCell>
                  <TableCell>{word.french}</TableCell>
                  <TableCell>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => playAudio(word.nko)}
                    >
                      <Volume2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      <Separator />
      
      <div className="flex flex-col items-center justify-center py-4 space-y-4">
        <p className="text-center text-muted-foreground">
          You've completed the lesson! Click the button below to mark it as complete.
        </p>
        <Button onClick={handleComplete} className="px-8">
          <Check className="h-4 w-4 mr-2" />
          Complete Lesson
        </Button>
      </div>
    </div>
  )
}
