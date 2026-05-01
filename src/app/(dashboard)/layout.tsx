'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Header } from '@/components/layout/header'
import { useAuthStore } from '@/stores/auth-store'
import { useHabitsStore } from '@/stores/habits-store'
import { useNutritionStore } from '@/stores/nutrition-store'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const { user, isLoading, initialize } = useAuthStore()
  const { fetchHabits } = useHabitsStore()
  const { fetchTodayLogs } = useNutritionStore()
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    const init = async () => {
      await initialize()
      setIsInitialized(true)
    }
    init()
  }, [initialize])

  useEffect(() => {
    if (!isLoading && !user && isInitialized) {
      router.push('/login')
    }
  }, [user, isLoading, router, isInitialized])

  useEffect(() => {
    if (user) {
      fetchHabits()
      fetchTodayLogs()
    }
  }, [user, fetchHabits, fetchTodayLogs])

  if (isLoading || !isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container px-4 py-6 pb-20 md:pb-6">
        {children}
      </main>
    </div>
  )
}