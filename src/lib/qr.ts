import QRCode from 'qrcode'

export async function generateQRCode(shortCode: string): Promise<string> {
  try {
    if (!process.env.NEXT_PUBLIC_APP_URL) {
      throw new Error('NEXT_PUBLIC_APP_URL environment variable is not set')
    }

    // Generate URL for the QR code
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, '') // Remove trailing slash if present
    const url = `${baseUrl}/r/${shortCode}`
    
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