import { Metadata } from "next"
import { LoginForm } from "@/components/auth/login-form"

export const metadata: Metadata = {
  title: "Sign In | Learn N'Ko",
  description: "Sign in to continue your N'Ko learning journey",
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            ߒߞߏ
          </h1>
          <p className="text-muted-foreground mt-2">
            Learn N'Ko Script & Manding Languages
          </p>
        </div>
        <LoginForm />
      </div>
    </div>
  )
} 