"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  MessageCircle,
  Languages,
  Mic,
  Keyboard,
  Archive,
  BookOpen,
  Upload,
  FileText,
  Save,
  Star,
  Volume2
} from "lucide-react"
import { TranslatorContainer } from "@/components/nko/translator/translator-container"

import { NkoConversation } from "@/components/nko/conversation/nko-conversation"
import { NkoTranslator } from "@/components/nko/translate/nko-translator" 
import { NkoTranscriber } from "@/components/nko/transcriber/nko-transcriber"
import { NkoKeyboard } from "@/components/nko/input/nko-keyboard"
import { NkoLessonList } from "@/components/nko/lessons/nko-lesson-list"
import { NkoDictionarySearch } from "@/components/nko/dictionary/nko-dictionary-search"
import { ExternalSearch } from "@/components/nko/dictionary/external/external-search"
import { WordCategories } from "@/components/nko/dictionary/word-categories"
import { SavedWords } from "@/components/nko/dictionary/saved-words"
import { NkoPracticeHub } from "@/components/nko/practice/nko-practice-hub"
import { TranslatorQuickAccess } from "@/components/nko/translate/translator-quick-access"

interface SavedText {
  id: string
  text: string
  translation?: string
  notes?: string
  createdAt: Date
  isFavorite?: boolean
}

interface VocabularyItem {
  word: string
  translation: string
  definition?: string
  createdAt: Date
}

export function NkoLearningHub() {
  const [stats, setStats] = useState({
    messagesCount: 0,
    wordsLearned: 0,
    savedTexts: 0,
    vocabulary: 0
  })
  
  const [savedTexts, setSavedTexts] = useState<SavedText[]>([])
  const [vocabulary, setVocabulary] = useState<VocabularyItem[]>([])
  const [nkoInput, setNkoInput] = useState("")

  useEffect(() => {
    loadSavedTexts()
    loadVocabulary()
  }, [])

  const loadSavedTexts = useCallback(async () => {
    try {
      const response = await fetch('/api/nko/saved-texts')
      const data = await response.json()
      const texts = data.texts?.map((text: string, index: number) => ({
        id: `saved-${index}`,
        text: text,
        translation: "",
        createdAt: new Date(),
        isFavorite: false
      })) || []
      setSavedTexts(texts)
      setStats(prev => ({ ...prev, savedTexts: texts.length }))
    } catch (error) {
      console.error('Error loading saved texts:', error)
    }
  }, [])

  const loadVocabulary = useCallback(async () => {
    try {
      const response = await fetch('/api/wordbank')
      const data = await response.json()
      setVocabulary(data || [])
      setStats(prev => ({ ...prev, vocabulary: data?.length || 0 }))
    } catch (error) {
      console.error('Error loading vocabulary:', error)
    }
  }, [])

  const handleStatsUpdate = useCallback((conversationStats: { messagesCount: number; wordsLearned: number }) => {
    setStats(prev => ({
      ...prev,
      messagesCount: conversationStats.messagesCount,
      wordsLearned: conversationStats.wordsLearned
    }))
  }, [])

  const handleTranslationSave = useCallback((nkoText: string, translation: string) => {
    loadSavedTexts() // Refresh the saved texts
  }, [loadSavedTexts])

  const handleTextSave = useCallback((nkoText: string, translation: string) => {
    loadSavedTexts() // Refresh the saved texts
  }, [loadSavedTexts])

  return (
    <div className="space-y-8">
      {/* Enhanced Header */}
      <Card className="border-0 shadow-xl bg-gradient-to-r from-emerald-50 via-teal-50 to-cyan-50">
        <CardHeader className="pb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center shadow-lg">
                <Languages className="w-8 h-8 text-white" />
              </div>
              <div>
                <CardTitle className="text-3xl font-bold bg-gradient-to-r from-emerald-700 to-teal-700 bg-clip-text text-transparent">
                  N'Ko Learning Hub
                </CardTitle>
                <p className="text-lg text-slate-600 mt-1">
                  Comprehensive N'Ko language learning with conversation, translation, and transcription
                </p>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-emerald-600">{stats.messagesCount}</div>
                <div className="text-sm text-slate-600">Messages</div>
              </div>
              <div className="w-px h-12 bg-slate-300"></div>
              <div className="text-center">
                <div className="text-2xl font-bold text-teal-600">{stats.vocabulary}</div>
                <div className="text-sm text-slate-600">Words Learned</div>
              </div>
              <div className="w-px h-12 bg-slate-300"></div>
              <div className="text-center">
                <div className="text-2xl font-bold text-cyan-600">{stats.savedTexts}</div>
                <div className="text-sm text-slate-600">Saved Texts</div>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Main Interface */}
      <Tabs defaultValue="conversation" className="space-y-6">
        <Card className="border-0 shadow-lg">
          <CardContent className="p-2">
            <TabsList className="grid w-full grid-cols-7 gap-1 bg-slate-100/50">
          <TabsTrigger value="conversation" className="text-xs">
            <MessageCircle className="w-3 h-3 mr-1" />
            Chat
          </TabsTrigger>
          <TabsTrigger value="translate" className="text-xs">
            <Languages className="w-3 h-3 mr-1" />
            Translate
          </TabsTrigger>
          <TabsTrigger value="lessons" className="text-xs">
            <BookOpen className="w-3 h-3 mr-1" />
            Lessons
          </TabsTrigger>
          <TabsTrigger value="dictionary" className="text-xs">
            <BookOpen className="w-3 h-3 mr-1" />
            Dictionary
          </TabsTrigger>
          <TabsTrigger value="practice" className="text-xs">
            <BookOpen className="w-3 h-3 mr-1" />
            Practice
          </TabsTrigger>
          <TabsTrigger value="keyboard" className="text-xs">
            <Keyboard className="w-3 h-3 mr-1" />
            Keyboard
          </TabsTrigger>
          <TabsTrigger value="library" className="text-xs">
            <Archive className="w-3 h-3 mr-1" />
            Library
          </TabsTrigger>
        </TabsList>
          </CardContent>
        </Card>

        {/* Conversation Tab */}
        <TabsContent value="conversation">
          <NkoConversation onStatsUpdate={handleStatsUpdate} />
        </TabsContent>

        {/* Translation Tab */}
        <TabsContent value="translate">
          <TranslatorContainer />
        </TabsContent>

        {/* Lessons Tab */}
        <TabsContent value="lessons">
          <div className="space-y-4">
            <NkoLessonList />
          </div>
        </TabsContent>

        {/* Dictionary Tab */}
        <TabsContent value="dictionary">
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
        </TabsContent>

        {/* Practice Tab */}
        <TabsContent value="practice">
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">N'Ko Practice</h2>
            <NkoPracticeHub />
          </div>
        </TabsContent>

        {/* N'Ko Keyboard Tab */}
        <TabsContent value="keyboard">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="md:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Keyboard className="w-5 h-5" />
                    N'Ko Keyboard & Input
                  </CardTitle>
                  <CardDescription>
                    Type in N'Ko script with transliteration support
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <NkoKeyboard onCharacterClick={(char) => setNkoInput(prev => prev + char)} />
                  
                  {nkoInput && (
                    <div className="mt-4 space-y-2">
                      <label className="text-sm font-medium">N'Ko Text Output</label>
                      <div className="p-4 bg-muted rounded-md border">
                        <p className="text-lg font-nko">{nkoInput}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => {
                          navigator.clipboard.writeText(nkoInput)
                        }}>
                          Copy N'Ko Text
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => setNkoInput("")}>
                          Clear
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <div>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <Save className="w-4 h-4 mr-2" />
                    Save Text
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <Languages className="w-4 h-4 mr-2" />
                    Translate
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <Volume2 className="w-4 h-4 mr-2" />
                    Listen
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Library Tab */}
        <TabsContent value="library">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Saved Texts */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Saved N'Ko Texts
                </CardTitle>
                <CardDescription>
                  Your collection of N'Ko texts and translations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  {savedTexts.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No saved texts yet</p>
                      <p className="text-sm mt-1">Save translations to build your library</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {savedTexts.map((text) => (
                        <div key={text.id} className="p-3 border rounded-md space-y-2">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className="text-lg font-nko mb-1">{text.text}</p>
                              {text.translation && (
                                <p className="text-sm text-muted-foreground">{text.translation}</p>
                              )}
                              {text.notes && (
                                <p className="text-xs text-muted-foreground mt-1">{text.notes}</p>
                              )}
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSavedTexts(prev => prev.map(t => 
                                  t.id === text.id ? { ...t, isFavorite: !t.isFavorite } : t
                                ))
                              }}
                            >
                              <Star className={`w-4 h-4 ${text.isFavorite ? 'fill-yellow-400 text-yellow-400' : ''}`} />
                            </Button>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {text.createdAt.toLocaleDateString()}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Vocabulary Bank */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  Vocabulary Bank
                </CardTitle>
                <CardDescription>
                  N'Ko words and phrases you've learned
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  {vocabulary.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No vocabulary yet</p>
                      <p className="text-sm mt-1">Add words during conversations and translations</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {vocabulary.map((word, index) => (
                        <div key={index} className="p-3 border rounded-md">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">{word.word}</p>
                              <p className="text-sm text-muted-foreground">{word.translation}</p>
                              {word.definition && (
                                <p className="text-xs text-muted-foreground mt-1">{word.definition}</p>
                              )}
                            </div>
                            <Button variant="ghost" size="sm">
                              <Volume2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Quick Access Widgets */}
      <div className="mt-8">
        <TranslatorQuickAccess compact={true} />
      </div>
    </div>
  )
} 