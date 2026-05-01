'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Flame, 
  CheckCircle2, 
  Circle,
  Coffee,
  Dumbbell,
  UtensilsCrossed,
  Clock,
  Target,
  TrendingDown,
  Sparkles,
  Award,
  Leaf,
  Sun,
  ChevronLeft,
  ChevronRight,
  Zap
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/stores/auth-store'
import { 
  ADMIN_EMAIL,
  ALL_PLANS,
  MON_WED_PLAN,
  THU_SAT_PLAN,
  SUNDAY_PLAN,
  ABS_TIPS,
  TRANSFORMATION_RESULTS,
  type DayPlan,
  type Meal,
  calculateDayTotals
} from '@/lib/diet-plan'
import { useMealTrackingStore } from '@/stores/meal-tracking-store'

const mealIcons = {
  breakfast: Coffee,
  'pre-workout': Dumbbell,
  dinner: UtensilsCrossed
}

const mealColors = {
  breakfast: 'from-amber-500/20 to-orange-500/10 border-amber-500/30',
  'pre-workout': 'from-blue-500/20 to-cyan-500/10 border-blue-500/30',
  dinner: 'from-purple-500/20 to-pink-500/10 border-purple-500/30'
}

const mealIconColors = {
  breakfast: 'text-amber-500',
  'pre-workout': 'text-blue-500',
  dinner: 'text-purple-500'
}

const translations = {
  title: 'Plan de Dieta Premium',
  premium: 'PREMIUM',
  todayCalories: 'Calorías de Hoy',
  todayProtein: 'Proteína de Hoy',
  weeklyGoal: 'Meta Semanal',
  progress: 'Progreso',
  dailyTimeline: 'Comidas de Hoy',
  weeklyPlans: 'Planes Semanales',
  week1: 'Semana 1',
  absFaster: 'Lo Que Te Ayudará a Ver Tus Abdominales',
  transformationTitle: 'Si Sigues Esto Estrictamente Durante 4 Semanas',
  stayConsistent: 'Mantente consistente. Los resultados vienen de la disciplina diaria.',
  cooking: 'Preparación:',
  moreItems: '+ más items',
  days: {
    monWed: 'Lun - Mié',
    thuSat: 'Jue - Sáb',
    sunday: 'Domingo'
  },
  daysOfWeek: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']
}

function getTodayIndex(): number {
  const day = new Date().getDay()
  if (day >= 1 && day <= 3) return day - 1
  if (day >= 4 && day <= 6) return day - 4
  return 0
}

function getCurrentDayPlan(): { day: DayPlan, planIndex: number, dayIndex: number } | null {
  const dayOfWeek = new Date().getDay()
  
  const dayMap: Record<number, { planIndex: number, dayIndex: number }> = {
    1: { planIndex: 0, dayIndex: 0 },  // Lunes -> Lun-Mié plan, día 0
    2: { planIndex: 0, dayIndex: 1 },  // Martes -> Lun-Mié plan, día 1
    3: { planIndex: 0, dayIndex: 2 }, // Miércoles -> Lun-Mié plan, día 2
    4: { planIndex: 1, dayIndex: 0 }, // Jueves -> Jue-Sáb plan, día 0
    5: { planIndex: 1, dayIndex: 1 }, // Viernes -> Jue-Sáb plan, día 1
    6: { planIndex: 1, dayIndex: 2 }, // Sábado -> Jue-Sáb plan, día 2
    0: { planIndex: 2, dayIndex: 0 }, // Domingo -> Domingo plan, día 0
  }
  
  const mapping = dayMap[dayOfWeek]
  if (!mapping) return null
  
  const plan = ALL_PLANS[mapping.planIndex]
  const day = plan.days[mapping.dayIndex]
  
  return { day, ...mapping }
}

function ProgressRing({ 
  progress, 
  size = 80, 
  strokeWidth = 6,
  color = 'text-primary',
  bgColor = 'text-muted',
  children 
}: { 
  progress: number
  size?: number
  strokeWidth?: number
  color?: string
  bgColor?: string
  children?: React.ReactNode
}) {
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const offset = circumference - (progress / 100) * circumference

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className={bgColor}
          opacity={0.2}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className={cn(color, 'transition-all duration-500 ease-out')}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        {children}
      </div>
    </div>
  )
}

function MealCard({ 
  meal, 
  dayIndex, 
  mealIndex,
  dayName,
  isToday = false
}: { 
  meal: Meal
  dayIndex: number
  mealIndex: number
  dayName: string
  isToday?: boolean
}) {
  const { isCompleted, toggleCompletion } = useMealTrackingStore()
  const completed = isCompleted(dayName, dayIndex, mealIndex)
  const Icon = mealIcons[meal.type]

  return (
    <div className={cn(
      'relative overflow-hidden rounded-xl border transition-all duration-300',
      'bg-gradient-to-br shadow-sm',
      mealColors[meal.type],
      completed && 'opacity-60'
    )}>
      <div className="p-3 sm:p-4">
        <div className="flex items-start justify-between mb-2 sm:mb-3">
          <div className="flex items-center gap-2">
            <div className={cn(
              'flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-lg bg-background/50',
              mealIconColors[meal.type]
            )}>
              <Icon className="h-3 w-3 sm:h-4 sm:w-4" />
            </div>
            <div>
              <h4 className="font-semibold text-xs sm:text-sm">{meal.name}</h4>
              <p className="text-xs text-muted-foreground">{meal.type === 'breakfast' ? 'Desayuno' : meal.type === 'pre-workout' ? (meal.name === 'Almuerzo' ? 'Almuerzo' : 'Pre-Entreno') : 'Cena'}</p>
            </div>
          </div>
          <button
            onClick={() => toggleCompletion(dayName, dayIndex, mealIndex)}
            className={cn(
              'flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center rounded-full transition-all',
              completed 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-muted hover:bg-muted/80'
            )}
          >
            {completed && <CheckCircle2 className="h-3 w-3 sm:h-4 sm:w-4" />}
            {!completed && <Circle className="h-3 w-3 sm:h-4 sm:w-4" />}
          </button>
        </div>

        <div className="space-y-1 mb-2 sm:mb-3">
          {meal.items.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between text-xs">
              <span className="text-foreground/80 truncate flex-1 mr-2">{item.name}</span>
              <span className="text-muted-foreground whitespace-nowrap">{item.amount}</span>
            </div>
          ))}
          {meal.items.length > 6 && (
            <p className="text-xs text-muted-foreground">+ {meal.items.length - 6} más</p>
          )}
        </div>

        <div className="flex items-center gap-2 sm:gap-3 pt-2 border-t border-border/50">
          <div className="flex items-center gap-1">
            <Target className="h-3 w-3 text-muted-foreground" />
            <span className="text-xs font-medium">{meal.macros.protein}g</span>
          </div>
          <div className="flex items-center gap-1">
            <Flame className="h-3 w-3 text-muted-foreground" />
            <span className="text-xs font-medium">{meal.macros.calories}</span>
          </div>
        </div>

        {meal.cooking && (
          <div className="mt-2 pt-2 border-t border-border/50">
            <p className="text-xs text-muted-foreground">
              <span className="font-medium">{translations.cooking}</span> {meal.cooking}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

function DayCard({ 
  day, 
  dayIndex,
  isToday = false
}: { 
  day: DayPlan
  dayIndex: number
  isToday?: boolean
}) {
  const dayName = day.day.toLowerCase()
  const dayNamesShort = {
    monday: 'LUN',
    tuesday: 'MAR',
    wednesday: 'MIÉ',
    thursday: 'JUE',
    friday: 'VIE',
    saturday: 'SÁB',
    sunday: 'DOM'
  }

  return (
    <div className={cn(
      'space-y-3 p-3 sm:p-4 rounded-xl',
      isToday && 'bg-primary/5 border border-primary/30'
    )}>
      <div className="flex items-center gap-2 mb-3">
        <span className={cn(
          'text-xs font-bold px-2 py-1 rounded-full',
          'bg-gradient-to-r from-primary/20 to-emerald-500/20',
          'text-primary border border-primary/30'
        )}>
          {dayNamesShort[day.day.toLowerCase() as keyof typeof dayNamesShort] || day.shortDay}
        </span>
        <h3 className="font-semibold text-sm sm:text-base">{day.day}</h3>
      </div>
      
      <div className="space-y-2 sm:space-y-3">
        {day.meals.map((meal, mealIdx) => (
          <MealCard
            key={mealIdx}
            meal={meal}
            dayIndex={dayIndex}
            mealIndex={mealIdx}
            dayName={dayName}
            isToday={isToday}
          />
        ))}
      </div>
    </div>
  )
}

export default function DietPlanPage() {
  const router = useRouter()
  const { user, isLoading, isPremium, checkPremiumStatus } = useAuthStore()
  const [mounted, setMounted] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState(0)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!isLoading && mounted) {
      if (!user) {
        router.push('/dashboard')
        return
      }
      // Check premium status if not already premium
      if (!isPremium) {
        checkPremiumStatus()
      }
    }
  }, [user, isLoading, mounted, isPremium, router, checkPremiumStatus])

  useEffect(() => {
    // Redirect if not premium (only allow admin email or isPremium flag)
    if (!isLoading && mounted && user && !isPremium && user.email !== ADMIN_EMAIL) {
      router.push('/dashboard')
    }
  }, [user, isLoading, mounted, isPremium, router])

  if (!mounted || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!user || (!isPremium && user.email !== ADMIN_EMAIL)) {
    return null
  }

  const todayPlanData = getCurrentDayPlan()
  const currentDayPlan = todayPlanData?.day || ALL_PLANS[0].days[0]
  const todayTotals = currentDayPlan ? calculateDayTotals(currentDayPlan) : { calories: 0, protein: 0 }
  const todayDayName = currentDayPlan.day

  const planButtons = [
    { label: translations.days.monWed, plan: MON_WED_PLAN, index: 0 },
    { label: translations.days.thuSat, plan: THU_SAT_PLAN, index: 1 },
    { label: translations.days.sunday, plan: SUNDAY_PLAN, index: 2 }
  ]

  return (
    <div className="min-h-screen bg-background pb-20 sm:pb-6">
      <div className="sticky top-16 sm:top-0 z-40 bg-background/80 backdrop-blur-lg border-b">
        <div className="container px-3 sm:px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-amber-500" />
              <h1 className="text-lg sm:text-xl font-bold text-foreground">
                {translations.title}
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs px-2 py-1 rounded-full bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-500 border border-amber-500/30">
                {translations.premium}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="container px-3 sm:px-4 py-4 sm:py-6 space-y-4 sm:space-y-6">
        <div className="grid grid-cols-2 gap-2 sm:gap-4">
          <Card className="bg-gradient-to-br from-amber-500/10 to-orange-500/5 border-amber-500/20">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="flex h-8 sm:h-10 w-8 sm:w-10 items-center justify-center rounded-lg sm:rounded-xl bg-amber-500/20">
                  <Sun className="h-4 w-4 sm:h-5 sm:w-5 text-amber-500" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{translations.todayCalories}</p>
                  <p className="text-lg sm:text-xl font-bold">{todayTotals.calories}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-primary/10 to-emerald-500/5 border-primary/20">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="flex h-8 sm:h-10 w-8 sm:w-10 items-center justify-center rounded-lg sm:rounded-xl bg-primary/20">
                  <Target className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{translations.todayProtein}</p>
                  <p className="text-lg sm:text-xl font-bold">{todayTotals.protein}g</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/5 border-blue-500/20">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="flex h-8 sm:h-10 w-8 sm:w-10 items-center justify-center rounded-lg sm:rounded-xl bg-blue-500/20">
                  <TrendingDown className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{translations.weeklyGoal}</p>
                  <p className="text-lg sm:text-xl font-bold">-4 a -6kg</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/5 border-purple-500/20">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="flex h-8 sm:h-10 w-8 sm:w-10 items-center justify-center rounded-lg sm:rounded-xl bg-purple-500/20">
                  <Award className="h-4 w-4 sm:h-5 sm:w-5 text-purple-500" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{translations.progress}</p>
                  <p className="text-lg sm:text-xl font-bold">{translations.week1}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-gradient-to-br from-primary/5 to-emerald-500/5 border-primary/20 overflow-hidden">
          <CardHeader className="pb-2 px-3 sm:p-4">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg px-2">
              <Clock className="h-5 w-5 text-primary" />
              {translations.dailyTimeline} - {todayDayName}
            </CardTitle>
          </CardHeader>
          <CardContent className="px-3 sm:p-4">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {currentDayPlan && currentDayPlan.meals.map((meal, idx) => (
                <MealCard
                  key={idx}
                  meal={meal}
                  dayIndex={todayPlanData?.dayIndex ?? 0}
                  mealIndex={idx}
                  dayName={currentDayPlan.day.toLowerCase()}
                  isToday={true}
                />
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-3 sm:space-y-4">
          <div className="flex items-center gap-2 px-1">
            <Sparkles className="h-5 w-5 text-primary" />
            <h2 className="text-base sm:text-lg font-semibold">{translations.weeklyPlans}</h2>
          </div>
          
          <div className="flex items-center gap-2 overflow-x-auto pb-2 px-1">
            {planButtons.map((item, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedPlan(item.index)}
                className={cn(
                  'flex-shrink-0 px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition-all whitespace-nowrap',
                  selectedPlan === idx
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:text-foreground'
                )}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {ALL_PLANS[selectedPlan].days.map((day, dayIdx) => (
              <Card 
                key={dayIdx} 
                className="bg-card/50"
              >
                <CardContent className="p-0">
                  <DayCard 
                    day={day} 
                    dayIndex={dayIdx}
                    isToday={day.day.toLowerCase() === todayDayName.toLowerCase()}
                  />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <Card className="bg-gradient-to-br from-primary/10 to-emerald-500/10 border-primary/30">
          <CardHeader className="px-3 sm:p-4">
            <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
              <Zap className="h-5 w-5 text-primary" />
              {translations.absFaster}
            </CardTitle>
          </CardHeader>
          <CardContent className="px-3 sm:p-4">
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
              {ABS_TIPS.map((tip, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg bg-background/50"
                >
                  <div className="flex h-5 sm:h-6 w-5 sm:w-6 items-center justify-center rounded-full bg-primary/20 text-primary text-xs font-bold flex-shrink-0">
                    {idx + 1}
                  </div>
                  <div>
                    <h4 className="font-medium text-xs sm:text-sm">{tip.title}</h4>
                    <p className="text-xs text-muted-foreground hidden sm:block">{tip.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-500/10 via-orange-500/10 to-red-500/10 border-amber-500/30">
          <CardHeader className="px-3 sm:p-4">
            <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
              <TrendingDown className="h-5 w-5 text-amber-500" />
              {translations.transformationTitle}
            </CardTitle>
          </CardHeader>
          <CardContent className="px-3 sm:p-4">
            <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
              <div className="flex-shrink-0">
                <ProgressRing 
                  progress={100} 
                  size={80} 
                  strokeWidth={6}
                  color="text-gradient-to-r from-amber-500 to-orange-500"
                >
                  <div className="text-center">
                    <span className="text-sm font-bold">-4</span>
                    <span className="text-xs block text-muted-foreground">a -6kg</span>
                  </div>
                </ProgressRing>
              </div>
              <div className="space-y-2">
                {TRANSFORMATION_RESULTS.map((result, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-amber-500 flex-shrink-0" />
                    <span className="text-xs sm:text-sm">{result}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center justify-center gap-2 py-4 text-muted-foreground">
          <Leaf className="h-4 w-4" />
          <span className="text-xs sm:text-sm text-center px-4">{translations.stayConsistent}</span>
        </div>
      </div>
    </div>
  )
}