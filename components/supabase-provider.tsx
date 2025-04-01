"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"

type SupabaseContextType = {
  session: any | null
  isLoading: boolean
  signInWithOtp: (email: string) => Promise<{ success: boolean; error?: any }>
  verifyOtp: (email: string, token: string) => Promise<{ success: boolean; error?: any }>
  signOut: () => Promise<void>
  user: any | null
}

const SupabaseContext = createContext<SupabaseContextType | undefined>(undefined)

export function SupabaseProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<any | null>(null)
  const [user, setUser] = useState<any | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClientComponentClient({
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
    supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  })

  useEffect(() => {
    const getSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      setSession(session)
      setUser(session?.user || null)
      setIsLoading(false)
    }

    getSession()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user || null)
      router.refresh()
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase, router])

  const signInWithOtp = async (email: string) => {
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) {
        throw error
      }

      toast({
        title: "Verification code sent",
        description: "Please check your email for the verification code.",
      })

      return { success: true }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to send verification code",
        description: error.message,
      })
      return { success: false, error }
    }
  }

  const verifyOtp = async (email: string, token: string) => {
    try {
      const { error, data } = await supabase.auth.verifyOtp({
        email,
        token,
        type: "email",
      })

      if (error) {
        throw error
      }

      // Check if this is a new user (no wallet yet)
      if (data?.user) {
        const { data: walletData } = await supabase.from("wallets").select("*").eq("user_id", data.user.id).single()

        // If no wallet exists, create one with $1B
        if (!walletData) {
          const { error: walletError } = await supabase.from("wallets").insert([
            {
              user_id: data.user.id,
              balance: 1000000000, // $1 billion
            },
          ])

          if (walletError) throw walletError

          toast({
            title: "Account created!",
            description: "Welcome to Dream World! You now have $1,000,000,000 in your wallet.",
          })
        } else {
          toast({
            title: "Welcome back!",
            description: "You've successfully signed in.",
          })
        }
      }

      router.push("/dashboard")
      return { success: true }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Verification failed",
        description: error.message,
      })
      return { success: false, error }
    }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    router.push("/")
    toast({
      title: "Signed out",
      description: "You've been successfully signed out.",
    })
  }

  return (
    <SupabaseContext.Provider
      value={{
        session,
        isLoading,
        signInWithOtp,
        verifyOtp,
        signOut,
        user,
      }}
    >
      {children}
    </SupabaseContext.Provider>
  )
}

export const useSupabase = () => {
  const context = useContext(SupabaseContext)
  if (context === undefined) {
    throw new Error("useSupabase must be used within a SupabaseProvider")
  }
  return context
}

