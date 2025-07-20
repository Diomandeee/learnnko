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
import { ConversationTab } from "@/components/translate/conversation-tab"

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
    <div className="space-y-4 md:space-y-6 lg:space-y-8 px-1 md:px-0">
      {/* Enhanced Header - Mobile Responsive */}
      <Card className="border-0 shadow-xl bg-gradient-to-r from-emerald-50 via-teal-50 to-cyan-50">
        <CardHeader className="pb-4 md:pb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            {/* Title Section */}
            <div className="flex items-center gap-3 md:gap-4">
              <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl md:rounded-2xl flex items-center justify-center shadow-lg">
                <Languages className="w-6 h-6 md:w-8 md:h-8 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl md:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-emerald-700 to-teal-700 bg-clip-text text-transparent">
                  N'Ko Learning Hub
                </CardTitle>
                <p className="text-sm md:text-base lg:text-lg text-slate-600 mt-1 hidden md:block">
                  Comprehensive N'Ko language learning platform
                </p>
              </div>
            </div>
            
            {/* Stats Section - Responsive */}
            <div className="grid grid-cols-3 gap-4 lg:flex lg:items-center lg:gap-6">
              <div className="text-center">
                <div className="text-lg md:text-xl lg:text-2xl font-bold text-emerald-600">{stats.messagesCount}</div>
                <div className="text-xs md:text-sm text-slate-600">Messages</div>
              </div>
              <div className="text-center">
                <div className="text-lg md:text-xl lg:text-2xl font-bold text-teal-600">{stats.vocabulary}</div>
                <div className="text-xs md:text-sm text-slate-600">Words</div>
              </div>
              <div className="text-center">
                <div className="text-lg md:text-xl lg:text-2xl font-bold text-cyan-600">{stats.savedTexts}</div>
                <div className="text-xs md:text-sm text-slate-600">Saved</div>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Main Interface - Mobile Responsive Tabs */}
      <Tabs defaultValue="conversation" className="space-y-4 md:space-y-6">
        <Card className="border-0 shadow-lg">
          <CardContent className="p-1 md:p-2">
            {/* Mobile: Scrollable horizontal tabs */}
            <div className="md:hidden">
              <ScrollArea className="w-full whitespace-nowrap">
                <TabsList className="inline-flex h-12 items-center justify-start rounded-md bg-slate-100/50 p-1 text-muted-foreground">
                  <TabsTrigger value="conversation" className="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium">
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Chat
                  </TabsTrigger>
                  <TabsTrigger value="translate" className="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium">
                    <Languages className="w-4 h-4 mr-2" />
                    Translate
                  </TabsTrigger>
                  <TabsTrigger value="lessons" className="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium">
                    <BookOpen className="w-4 h-4 mr-2" />
                    Lessons
                  </TabsTrigger>
                  <TabsTrigger value="dictionary" className="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium">
                    <BookOpen className="w-4 h-4 mr-2" />
                    Dictionary
                  </TabsTrigger>
                  <TabsTrigger value="practice" className="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium">
                    <Upload className="w-4 h-4 mr-2" />
                    Practice
                  </TabsTrigger>
                  <TabsTrigger value="keyboard" className="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium">
                    <Keyboard className="w-4 h-4 mr-2" />
                    Keyboard
                  </TabsTrigger>
                  <TabsTrigger value="library" className="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium">
                    <Archive className="w-4 h-4 mr-2" />
                    Library
                  </TabsTrigger>
                  <TabsTrigger value="french" className="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium">
                    <MessageCircle className="w-4 h-4 mr-2" />
                    French
                  </TabsTrigger>
                </TabsList>
              </ScrollArea>
            </div>

            {/* Tablet: Grid layout */}
            <div className="hidden md:block lg:hidden">
              <TabsList className="grid w-full grid-cols-4 gap-1 bg-slate-100/50 mb-2">
                <TabsTrigger value="conversation" className="flex items-center gap-2 py-3">
                  <MessageCircle className="w-4 h-4" />
                  <span>Chat</span>
                </TabsTrigger>
                <TabsTrigger value="translate" className="flex items-center gap-2 py-3">
                  <Languages className="w-4 h-4" />
                  <span>Translate</span>
                </TabsTrigger>
                <TabsTrigger value="lessons" className="flex items-center gap-2 py-3">
                  <BookOpen className="w-4 h-4" />
                  <span>Lessons</span>
                </TabsTrigger>
                <TabsTrigger value="dictionary" className="flex items-center gap-2 py-3">
                  <BookOpen className="w-4 h-4" />
                  <span>Dictionary</span>
                </TabsTrigger>
              </TabsList>
              <TabsList className="grid w-full grid-cols-4 gap-1 bg-slate-100/50">
                <TabsTrigger value="practice" className="flex items-center gap-2 py-3">
                  <Upload className="w-4 h-4" />
                  <span>Practice</span>
                </TabsTrigger>
                <TabsTrigger value="keyboard" className="flex items-center gap-2 py-3">
                  <Keyboard className="w-4 h-4" />
                  <span>Keyboard</span>
                </TabsTrigger>
                <TabsTrigger value="library" className="flex items-center gap-2 py-3">
                  <Archive className="w-4 h-4" />
                  <span>Library</span>
                </TabsTrigger>
                <TabsTrigger value="french" className="flex items-center gap-2 py-3">
                  <MessageCircle className="w-4 h-4" />
                  <span>French</span>
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Desktop: Single row with all tabs */}
            <TabsList className="hidden lg:grid w-full grid-cols-8 gap-1 bg-slate-100/50">
              <TabsTrigger value="conversation" className="flex items-center gap-2 py-3">
                <MessageCircle className="w-4 h-4" />
                Chat
              </TabsTrigger>
              <TabsTrigger value="translate" className="flex items-center gap-2 py-3">
                <Languages className="w-4 h-4" />
                Translate
              </TabsTrigger>
              <TabsTrigger value="lessons" className="flex items-center gap-2 py-3">
                <BookOpen className="w-4 h-4" />
                Lessons
              </TabsTrigger>
              <TabsTrigger value="dictionary" className="flex items-center gap-2 py-3">
                <BookOpen className="w-4 h-4" />
                Dictionary
              </TabsTrigger>
              <TabsTrigger value="practice" className="flex items-center gap-2 py-3">
                <Upload className="w-4 h-4" />
                Practice
              </TabsTrigger>
              <TabsTrigger value="keyboard" className="flex items-center gap-2 py-3">
                <Keyboard className="w-4 h-4" />
                Keyboard
              </TabsTrigger>
              <TabsTrigger value="library" className="flex items-center gap-2 py-3">
                <Archive className="w-4 h-4" />
                Library
              </TabsTrigger>
              <TabsTrigger value="french" className="flex items-center gap-2 py-3">
                <MessageCircle className="w-4 h-4" />
                French
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

        {/* Dictionary Tab - Mobile Responsive */}
        <TabsContent value="dictionary">
          <Tabs defaultValue="nko">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="nko" className="text-sm">N'Ko Dictionary</TabsTrigger>
              <TabsTrigger value="bambara" className="text-sm">Bambara Dictionary</TabsTrigger>
            </TabsList>
            
            <TabsContent value="nko" className="pt-2">
              <div className="space-y-4 lg:grid lg:grid-cols-3 lg:gap-6 lg:space-y-0">
                <div className="lg:col-span-2">
                  <NkoDictionarySearch />
                </div>
                
                <div className="space-y-4 lg:space-y-6">
                  <WordCategories />
                  <SavedWords />
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="bambara" className="pt-2">
              <div className="space-y-4 lg:grid lg:grid-cols-3 lg:gap-6 lg:space-y-0">
                <div className="lg:col-span-2">
                  <ExternalSearch />
                </div>
                
                <div className="space-y-4 lg:space-y-6">
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

        {/* N'Ko Keyboard Tab - Mobile Responsive */}
        <TabsContent value="keyboard">
          <div className="space-y-4 lg:grid lg:grid-cols-3 lg:gap-4 lg:space-y-0">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
                    <Keyboard className="w-5 h-5" />
                    N'Ko Keyboard & Input
                  </CardTitle>
                  <CardDescription className="text-sm">
                    Type in N'Ko script with transliteration support
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <NkoKeyboard onCharacterClick={(char) => setNkoInput(prev => prev + char)} />
                  
                  {nkoInput && (
                    <div className="mt-4 space-y-3">
                      <label className="text-sm font-medium">N'Ko Text Output</label>
                      <div className="p-3 md:p-4 bg-muted rounded-md border">
                        <p className="text-base md:text-lg font-nko leading-relaxed">{nkoInput}</p>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <Button variant="outline" size="sm" className="flex-1" onClick={() => {
                          navigator.clipboard.writeText(nkoInput)
                        }}>
                          Copy N'Ko Text
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1" onClick={() => setNkoInput("")}>
                          Clear
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="lg:mt-0">
              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="text-base md:text-lg">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button variant="outline" size="sm" className="w-full justify-start h-10">
                    <Save className="w-4 h-4 mr-2" />
                    Save Text
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start h-10">
                    <Languages className="w-4 h-4 mr-2" />
                    Translate
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start h-10">
                    <Volume2 className="w-4 h-4 mr-2" />
                    Listen
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Library Tab - Mobile Responsive */}
        <TabsContent value="library">
          <div className="space-y-4 md:grid md:grid-cols-2 md:gap-4 md:space-y-0">
            {/* Saved Texts */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <FileText className="w-5 h-5" />
                  Saved N'Ko Texts
                </CardTitle>
                <CardDescription className="text-sm">
                  Your collection of N'Ko texts and translations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-80 md:h-96">
                  {savedTexts.length === 0 ? (
                    <div className="text-center py-6 md:py-8 text-muted-foreground">
                      <FileText className="w-10 h-10 md:w-12 md:h-12 mx-auto mb-3 md:mb-4 opacity-50" />
                      <p className="text-sm md:text-base">No saved texts yet</p>
                      <p className="text-xs md:text-sm mt-1">Save translations to build your library</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {savedTexts.map((text) => (
                        <div key={text.id} className="p-3 border rounded-md space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <p className="text-base md:text-lg font-nko mb-1 break-words">{text.text}</p>
                              {text.translation && (
                                <p className="text-sm text-muted-foreground break-words">{text.translation}</p>
                              )}
                              {text.notes && (
                                <p className="text-xs text-muted-foreground mt-1 break-words">{text.notes}</p>
                              )}
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="shrink-0"
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
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <BookOpen className="w-5 h-5" />
                  Vocabulary Bank
                </CardTitle>
                <CardDescription className="text-sm">
                  N'Ko words and phrases you've learned
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-80 md:h-96">
                  {vocabulary.length === 0 ? (
                    <div className="text-center py-6 md:py-8 text-muted-foreground">
                      <BookOpen className="w-10 h-10 md:w-12 md:h-12 mx-auto mb-3 md:mb-4 opacity-50" />
                      <p className="text-sm md:text-base">No vocabulary yet</p>
                      <p className="text-xs md:text-sm mt-1">Add words during conversations and translations</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {vocabulary.map((word, index) => (
                        <div key={index} className="p-3 border rounded-md">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <p className="font-medium break-words">{word.word}</p>
                              <p className="text-sm text-muted-foreground break-words">{word.translation}</p>
                              {word.definition && (
                                <p className="text-xs text-muted-foreground mt-1 break-words">{word.definition}</p>
                              )}
                            </div>
                            <Button variant="ghost" size="sm" className="shrink-0">
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

        {/* French Conversation Tab */}
        <TabsContent value="french">
          <ConversationTab />
        </TabsContent>
      </Tabs>

      {/* Quick Access Widgets - Hidden on Mobile */}
      <div className="mt-4 md:mt-6 lg:mt-8 hidden md:block">
        <TranslatorQuickAccess compact={true} />
      </div>
    </div>
  )
} 