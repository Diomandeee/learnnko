"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { NkoPracticeHub } from "@/components/nko/practice/nko-practice-hub"
import { LearningProgress } from "@/components/nko/lessons/learning-progress"

export function PracticeContainer() {
  const [activeTab, setActiveTab] = useState('quiz')

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="quiz">Quiz</TabsTrigger>
              <TabsTrigger value="writing">Writing</TabsTrigger>
              <TabsTrigger value="reading">Reading</TabsTrigger>
            </TabsList>
            
            <TabsContent value="quiz" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>N'Ko Quiz</CardTitle>
                  <CardDescription>
                    Test your knowledge of N'Ko characters and words
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <NkoPracticeHub />
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="writing" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Writing Practice</CardTitle>
                  <CardDescription>
                    Practice writing N'Ko characters and words
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <NkoPracticeHub />
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="reading" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Reading Practice</CardTitle>
                  <CardDescription>
                    Practice reading N'Ko text passages
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <NkoPracticeHub />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
        
        <div>
          <LearningProgress />
        </div>
      </div>
    </div>
  )
}
