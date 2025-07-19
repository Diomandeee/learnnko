"use client"

import { NkoTranslator } from "@/components/nko/translate/nko-translator"

export default function NkoTranslatorPage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">N'Ko Translator</h1>
          <p className="text-muted-foreground">
            Bidirectional translation between French/English and N'Ko with history tracking
          </p>
        </div>
      </div>

      <NkoTranslator onTranslationSave={(text, translation) => console.log('Translation saved:', text, translation)} />
    </div>
  )
} 