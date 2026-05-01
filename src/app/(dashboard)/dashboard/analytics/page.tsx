'use client'

import { useMemo } from 'react'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useHabitsStore } from '@/stores/habits-store'
import { useNutritionStore } from '@/stores/nutrition-store'
import { Flame, Target, Utensils, TrendingUp } from 'lucide-react'
import { getTodayISO, formatDate } from '@/lib/utils'
import { useAuthStore } from '@/stores/auth-store'
import { useI18n } from '@/lib/i18n-provider'

export default function AnalyticsPage() {
  const { habits } = useHabitsStore()
  const { logs, getTotals } = useNutritionStore()
  const { user } = useAuthStore()
  const { t } = useI18n()

  const weeklyData = useMemo(() => {
    const data = []
    const today = new Date()
    const calorieGoal = user?.goal_calories || 2000
    const proteinGoal = user?.goal_protein || 150

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]
      
      const dayLogs = logs.filter(l => l.date === dateStr)
      const calories = dayLogs.reduce((sum, l) => sum + l.calories, 0)
      const protein = dayLogs.reduce((sum, l) => sum + l.protein, 0)
      
      const completedHabits = habits.filter(h => {
        const entry = (h.entries || []).find(e => e.date === dateStr)
        return entry?.completed
      }).length

      data.push({
        date: dateStr,
        label: date.toLocaleDateString('es-ES', { weekday: 'short' }),
        calories,
        protein: Math.round(protein),
        caloriesGoal: calorieGoal,
        proteinGoal,
        habitsCompleted: completedHabits,
        totalHabits: habits.length
      })
    }
    return data
  }, [logs, habits, user])

  const stats = useMemo(() => {
    const totalCalories = logs.reduce((sum, l) => sum + l.calories, 0)
    const totalProtein = logs.reduce((sum, l) => sum + l.protein, 0)
    const avgCalories = logs.length > 0 ? Math.round(totalCalories / 7) : 0
    const avgProtein = logs.length > 0 ? Math.round(totalProtein / 7) : 0
    
    const maxStreak = Math.max(...habits.map(h => h.streak || 0), 0)
    const totalCompletions = habits.reduce((sum, h) => {
      return sum + (h.entries || []).filter(e => e.completed).length
    }, 0)

    return {
      totalCalories,
      totalProtein,
      avgCalories,
      avgProtein,
      maxStreak,
      totalCompletions,
      daysLogged: new Set(logs.map(l => l.date)).size
    }
  }, [logs, habits])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t.analytics.title}</h1>
        <p className="text-muted-foreground">
          {t.analytics.subtitle}
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-500/20">
                <Flame className="h-6 w-6 text-orange-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">{t.dashboard.currentStreak}</p>
                <p className="text-2xl font-bold">{stats.maxStreak} {t.dashboard.dayStreak}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/20">
                <Target className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">{t.habits.completed}</p>
                <p className="text-2xl font-bold">{stats.totalCompletions}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/20">
                <Utensils className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">{t.nutrition.calories} avg</p>
                <p className="text-2xl font-bold">{stats.avgCalories}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/20">
                <TrendingUp className="h-6 w-6 text-purple-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Días registrados</p>
                <p className="text-2xl font-bold">{stats.daysLogged}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="nutrition" className="space-y-4">
        <TabsList>
          <TabsTrigger value="nutrition">{t.nutrition.title}</TabsTrigger>
          <TabsTrigger value="habits">{t.habits.title}</TabsTrigger>
        </TabsList>

        <TabsContent value="nutrition" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t.analytics.weeklyOverview} - {t.nutrition.calories}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weeklyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="label" 
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                    />
                    <YAxis 
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    <Bar 
                      dataKey="calories" 
                      fill="hsl(var(--primary))" 
                      radius={[4, 4, 0, 0]}
                      name={t.nutrition.calories}
                    />
                    <Bar 
                      dataKey="caloriesGoal" 
                      fill="hsl(var(--muted))" 
                      radius={[4, 4, 0, 0]}
                      name="Objetivo"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t.analytics.weeklyOverview} - {t.nutrition.protein}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={weeklyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="label" 
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                    />
                    <YAxis 
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="protein" 
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      dot={{ fill: 'hsl(var(--primary))' }}
                      name={t.nutrition.protein}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="proteinGoal" 
                      stroke="hsl(var(--muted))"
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      dot={false}
                      name="Objetivo"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="habits" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t.analytics.habitCompletion}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weeklyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="label" 
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                    />
                    <YAxis 
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                      allowDecimals={false}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                      formatter={(value, name) => [
                        `${value} / ${weeklyData[0]?.totalHabits || 3}`,
                        name === 'habitsCompleted' ? t.habits.completed : name
                      ]}
                    />
                    <Bar 
                      dataKey="habitsCompleted" 
                      fill="hsl(var(--primary))" 
                      radius={[4, 4, 0, 0]}
                      name={t.habits.completed}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}