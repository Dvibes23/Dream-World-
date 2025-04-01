import { SignUpForm } from "@/components/auth/signup-form"
import { AuthLayout } from "@/components/auth/auth-layout"

export default function SignUpPage() {
  return (
    <AuthLayout
      title="Create an account"
      description="Enter your details below to create your account and start with $1 billion"
    >
      <SignUpForm />
    </AuthLayout>
  )
}

