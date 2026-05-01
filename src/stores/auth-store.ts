import { create } from 'zustand'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@/lib/types'

interface AuthState {
  user: User | null
  isLoading: boolean
  initialize: () => Promise<void>
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>
  signUp: (email: string, password: string) => Promise<{ error: Error | null }>
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
  updateProfile: (updates: Partial<User>) => Promise<void>
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoading: true,

  initialize: async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profile) {
        // Verificar si tiene hábitos, si no, crear
        const { data: habits } = await supabase
          .from('habits')
          .select('id')
          .eq('user_id', user.id)
          .limit(1)

        if (!habits || habits.length === 0) {
          const defaultHabits = [
            { name: 'No Smoking', slug: 'no-smoking', icon: '🚭', color: '#ef4444' },
            { name: 'Gym', slug: 'gym', icon: '🏋️', color: '#10b981' },
            { name: 'Prayer', slug: 'prayer', icon: '🙏', color: '#3b82f6' }
          ]
          for (const habit of defaultHabits) {
            await supabase.from('habits').insert({
              user_id: user.id,
              name: habit.name,
              slug: habit.slug,
              icon: habit.icon,
              color: habit.color,
              is_default: true
            })
          }
        }

        set({
          user: {
            id: user.id,
            email: user.email!,
            ...profile,
            goal_calories: profile.goal_calories || 2000,
            goal_protein: profile.goal_protein || 150,
            theme: profile.theme || 'dark'
          },
          isLoading: false
        })
      } else {
        // Crear perfil si no existe (para usuarios OAuth)
        await supabase.from('profiles').insert({
          id: user.id,
          goal_calories: 2000,
          goal_protein: 150,
          theme: 'dark'
        })
        
        // Crear hábitos por defecto
        const defaultHabits = [
          { name: 'No Smoking', slug: 'no-smoking', icon: '🚭', color: '#ef4444' },
          { name: 'Gym', slug: 'gym', icon: '🏋️', color: '#10b981' },
          { name: 'Prayer', slug: 'prayer', icon: '🙏', color: '#3b82f6' }
        ]
        for (const habit of defaultHabits) {
          await supabase.from('habits').insert({
            user_id: user.id,
            name: habit.name,
            slug: habit.slug,
            icon: habit.icon,
            color: habit.color,
            is_default: true
          })
        }
        
        set({
          user: {
            id: user.id,
            email: user.email!,
            goal_calories: 2000,
            goal_protein: 150,
            theme: 'dark'
          },
          isLoading: false
        })
      }
    } else {
      set({ user: null, isLoading: false })
    }
  },

  signIn: async (email, password) => {
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (!error) {
      await get().initialize()
    }

    return { error: error as Error | null }
  },

  signUp: async (email, password) => {
    const supabase = createClient()
    
    // Primero intentar eliminar el trigger problemático
    try {
      await supabase.rpc('drop_trigger_if_exists')
    } catch {
      // Ignore si no existe la función
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password
    })

    if (!error && data.user) {
      // Pequeña pausa para que se complete el registro
      await new Promise(resolve => setTimeout(resolve, 500))
      
      try {
        // 1. Crear perfil automáticamente
        await supabase.from('profiles').insert({
          id: data.user.id,
          goal_calories: 2000,
          goal_protein: 150,
          theme: 'dark'
        })

        // 2. Crear hábitos por defecto
        const defaultHabits = [
          { name: 'No Smoking', slug: 'no-smoking', icon: '🚭', color: '#ef4444' },
          { name: 'Gym', slug: 'gym', icon: '🏋️', color: '#10b981' },
          { name: 'Prayer', slug: 'prayer', icon: '🙏', color: '#3b82f6' }
        ]

        for (const habit of defaultHabits) {
          await supabase.from('habits').insert({
            user_id: data.user.id,
            name: habit.name,
            slug: habit.slug,
            icon: habit.icon,
            color: habit.color,
            is_default: true
          })
        }
      } catch (err) {
        console.error('Error creating profile/habits:', err)
      }
      
      await get().initialize()
    }

    return { error: error as Error | null }
  },

  signInWithGoogle: async () => {
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/dashboard`
      }
    })
    
    if (error) {
      console.error('Google sign in error:', error)
    }
  },

  signOut: async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    set({ user: null })
  },

  updateProfile: async (updates) => {
    const { user } = get()
    if (!user) return

    const supabase = createClient()
    await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id)

    set({ user: { ...user, ...updates } })
  }
}))