import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  })
}

export function formatDateISO(date: Date): string {
  return date.toISOString().split('T')[0]
}

export function getTodayISO(): string {
  return formatDateISO(new Date())
}

export function getStreak(entries: { date: string; completed: boolean }[]): number {
  if (!entries || entries.length === 0) return 0
  
  const sortedEntries = [...entries]
    .filter(e => e.completed)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  
  if (sortedEntries.length === 0) return 0
  
  let streak = 0
  let currentDate = new Date()
  currentDate.setHours(0, 0, 0, 0)
  
  for (const entry of sortedEntries) {
    const entryDate = new Date(entry.date)
    entryDate.setHours(0, 0, 0, 0)
    
    const diffDays = Math.floor(
      (currentDate.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24)
    )
    
    if (diffDays === streak || diffDays === streak + 1) {
      streak++
      currentDate = entryDate
    } else {
      break
    }
  }
  
  return streak
}

export function getProgressColor(current: number, target: number): string {
  const percentage = (current / target) * 100
  
  if (percentage >= 100) return '#ef4444' // red - exceeded
  if (percentage >= 90) return '#ef4444'  // red - near limit
  if (percentage >= 70) return '#f59e0b' // yellow - warning
  return '#10b981' // green - safe
}

export function calculateProgress(current: number, target: number): number {
  if (target === 0) return 0
  return Math.min((current / target) * 100, 100)
}