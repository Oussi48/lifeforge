import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface MealCompletion {
  date: string
  dayIndex: number
  mealIndex: number
  completed: boolean
}

interface MealTrackingState {
  completions: MealCompletion[]
  toggleCompletion: (date: string, dayIndex: number, mealIndex: number) => void
  isCompleted: (date: string, dayIndex: number, mealIndex: number) => boolean
  getDayProgress: (date: string, dayIndex: number, totalMeals: number) => number
  getTotalProgress: (date: string) => number
}

export const useMealTrackingStore = create<MealTrackingState>()(
  persist(
    (set, get) => ({
      completions: [],

      toggleCompletion: (date, dayIndex, mealIndex) => {
        set((state) => {
          const existing = state.completions.findIndex(
            (c) => c.date === date && c.dayIndex === dayIndex && c.mealIndex === mealIndex
          )
          if (existing >= 0) {
            const newCompletions = [...state.completions]
            newCompletions.splice(existing, 1)
            return { completions: newCompletions }
          } else {
            return {
              completions: [
                ...state.completions,
                { date, dayIndex, mealIndex, completed: true }
              ]
            }
          }
        })
      },

      isCompleted: (date, dayIndex, mealIndex) => {
        return get().completions.some(
          (c) => c.date === date && c.dayIndex === dayIndex && c.mealIndex === mealIndex
        )
      },

      getDayProgress: (date, dayIndex, totalMeals) => {
        const completed = get().completions.filter(
          (c) => c.date === date && c.dayIndex === dayIndex
        ).length
        return totalMeals > 0 ? (completed / totalMeals) * 100 : 0
      },

      getTotalProgress: (date) => {
        const today = new Date(date || new Date().toISOString().split('T')[0])
        const dayOfWeek = today.getDay()
        
        let dayIndex = 0
        if (dayOfWeek >= 1 && dayOfWeek <= 3) {
          dayIndex = dayOfWeek - 1
        } else if (dayOfWeek >= 4 && dayOfWeek <= 6) {
          dayIndex = dayOfWeek - 4
        } else if (dayOfWeek === 0) {
          dayIndex = 0
        }
        
        const possibleMeals = dayIndex === 0 && today.getDay() === 0 ? 3 : 
                         dayIndex === 0 ? 3 : 3
        
        const completed = get().completions.filter(
          (c) => c.date === date
        ).length
        
        return possibleMeals > 0 ? (completed / possibleMeals) * 100 : 0
      }
    }),
    {
      name: 'meal-tracking-storage'
    }
  )
)