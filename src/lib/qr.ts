import QRCode from 'qrcode'

export async function generateQRCode(shortCode: string): Promise<string> {
  try {
    // Generate URL for the QR code
    const url = `${process.env.NEXT_PUBLIC_APP_URL}/r/${shortCode}`
    
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
