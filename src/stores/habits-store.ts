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
      console.log('No user found')
      set({ isLoading: false, error: 'Not authenticated' })
      return
    }

    console.log('Fetching habits for user:', user.id)

    // First fetch habits
    const { data: habitsData, error: habitsError } = await supabase
      .from('habits')
      .select('*')
      .eq('user_id', user.id)

    console.log('Habits data:', habitsData, 'Error:', habitsError)

    if (habitsError) {
      console.log('Habits error:', habitsError)
      set({ isLoading: false, error: habitsError.message })
      return
    }

    if (!habitsData || habitsData.length === 0) {
      console.log('No habits found for user')
      set({ habits: [], isLoading: false })
      return
    }

    // Then fetch entries for each habit
    const habitsWithEntries = await Promise.all(
      habitsData.map(async (habit) => {
        console.log('Fetching entries for habit:', habit.id)
        const { data: entries } = await supabase
          .from('habit_entries')
          .select('*')
          .eq('habit_id', habit.id)
        
        console.log('Entries for habit', habit.id, ':', entries)
        return { ...habit, entries: entries || [] }
      })
    )

    const habitsWithStreaks = habitsWithEntries.map((habit) => ({
      ...habit,
      streak: getStreak(habit.entries || [])
    }))

    console.log('Final habits with streaks:', habitsWithStreaks)
    set({ habits: habitsWithStreaks, isLoading: false })
  },

  toggleHabit: async (habitId, date = getTodayISO()) => {
    const supabase = createClient()
    const { habits } = get()
    const habit = habits.find(h => h.id === habitId)
    if (!habit) {
      console.log('Habit not found:', habitId)
      return
    }

    const entries = habit.entries || []
    const existingEntry = entries.find(e => e.date === date)
    const isCompleted = existingEntry?.completed || false

    console.log('Toggling habit:', habitId, 'date:', date, 'isCompleted:', isCompleted)

    // Optimistic update
    set(state => ({
      habits: state.habits.map(h => {
        if (h.id !== habitId) return h
        const newEntries = isCompleted
          ? (h.entries || []).filter(e => e.date !== date)
          : [...(h.entries || []), { id: '', habit_id: habitId, date, completed: true, created_at: '' }]
        return {
          ...h,
          entries: newEntries,
          streak: getStreak(newEntries)
        }
      })
    }))

    // Server update
    if (isCompleted) {
      console.log('Deleting entry for:', habitId, date)
      await supabase
        .from('habit_entries')
        .delete()
        .match({ habit_id: habitId, date })
    } else {
      console.log('Inserting entry for:', habitId, date)
      const { data, error } = await supabase
        .from('habit_entries')
        .upsert({
          habit_id: habitId,
          date,
          completed: true
        }, {
          onConflict: 'habit_id,date'
        })
        .select()
      
      console.log('Upsert result:', data, 'error:', error)
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