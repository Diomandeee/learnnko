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
