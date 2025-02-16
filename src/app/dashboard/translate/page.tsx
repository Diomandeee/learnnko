import { Metadata } from "next"
import { TranslateContainer } from "@/components/translate/translate-container"
import { PageContainer } from "@/components/layout/page-container"

export const metadata: Metadata = {
  title: "Translate | BUF BARISTA CRM",
  description: "Translate and save words to your word bank",
}

export default function TranslatePage() {
  return (
    <PageContainer>
      <div className="space-y-6 p-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Translate</h1>
          <p className="text-muted-foreground">
            Translate text, save words, and build your vocabulary
          </p>
        </div>

        <TranslateContainer />
      </div>
    </PageContainer>
  )
}