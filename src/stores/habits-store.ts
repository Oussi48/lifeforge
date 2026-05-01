import { create } from 'zustand'
import { createClient } from '@/lib/supabase/client'
import type { Habit, HabitEntry } from '@/lib/types'
import { getStreak, getTodayISO } from '@/lib/utils'

interface HabitsState {
  habits: Habit[]
  isLoading: boolean
  error: string | null
  fetchHabits: () => Promise<void>
  toggleHabit: (habitId: string, date?: string) => Promise<void>
  addHabit: (habit: Omit<Habit, 'id' | 'created_at' | 'user_id'>) => Promise<void>
  deleteHabit: (habitId: string) => Promise<void>
  getTodayHabits: () => Habit[]
  getTotalStreak: () => number
}

export const useHabitsStore = create<HabitsState>((set, get) => ({
  habits: [],
  isLoading: false,
  error: null,

  fetchHabits: async () => {
    set({ isLoading: true, error: null })
    const supabase = createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      set({ isLoading: false, error: 'Not authenticated' })
      return
    }

    // First fetch habits
    const { data: habitsData, error: habitsError } = await supabase
      .from('habits')
      .select('*')
      .eq('user_id', user.id)

    if (habitsError) {
      set({ isLoading: false, error: habitsError.message })
      return
    }

    if (!habitsData || habitsData.length === 0) {
      set({ habits: [], isLoading: false })
      return
    }

    // Then fetch entries for each habit
    const habitsWithEntries = await Promise.all(
      habitsData.map(async (habit) => {
        const { data: entries } = await supabase
          .from('habit_entries')
          .select('*')
          .eq('habit_id', habit.id)
        
        return { ...habit, entries: entries || [] }
      })
    )

    const habitsWithStreaks = habitsWithEntries.map((habit) => ({
      ...habit,
      streak: getStreak(habit.entries || [])
    }))

    set({ habits: habitsWithStreaks, isLoading: false })
  },

  toggleHabit: async (habitId, date = getTodayISO()) => {
    const supabase = createClient()
    const { habits, fetchHabits } = get()
    const habit = habits.find(h => h.id === habitId)
    if (!habit) return

    const entries = habit.entries || []
    const existingEntry = entries.find(e => e.date === date)
    const isCompleted = existingEntry?.completed || false

    // Update local state first (optimistic)
    set(state => ({
      habits: state.habits.map(h => {
        if (h.id !== habitId) return h
        const newEntries = isCompleted
          ? (h.entries || []).filter(e => e.date !== date)
          : [...(h.entries || []), { id: crypto.randomUUID(), habit_id: habitId, date, completed: true, created_at: new Date().toISOString() }]
        return {
          ...h,
          entries: newEntries,
          streak: getStreak(newEntries)
        }
      })
    }))

    // Then update server
    try {
      if (isCompleted) {
        await supabase
          .from('habit_entries')
          .delete()
          .match({ habit_id: habitId, date })
      } else {
        // Use insert instead of upsert for better compatibility
        const { error } = await supabase
          .from('habit_entries')
          .insert({
            habit_id: habitId,
            date,
            completed: true
          })
        
        if (error && error.code !== '23505') { // Ignore duplicate key error
          console.error('Error inserting habit entry:', error)
        }
      }
    } catch (err) {
      console.error('Toggle error:', err)
    }
  },

  addHabit: async (habitData) => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    await supabase
      .from('habits')
      .insert({
        user_id: user.id,
        ...habitData
      })

    await get().fetchHabits()
  },

  deleteHabit: async (habitId) => {
    const supabase = createClient()
    await supabase
      .from('habits')
      .delete()
      .eq('id', habitId)

    await get().fetchHabits()
  },

  getTodayHabits: () => {
    const { habits } = get()
    const today = getTodayISO()
    return habits.map(habit => {
      const entry = (habit.entries || []).find(e => e.date === today)
      return {
        ...habit,
        isCompleted: entry?.completed || false
      }
    })
  },

  getTotalStreak: () => {
    const { habits } = get()
    if (habits.length === 0) return 0
    return Math.max(...habits.map(h => h.streak || 0))
  }
}))