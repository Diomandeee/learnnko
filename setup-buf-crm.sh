#!/bin/bash

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

print_colored() {
    local color=$1
    local message=$2
    echo -e "${color}${message}${NC}"
}

# Create config file
print_colored $BLUE "Creating config file..."
mkdir -p src/config
cat > "src/config/site.ts" << 'EOF'
const siteConfig = {
  name: "BUF BARISTA CRM",
  baseUrl: process.env.NODE_ENV === "production" 
    ? "https://bufbarista-crm.vercel.app"
    : "http://localhost:3000",
} as const

export default siteConfig
EOF

# Update QR code generation function
print_colored $BLUE "Updating QR code generation utility..."
cat > "src/lib/qr/generate.ts" << 'EOF'
import QRCode from 'qrcode'
import siteConfig from '@/config/site'

export async function generateQRCode(shortCode: string): Promise<string> {
  try {
    // Use site config for base URL
    const baseUrl = siteConfig.baseUrl
    const url = `${baseUrl}/r/${shortCode}`
    
    console.log('Generating QR code for URL:', url) // Debug log
    
    const qrDataUrl = await QRCode.toDataURL(url, {
      width: 400,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#ffffff',
      },
    })
    
    return qrDataUrl
  } catch (error) {
    console.error('Error generating QR code:', error)
    throw error
  }
}
EOF

# Create redirect page for QR codes
print_colored $BLUE "Creating QR redirect page..."
mkdir -p "src/app/r/[shortCode]"
cat > "src/app/r/[shortCode]/page.tsx" << 'EOF'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db/prisma'

export default async function RedirectPage({
  params: { shortCode },
}: {
  params: { shortCode: string }
}) {
  const qrCode = await prisma.qRCode.findUnique({
    where: { shortCode },
  })

  if (!qrCode || !qrCode.isActive) {
    redirect('/404')
  }

  // Log the redirect for analytics
  console.log(`Redirecting ${shortCode} to ${qrCode.defaultUrl}`)
  
  redirect(qrCode.defaultUrl)
}
EOF

print_colored $GREEN "Updates complete! 🚀"
print_colored $BLUE "Next steps:"
echo "1. Run 'npx prisma generate' to update the Prisma client"
echo "2. Run 'npx prisma db push' to update the database schema"
echo "3. Commit changes and deploy to Vercel"
echo "4. Test QR code generation and redirection"

print_colored $BLUE "To test locally:"
echo "1. Start your development server"
echo "2. Generate a QR code"
echo "3. Check the console for the generated URL"
echo "4. Scan the QR code to verify redirection"

print_colored $RED "Important:"
echo "Make sure your production domain is accessible and properly configured in Vercel"