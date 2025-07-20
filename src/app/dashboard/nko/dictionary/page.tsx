import { Metadata } from "next"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { WordCategories } from "@/components/nko/dictionary/word-categories"
import { SavedWords } from "@/components/nko/dictionary/saved-words"
import { NkoDictionarySearch } from "@/components/nko/dictionary/nko-dictionary-search"
import { ExternalSearch } from "@/components/nko/dictionary/external/external-search"

export const metadata: Metadata = {
  title: "N'Ko Dictionary | Language Connect",
  description: "Search for translations between N'Ko, English, and French",
}

export default function NkoDictionaryPage() {
  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">N'Ko Dictionary</h2>
      </div>
      
      <Tabs defaultValue="nko">
        <TabsList>
          <TabsTrigger value="nko">N'Ko Dictionary</TabsTrigger>
          <TabsTrigger value="bambara">Bambara Dictionary</TabsTrigger>
        </TabsList>
        
        <TabsContent value="nko" className="pt-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <NkoDictionarySearch />
            </div>
            
            <div className="space-y-6">
              <WordCategories />
              <SavedWords />
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="bambara" className="pt-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <ExternalSearch />
            </div>
            
            <div className="space-y-6">
              <WordCategories />
              <SavedWords />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
