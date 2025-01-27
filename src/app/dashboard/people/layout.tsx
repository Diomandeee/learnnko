// src/app/dashboard/people/layout.tsx
import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"

export default async function PeopleLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession()

  if (!session) {
    redirect("/login")
  }

  return (
    <div className="relative min-h-screen">
      {children}
    </div>
  )
}