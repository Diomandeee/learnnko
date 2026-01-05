import { Metadata } from "next"
import { EnhancedLearningJourney } from "@/components/nko/lessons/enhanced-learning-journey"

export const metadata: Metadata = {
  title: "N'Ko Lessons | French Connect",
  description: "Learn N'Ko through structured lessons and courses",
}

export default function NkoLessonsPage() {
  return (
    <div className="min-h-screen bg-space-950">
      <div className="container mx-auto py-12">
        <EnhancedLearningJourney 
          userProgress={{
            totalProgress: 0,
            completedLessons: 0,
            totalLessons: 12
          }}
        />
      </div>
    </div>
  )
} 