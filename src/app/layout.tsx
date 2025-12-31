import type { Metadata } from "next"
import { Space_Grotesk, JetBrains_Mono } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/components/auth/auth-provider"

const spaceGrotesk = Space_Grotesk({ 
  subsets: ["latin"],
  variable: "--font-display",
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: 'swap',
})

export const metadata: Metadata = {
  title: "N'Ko Learning Hub | French Connect",
  description: "Comprehensive N'Ko language learning with conversation, translation, and transcription",
  keywords: ["N'Ko", "Manding", "West African languages", "script learning", "language education"],
  authors: [{ name: "N'Ko Hub Team" }],
  creator: "N'Ko Hub",
  publisher: "N'Ko Hub",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: "/nko_logo.svg",
    shortcut: "/nko_logo.svg",
    apple: "/nko_logo.svg",
  },
  openGraph: {
    title: "N'Ko Learning Hub | Master the N'Ko Script",
    description: "Comprehensive N'Ko language learning with conversation, translation, and transcription. Learn the ancient West African script through modern technology.",
    url: "https://learnnko.com",
    siteName: "N'Ko Learning Hub",
    images: [
      {
        url: "/nko_hub_logo.svg",
        width: 400,
        height: 120,
        alt: "N'Ko Learning Hub Logo",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "N'Ko Learning Hub | Master the N'Ko Script",
    description: "Comprehensive N'Ko language learning with conversation, translation, and transcription",
    creator: "@nkohub",
    images: ["/nko_hub_logo.svg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning className="dark">
      <body className={`${spaceGrotesk.variable} ${jetbrainsMono.variable} font-display min-h-screen antialiased`}>
        <AuthProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            {children}
            <Toaster />
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
