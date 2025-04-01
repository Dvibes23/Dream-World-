"use client"

import { useState } from "react"
import Link from "next/link"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useSupabase } from "@/components/supabase-provider"
import { OtpVerification } from "@/components/auth/otp-verification"

const emailSchema = z.object({
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
})

export function LoginForm() {
  const { signInWithOtp } = useSupabase()
  const [isLoading, setIsLoading] = useState(false)
  const [showVerification, setShowVerification] = useState(false)
  const [email, setEmail] = useState("")

  const form = useForm<z.infer<typeof emailSchema>>({
    resolver: zodResolver(emailSchema),
    defaultValues: {
      email: "",
    },
  })

  async function onSubmit(values: z.infer<typeof emailSchema>) {
    setIsLoading(true)
    try {
      const { success } = await signInWithOtp(values.email)
      if (success) {
        setEmail(values.email)
        setShowVerification(true)
      }
    } finally {
      setIsLoading(false)
    }
  }

  if (showVerification) {
    return <OtpVerification email={email} />
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="john@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Sending verification code..." : "Send verification code"}
        </Button>
        <div className="text-center text-sm">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="underline">
            Sign up
          </Link>
        </div>
      </form>
    </Form>
  )
}

