import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/components/auth/auth-provider"

const inter = Inter({ subsets: ["latin"] })

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
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 min-h-screen`}>
        <AuthProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
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