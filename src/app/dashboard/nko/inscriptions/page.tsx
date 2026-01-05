/**
 * N'Ko Dashboard
 *
 * Main hub for N'Ko learning and inscriptions with tabs for:
 * - Chat: N'Ko conversation practice
 * - Translate: N'Ko translation tools
 * - Lessons: N'Ko learning lessons
 * - Dictionary: N'Ko and Bambara dictionaries
 * - Practice: N'Ko practice exercises
 * - Keyboard: N'Ko input keyboard
 * - Library: Saved texts and vocabulary
 * - French: French conversation practice
 * - Inscriptions: Live motion-derived N'Ko statements
 */

'use client';

import * as React from 'react';
import { useSearchParams } from 'next/navigation';
import {
  MessageCircle,
  Languages,
  BookOpen,
  Upload,
  Keyboard,
  Archive,
  Activity,
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { CosmicBackground } from '@/components/cosmic/CosmicBackground';
import { NkoConversation } from '@/components/nko/conversation/nko-conversation';
import { TranslatorContainer } from '@/components/nko/translator/translator-container';
import { NkoLessonList } from '@/components/nko/lessons/nko-lesson-list';
import { NkoDictionarySearch } from '@/components/nko/dictionary/nko-dictionary-search';
import { ExternalSearch } from '@/components/nko/dictionary/external/external-search';
import { WordCategories } from '@/components/nko/dictionary/word-categories';
import { SavedWords } from '@/components/nko/dictionary/saved-words';
import { NkoPracticeHub } from '@/components/nko/practice/nko-practice-hub';
import { NkoKeyboard } from '@/components/nko/input/nko-keyboard';
import { ConversationTab } from '@/components/translate/conversation-tab';
import { InscriptionTicker } from '@/components/inscription/live/InscriptionTicker';
import { InscriptionStream } from '@/components/inscription/live/InscriptionStream';
import { ClaimLegend, ClaimLegendInline } from '@/components/inscription/live/ClaimLegend';

function NkoDashboardContent() {
  const searchParams = useSearchParams();
  const tabFromUrl = searchParams.get('tab') || 'conversation';
  const [activeTab, setActiveTab] = React.useState(tabFromUrl);
  const [showDetailedView, setShowDetailedView] = React.useState(false);

  // Update active tab when URL changes
  React.useEffect(() => {
    const newTab = searchParams.get('tab') || 'conversation';
    setActiveTab(newTab);
  }, [searchParams]);

  return (
    <div className="min-h-screen relative overflow-hidden bg-space-950">
      {/* Cosmic Background */}
      <CosmicBackground showFloatingChars variant="default" />

      {/* Page Content */}
      <div className="relative z-10 container mx-auto px-3 sm:px-4 md:px-6 pt-4 sm:pt-6 md:pt-8 pb-8 md:pb-12 max-w-7xl">
        {/* Tab Contents - Navigation is in header */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 sm:space-y-6">
          <TabsContent value="conversation">
            <NkoConversation />
          </TabsContent>

          <TabsContent value="translate">
            <TranslatorContainer />
          </TabsContent>

          <TabsContent value="lessons">
            <NkoLessonList />
          </TabsContent>

          <TabsContent value="dictionary">
            <Tabs defaultValue="nko">
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="nko" className="text-sm">N&apos;Ko Dictionary</TabsTrigger>
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

          <TabsContent value="practice">
            <NkoPracticeHub />
          </TabsContent>

          <TabsContent value="keyboard">
            <div className="space-y-4 lg:grid lg:grid-cols-3 lg:gap-4 lg:space-y-0">
              <div className="lg:col-span-2">
                <Card className="p-6 border-amber-500/20 bg-gradient-to-br from-space-800/80 to-space-900/80">
                  <NkoKeyboard onCharacterClick={(char) => console.log(char)} />
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="library">
            <Card className="p-8 text-center border-amber-500/20 bg-gradient-to-br from-space-800/80 to-space-900/80">
              <Archive className="h-12 w-12 mx-auto mb-4 text-amber-400" />
              <h3 className="text-lg font-semibold mb-2 text-amber-300">Library</h3>
              <p className="text-sm text-gray-300 max-w-md mx-auto">
                Your saved texts and vocabulary collection
              </p>
            </Card>
          </TabsContent>

          <TabsContent value="french">
            <ConversationTab />
          </TabsContent>

          <TabsContent value="inscriptions">
            <div className="space-y-4 lg:grid lg:grid-cols-4 lg:gap-6 lg:space-y-0">
              {/* Main Content - Ticker or Detailed Stream */}
              <div className="lg:col-span-3">
                {showDetailedView ? (
                  <div className="space-y-4">
                    <InscriptionStream />
                    <button
                      onClick={() => setShowDetailedView(false)}
                      className="flex items-center gap-2 text-sm text-amber-400 hover:text-amber-300 transition-colors"
                    >
                      <Activity className="h-4 w-4" />
                      Back to simple stream
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <InscriptionTicker
                      onShowDetails={() => setShowDetailedView(true)}
                      maxItems={100}
                      className="rounded-lg"
                    />
                    {/* Inline legend below ticker on mobile */}
                    <div className="lg:hidden">
                      <ClaimLegendInline className="rounded-lg" />
                    </div>
                  </div>
                )}
              </div>

              {/* Sidebar - Claim Legend (visible on desktop) */}
              <div className="hidden lg:block">
                <ClaimLegend
                  compact={false}
                  collapsible={true}
                  defaultCollapsed={false}
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default function NkoDashboard() {
  return (
    <React.Suspense fallback={<div className="min-h-screen relative overflow-hidden bg-space-950"><div className="relative z-10 container mx-auto px-3 sm:px-4 md:px-6 pt-4 sm:pt-6 md:pt-8">Loading...</div></div>}>
      <NkoDashboardContent />
    </React.Suspense>
  );
}
