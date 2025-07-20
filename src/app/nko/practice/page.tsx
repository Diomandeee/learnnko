import { Metadata } from "next"
import { NkoPracticeHub } from "@/components/nko/practice/nko-practice-hub"

export const metadata: Metadata = {
  title: "N'Ko Practice | French Connect",
  description: "Practice N'Ko language skills with interactive exercises",
}

export default function NkoPracticePage() {
  return (
    <div className="min-h-screen">
      <div className="container mx-auto py-12 space-y-8">
        {/* Enhanced Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-xl">ߒ</span>
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-700 to-indigo-700 bg-clip-text text-transparent">
              N'Ko Practice
            </h1>
          </div>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Improve your N'Ko skills with interactive practice exercises
          </p>
        </div>

        <NkoPracticeHub />
      </div>
    </div>
  )
} 