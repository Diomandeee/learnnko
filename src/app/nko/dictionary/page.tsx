import { Metadata } from "next"
import { NkoDictionarySearch } from "@/components/nko/dictionary/nko-dictionary-search"

export const metadata: Metadata = {
  title: "N'Ko Dictionary | French Connect",
  description: "Search and explore the comprehensive N'Ko dictionary",
}

export default function NkoDictionaryPage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">N'Ko Dictionary</h1>
          <p className="text-muted-foreground">
            Search and explore N'Ko words, phrases, and their meanings
          </p>
        </div>
      </div>

      <NkoDictionarySearch />
    </div>
  )
} 