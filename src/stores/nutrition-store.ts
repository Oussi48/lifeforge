import { create } from 'zustand'
import { createClient } from '@/lib/supabase/client'
import type { NutritionLog } from '@/lib/types'
import { getTodayISO } from '@/lib/utils'

interface NutritionState {
  logs: NutritionLog[]
  isLoading: boolean
  error: string | null
  fetchTodayLogs: (date?: string) => Promise<void>
  addLog: (log: Omit<NutritionLog, 'id' | 'created_at' | 'user_id'>) => Promise<void>
  updateLog: (id: string, updates: Partial<NutritionLog>) => Promise<void>
  deleteLog: (id: string) => Promise<void>
  getTotals: () => { calories: number; protein: number }
}

export const useNutritionStore = create<NutritionState>((set, get) => ({
  logs: [],
  isLoading: false,
  error: null,

  fetchTodayLogs: async (date = getTodayISO()) => {
    set({ isLoading: true, error: null })
    const supabase = createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      set({ isLoading: false, error: 'Not authenticated' })
      return
    }

    const { data, error } = await supabase
      .from('nutrition_logs')
      .select('*')
      .eq('user_id', user.id)
      .eq('date', date)
      .order('created_at', { ascending: true })

    if (error) {
      set({ isLoading: false, error: error.message })
      return
    }

    set({ logs: data || [], isLoading: false })
  },

  addLog: async (logData) => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data, error } = await supabase
      .from('nutrition_logs')
      .insert({
        user_id: user.id,
        ...logData
      })
      .select()
      .single()

    if (!error && data) {
      set(state => ({
        logs: [...state.logs, data]
      }))
    }
  },

  updateLog: async (id, updates) => {
    const supabase = createClient()
    await supabase
      .from('nutrition_logs')
      .update(updates)
      .eq('id', id)

    set(state => ({
      logs: state.logs.map(log =>
        log.id === id ? { ...log, ...updates } : log
      )
    }))
  },

  deleteLog: async (id) => {
    const supabase = createClient()
    await supabase
      .from('nutrition_logs')
      .delete()
      .eq('id', id)

    set(state => ({
      logs: state.logs.filter(log => log.id !== id)
    }))
  },

  getTotals: () => {
    const { logs } = get()
    return logs.reduce(
      (acc, log) => ({
        calories: acc.calories + log.calories,
        protein: acc.protein + log.protein
      }),
      { calories: 0, protein: 0 }
    )
  }
}))