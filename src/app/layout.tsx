import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/components/auth/auth-provider";
import { Toaster } from "@/components/ui/toaster";
import Script from "next/script";

export const metadata: Metadata = {
  title: "BUF BARISTA CRM",
  description: "A CRM solution for managing contacts",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <Script
          src={`https://maps.googleapis.com/maps/api/js?key=AIzaSyDrfUenb2mg3cvQdeYW8KDL3EUVYTJPQBE&libraries=places`}
          strategy="beforeInteractive"
        />
      </head>
      <body className="bg-gray-50 text-gray-900">
        <AuthProvider>
          {children}
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}