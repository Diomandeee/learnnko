import { Metadata } from "next"
import { NkoLearningHub } from "@/components/nko/nko-learning-hub"

export const metadata: Metadata = {
  title: "N'Ko Learning Hub | French Connect",
  description: "Comprehensive N'Ko language learning with conversation, translation, and transcription",
}

export default function NkoPage() {
  return (
    <div className="min-h-screen">
      <div className="container mx-auto py-12">
        <NkoLearningHub />
      </div>
    </div>
  )
} 