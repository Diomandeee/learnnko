import { redirect } from "next/navigation"

export default function DashboardNkoDictionaryPage() {
  // Redirect to the new N'Ko dictionary page
  redirect("/nko/dictionary")
}
