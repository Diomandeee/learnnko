import { Metadata } from "next"
import { NkoKeyboard } from "@/components/nko/input/nko-keyboard"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Keyboard } from "lucide-react"

export const metadata: Metadata = {
  title: "N'Ko Keyboard | French Connect",
  description: "Virtual N'Ko keyboard for script input and practice",
}

export default function NkoKeyboardPage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">N'Ko Keyboard</h1>
          <p className="text-muted-foreground">
            Virtual N'Ko keyboard for script input and character recognition
          </p>
        </div>
      </div>

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
              <NkoKeyboard onCharacterClick={(char) => console.log('Character clicked:', char)} />
            </CardContent>
          </Card>
        </div>
        
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Instructions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <p>• Click characters to input N'Ko text</p>
                <p>• Use the virtual keyboard for proper script formation</p>
                <p>• Practice character recognition and typing</p>
                <p>• Text will appear with proper RTL direction</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 