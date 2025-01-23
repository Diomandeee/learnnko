import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"

export default async function RoutesLayout({
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
