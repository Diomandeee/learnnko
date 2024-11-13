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

# 1. First, update QR generation utility
print_colored $BLUE "Updating QR generation utility..."

cat > "src/lib/qr/generate.ts" << 'EOF'
import QRCode from 'qrcode'

// Hardcode the base URL since environment variables are unreliable
const SITE_URL = "https://bufbarista-crm.vercel.app"

export async function generateQRCode(shortCode: string): Promise<string> {
  try {
    // Generate URL for the QR code
    const url = `${SITE_URL}/r/${shortCode}`
    
    console.log('Generating QR code for URL:', url) // Debug log
    
    // Generate QR code as data URL
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

# 2. Update image route handler
print_colored $BLUE "Updating image route handler..."

cat > "src/app/api/qr/[id]/image/route.ts" << 'EOF'
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db/prisma"

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const id = url.pathname.split("/").slice(-2, -1)[0]

    const qrCode = await prisma.qRCode.findUnique({
      where: { id },
    })

    if (!qrCode) {
      return new NextResponse("QR Code not found", { status: 404 })
    }

    // Generate the URL directly here for debugging
    const SITE_URL = "https://bufbarista-crm.vercel.app"
    const redirectUrl = `${SITE_URL}/r/${qrCode.shortCode}`
    
    console.log('Generated QR URL:', redirectUrl) // Debug log

    const qrDataUrl = await QRCode.toDataURL(redirectUrl, {
      width: 400,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#ffffff',
      },
    })

    return NextResponse.json({ imageData: qrDataUrl })
  } catch (error) {
    console.error("[QR_CODE_IMAGE_ERROR]", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}
EOF

# 3. Create a config file for the site URL
print_colored $BLUE "Creating site config..."

mkdir -p src/config
cat > "src/config/site.ts" << 'EOF'
export const siteConfig = {
  name: "BUF BARISTA CRM",
  url: "https://bufbarista-crm.vercel.app"
} as const
EOF

# 4. Create a utilities file for QR functions
print_colored $BLUE "Creating QR utilities..."

mkdir -p src/lib/utils
cat > "src/lib/utils/qr.ts" << 'EOF'
import { siteConfig } from "@/config/site"

export function generateRedirectUrl(shortCode: string): string {
  return `${siteConfig.url}/r/${shortCode}`
}
EOF

print_colored $GREEN "Updates complete! 🚀"
print_colored $BLUE "Key changes:"
echo "1. Hardcoded site URL instead of using env variables"
echo "2. Added consistent URL generation"
echo "3. Added more debug logging"
echo "4. Centralized site configuration"

print_colored $BLUE "Testing steps:"
echo "1. Deploy these changes"
echo "2. Create a new QR code"
echo "3. Check browser console for the generated URL"
echo "4. Scan the QR code to verify it works"

print_colored $RED "Important:"
echo "Make sure the site URL matches your deployed domain exactly"