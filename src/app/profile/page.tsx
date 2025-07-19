import { Metadata } from "next"
import { ProfileDashboard } from "@/components/profile/profile-dashboard"

export const metadata: Metadata = {
  title: "Profile | Learn N'Ko",
  description: "View your learning progress, achievements, and profile settings",
}

export default function ProfilePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <ProfileDashboard />
    </div>
  )
} 