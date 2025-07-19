import { Metadata } from "next"
import { NkoPracticeHub } from "@/components/nko/practice/nko-practice-hub"

export const metadata: Metadata = {
  title: "N'Ko Practice | French Connect",
  description: "Practice N'Ko language skills with interactive exercises",
}

export default function NkoPracticePage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">N'Ko Practice</h1>
          <p className="text-muted-foreground">
            Improve your N'Ko skills with interactive practice exercises
          </p>
        </div>
      </div>

      <NkoPracticeHub />
    </div>
  )
} 