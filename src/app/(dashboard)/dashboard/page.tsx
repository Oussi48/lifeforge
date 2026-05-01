'use client'

import { useEffect, useState } from 'react'
import { Flame, Target, Utensils, TrendingUp } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { useHabitsStore } from '@/stores/habits-store'
import { useNutritionStore } from '@/stores/nutrition-store'
import { useAuthStore } from '@/stores/auth-store'
import { cn, getProgressColor, calculateProgress, getTodayISO } from '@/lib/utils'
import { useI18n } from '@/lib/i18n-provider'
import Link from 'next/link'

export default function DashboardPage() {
  const { habits, fetchHabits, getTodayHabits, getTotalStreak, isLoading: habitsLoading } = useHabitsStore()
  const { logs, fetchTodayLogs, getTotals, isLoading: nutritionLoading } = useNutritionStore()
  const { user } = useAuthStore()
  const { t } = useI18n()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (user && mounted && habits.length === 0) {
      fetchHabits()
      fetchTodayLogs()
    }
  }, [user, mounted, habits.length])

  if (!mounted || habitsLoading || nutritionLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  const todayHabits = getTodayHabits()
  const completedHabits = todayHabits.filter(h => h.isCompleted).length
  const totalHabits = todayHabits.length
  const streak = getTotalStreak()
  const totals = getTotals()
  const calorieGoal = user?.goal_calories || 2000
  const proteinGoal = user?.goal_protein || 150
  const today = getTodayISO()

  const caloriePercentage = calculateProgress(totals.calories, calorieGoal)
  const proteinPercentage = calculateProgress(totals.protein, proteinGoal)

  const calorieColor = getProgressColor(totals.calories, calorieGoal)
  const proteinColor = getProgressColor(totals.protein, proteinGoal)

  if (!mounted) {
    return null
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t.dashboard.title}</h1>
          <p className="text-muted-foreground">
            {t.dashboard.welcomeBack}
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gradient-to-br from-orange-500/20 to-orange-600/10 border-orange-500/30">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-500/20">
                <Flame className="h-6 w-6 text-orange-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">{t.dashboard.currentStreak}</p>
                <p className="text-2xl font-bold">{streak} {t.dashboard.dayStreak}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-primary/20 to-primary/10 border-primary/30">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/20">
                <Target className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">{t.dashboard.habitsToday}</p>
                <p className="text-2xl font-bold">{completedHabits}/{totalHabits}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500/20 to-blue-600/10 border-blue-500/30">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/20">
                <Utensils className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">{t.dashboard.calories}</p>
                <p className="text-2xl font-bold">{totals.calories}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/20 to-purple-600/10 border-purple-500/30">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/20">
                <TrendingUp className="h-6 w-6 text-purple-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">{t.dashboard.protein}</p>
                <p className="text-2xl font-bold">{totals.protein.toFixed(1)}g</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress Section */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">{t.dashboard.calories}</CardTitle>
            <span className="text-sm text-muted-foreground">
              {totals.calories} / {calorieGoal}
            </span>
          </CardHeader>
          <CardContent>
            <Progress 
              value={caloriePercentage} 
              className="h-3"
              indicatorClassName={cn(
                'rounded-full',
                caloriePercentage >= 100 ? 'bg-danger' :
                caloriePercentage >= 90 ? 'bg-danger' :
                caloriePercentage >= 70 ? 'bg-warning' : 'bg-primary'
              )}
            />
            <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
              <span>{caloriePercentage.toFixed(0)}%</span>
              <span className={cn(
                caloriePercentage >= 100 ? 'text-danger' :
                caloriePercentage >= 90 ? 'text-warning' : 'text-primary'
              )}>
                {caloriePercentage >= 100 ? t.dashboard.overLimit :
                 caloriePercentage >= 90 ? t.dashboard.nearLimit : t.dashboard.onTrack}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">{t.dashboard.protein}</CardTitle>
            <span className="text-sm text-muted-foreground">
              {totals.protein.toFixed(0)}g / {proteinGoal}g
            </span>
          </CardHeader>
          <CardContent>
            <Progress 
              value={proteinPercentage} 
              className="h-3"
              indicatorClassName={cn(
                'rounded-full',
                proteinPercentage >= 100 ? 'bg-danger' :
                proteinPercentage >= 90 ? 'bg-danger' :
                proteinPercentage >= 70 ? 'bg-warning' : 'bg-primary'
              )}
            />
            <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
              <span>{proteinPercentage.toFixed(0)}%</span>
              <span className={cn(
                proteinPercentage >= 100 ? 'text-danger' :
                proteinPercentage >= 90 ? 'text-warning' : 'text-primary'
              )}>
                {proteinPercentage >= 100 ? t.dashboard.overLimit :
                 proteinPercentage >= 90 ? t.dashboard.nearLimit : t.dashboard.onTrack}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Today's Habits */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>{t.dashboard.todayHabits}</span>
            <Link 
              href="/dashboard/habits" 
              className="text-sm font-normal text-primary hover:underline"
            >
              {t.dashboard.viewAll}
            </Link>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {todayHabits.map((habit) => (
              <div
                key={habit.id}
                className={cn(
                  'flex items-center justify-between p-3 rounded-lg border transition-all',
                  habit.isCompleted 
                    ? 'bg-primary/10 border-primary/30' 
                    : 'bg-muted/50'
                )}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{habit.icon}</span>
                  <div>
                    <p className="font-medium">{habit.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {habit.streak || 0} {t.dashboard.dayStreak}
                    </p>
                  </div>
                </div>
                <div className={cn(
                  'h-3 w-3 rounded-full',
                  habit.isCompleted ? 'bg-primary' : 'bg-muted'
                )} />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Today's Food Log */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>{t.dashboard.todayFood}</span>
            <Link 
              href="/dashboard/nutrition" 
              className="text-sm font-normal text-primary hover:underline"
            >
              {t.dashboard.addFood}
            </Link>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {logs.length > 0 ? (
            <div className="space-y-2">
              {logs.slice(0, 5).map((log) => (
                <div
                  key={log.id}
                  className="flex items-center justify-between p-2 rounded-lg bg-muted/50"
                >
                  <div>
                    <p className="font-medium">{log.food_name}</p>
                    <p className="text-sm text-muted-foreground">
                      {log.quantity}g • {log.meal_type}
                    </p>
                  </div>
                  <div className="text-right text-sm">
                    <span className="text-primary">{log.calories} cal</span>
                    <span className="text-muted-foreground"> • {log.protein}g</span>
                  </div>
                </div>
              ))}
              {logs.length > 5 && (
                <p className="text-center text-sm text-muted-foreground">
                  + {logs.length - 5} more items
                </p>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Utensils className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>{t.dashboard.noFoodLogged}</p>
              <Link 
                href="/dashboard/nutrition" 
                className="text-sm text-primary hover:underline"
              >
                {t.dashboard.addFirstMeal}
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}