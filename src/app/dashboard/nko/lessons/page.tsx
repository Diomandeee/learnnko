import { redirect } from "next/navigation"

export default function DashboardNkoLessonsPage() {
  // Redirect to the new N'Ko lessons page
  redirect("/nko/lessons")
}
