import { redirect } from "next/navigation"

export default function DashboardPage() {
  // Redirect to the new N'Ko learning hub
  redirect("/nko")
}