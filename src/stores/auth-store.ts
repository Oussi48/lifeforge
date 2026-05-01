import { create } from 'zustand'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@/lib/types'
import { ADMIN_EMAIL } from '@/lib/diet-plan'

interface AuthState {
  user: User | null
  isPremium: boolean
  isLoading: boolean
  initialize: () => Promise<void>
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>
  signUp: (email: string, password: string) => Promise<{ error: Error | null }>
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
  updateProfile: (updates: Partial<User>) => Promise<void>
  checkPremiumStatus: () => Promise<boolean>
  grantPremiumAccess: (userId: string) => Promise<void>
  revokePremiumAccess: (userId: string) => Promise<void>
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isPremium: false,
  isLoading: true,

  checkPremiumStatus: async () => {
    const { user } = get()
    if (!user) return false
    
    const supabase = createClient()
    const { data } = await supabase
      .from('premium_users')
      .select('is_active')
      .eq('user_id', user.id)
      .single()
    
    const isPremium = data?.is_active === true
    set({ isPremium })
    return isPremium
  },

  grantPremiumAccess: async (userId: string) => {
    const { user: adminUser } = get()
    if (!adminUser || adminUser.email !== ADMIN_EMAIL) return
    
    const supabase = createClient()
    const { data: targetUser } = await supabase
      .from('profiles')
      .select('email')
      .eq('id', userId)
      .single()
    
    if (targetUser) {
      await supabase.from('premium_users').upsert({
        user_id: userId,
        email: targetUser.email,
        granted_by: adminUser.id,
        is_active: true
      })
    }
  },

  revokePremiumAccess: async (userId: string) => {
    const { user: adminUser } = get()
    if (!adminUser || adminUser.email !== ADMIN_EMAIL) return
    
    const supabase = createClient()
    await supabase
      .from('premium_users')
      .update({ is_active: false })
      .eq('user_id', userId)
  },

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
            { name: 'rezar', slug: 'rezar', icon: '🙏', color: '#3b82f6' }
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
        
        // Verificar estado premium después de cargar usuario
        await get().checkPremiumStatus()
        
        // Si es admin, garantizar acceso premium
        if (user.email === ADMIN_EMAIL) {
          const isAdmin = await get().checkPremiumStatus()
          if (!isAdmin) {
            await get().grantPremiumAccess(user.id)
            set({ isPremium: true })
          }
        }
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
          { name: 'rezar', slug: 'rezar', icon: '🙏', color: '#3b82f6' }
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
        
        // Verificar estado premium
        await get().checkPremiumStatus()
        
        // Si es admin, garantizar acceso premium
        if (user.email === ADMIN_EMAIL) {
          await get().grantPremiumAccess(user.id)
          set({ isPremium: true })
        }
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
          { name: 'rezar', slug: 'rezar', icon: '🙏', color: '#3b82f6' }
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