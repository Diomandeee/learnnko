import { Metadata } from "next"
import { TranslatorContainer } from "@/components/nko/translator/translator-container"

export const metadata: Metadata = {
  title: "N'Ko Translator | French Connect",
  description: "Translate between N'Ko, English, and French languages",
}

export default function TranslatorPage() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">N'Ko Translator</h2>
      </div>
      
      <TranslatorContainer />
    </div>
  )
}
