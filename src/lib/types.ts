export interface User {
  id: string
  email: string
  full_name?: string
  avatar_url?: string
  weight?: number
  height?: number
  goal_calories: number
  goal_protein: number
  theme: 'dark' | 'light'
}

export interface Habit {
  id: string
  user_id: string
  name: string
  slug: string
  icon: string
  color: string
  frequency: 'daily' | 'weekly' | 'custom'
  target_days: number[]
  is_default: boolean
  created_at: string
  entries?: HabitEntry[]
  streak?: number
  isCompleted?: boolean
}

export interface HabitEntry {
  id: string
  habit_id: string
  date: string
  completed: boolean
  note?: string
  created_at: string
}

export interface NutritionLog {
  id: string
  user_id: string
  food_name: string
  quantity: number
  calories: number
  protein: number
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack'
  date: string
  created_at: string
}

export interface DailyNutrition {
  calories_total: number
  protein_total: number
  entries_count: number
}

export interface DashboardStats {
  totalHabits: number
  completedToday: number
  currentStreak: number
  todayCalories: number
  todayProtein: number
  calorieGoal: number
  proteinGoal: number
}

export interface ChartData {
  date: string
  calories: number
  protein: number
  habitsCompleted: number
}