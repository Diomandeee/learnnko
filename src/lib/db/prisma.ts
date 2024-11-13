import { PrismaClient } from '@prisma/client'

const globalForPrisma = global as unknown as { prisma: PrismaClient }

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ['query'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma


export async function getQRCodeById(id: string) {
  try {
    const qrCode = await prisma.qRCode.findUnique({
      where: { id },
      include: {
        folder: true,
        deviceRules: true,
        scheduleRules: true,
      },
    })
    
    if (!qrCode) {
      return null
    }

    return qrCode
  } catch (error) {
    console.error("Error fetching QR code:", error)
    throw new Error("Failed to fetch QR code")
  }
}