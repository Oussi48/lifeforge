import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { type SupabaseClient } from '@supabase/supabase-js'

interface CookieSetOptions {
  name: string
  value: string
  options?: {
    path?: string
    expires?: Date
    domain?: string
    httpOnly?: boolean
    secure?: boolean
    sameSite?: 'lax' | 'strict' | 'none'
  }
}

export async function createClient(): Promise<SupabaseClient> {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key',
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet: CookieSetOptions[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
            })
          } catch {
            // Called from Server Component
          }
        },
      },
    }
  )
}