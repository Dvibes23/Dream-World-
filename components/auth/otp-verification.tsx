"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useSupabase } from "@/components/supabase-provider"

const otpSchema = z.object({
  otp: z.string().min(6, {
    message: "Verification code must be at least 6 characters.",
  }),
})

interface OtpVerificationProps {
  email: string
}

export function OtpVerification({ email }: OtpVerificationProps) {
  const { verifyOtp, signInWithOtp } = useSupabase()
  const [isLoading, setIsLoading] = useState(false)
  const [isResending, setIsResending] = useState(false)

  const form = useForm<z.infer<typeof otpSchema>>({
    resolver: zodResolver(otpSchema),
    defaultValues: {
      otp: "",
    },
  })

  async function onSubmit(values: z.infer<typeof otpSchema>) {
    setIsLoading(true)
    try {
      await verifyOtp(email, values.otp)
    } finally {
      setIsLoading(false)
    }
  }

  async function resendCode() {
    setIsResending(true)
    try {
      await signInWithOtp(email)
    } finally {
      setIsResending(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-medium">Verify your email</h3>
        <p className="text-sm text-muted-foreground mt-1">We&apos;ve sent a verification code to {email}</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="otp"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Verification Code</FormLabel>
                <FormControl>
                  <Input placeholder="Enter code" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Verifying..." : "Verify"}
          </Button>
        </form>
      </Form>

      <div className="text-center">
        <Button variant="link" onClick={resendCode} disabled={isResending} className="text-sm">
          {isResending ? "Sending..." : "Didn't receive a code? Resend"}
        </Button>
      </div>
    </div>
  )
}

