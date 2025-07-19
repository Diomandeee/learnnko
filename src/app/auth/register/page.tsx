import { Metadata } from "next"
import { RegisterForm } from "@/components/auth/register-form"

export const metadata: Metadata = {
  title: "Create Account | Learn N'Ko",
  description: "Join thousands learning N'Ko script and Manding languages",
}

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            ߒߞߏ
          </h1>
          <p className="text-muted-foreground mt-2">
            Learn N'Ko Script & Manding Languages
          </p>
        </div>
        <RegisterForm />
      </div>
    </div>
  )
} 