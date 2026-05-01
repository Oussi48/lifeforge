'use client'

import { useState } from 'react'
import { Plus, Trash2, Utensils, Coffee, Sun, Moon, Cookie } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useNutritionStore } from '@/stores/nutrition-store'
import { useAuthStore } from '@/stores/auth-store'
import { useI18n } from '@/lib/i18n-provider'
import { cn, getProgressColor, calculateProgress, getTodayISO } from '@/lib/utils'

const mealTypes = [
  { value: 'breakfast', labelKey: 'breakfast' as const, icon: Coffee },
  { value: 'lunch', labelKey: 'lunch' as const, icon: Sun },
  { value: 'dinner', labelKey: 'dinner' as const, icon: Moon },
  { value: 'snack', labelKey: 'snack' as const, icon: Cookie },
]

export default function NutritionPage() {
  const { logs, addLog, deleteLog, getTotals } = useNutritionStore()
  const { user } = useAuthStore()
  const { t } = useI18n()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [foodName, setFoodName] = useState('')
  const [quantity, setQuantity] = useState('')
  const [calories, setCalories] = useState('')
  const [protein, setProtein] = useState('')
  const [mealType, setMealType] = useState('breakfast')
  const today = getTodayISO()

  const totals = getTotals()
  const calorieGoal = user?.goal_calories || 2000
  const proteinGoal = user?.goal_protein || 150
  const caloriePercentage = calculateProgress(totals.calories, calorieGoal)
  const proteinPercentage = calculateProgress(totals.protein, proteinGoal)

  const handleAddFood = async () => {
    if (!foodName.trim() || !quantity || !calories || !protein) return

    await addLog({
      food_name: foodName,
      quantity: parseFloat(quantity),
      calories: parseInt(calories),
      protein: parseFloat(protein),
      meal_type: mealType as 'breakfast' | 'lunch' | 'dinner' | 'snack',
      date: today
    })

    setFoodName('')
    setQuantity('')
    setCalories('')
    setProtein('')
    setMealType('breakfast')
    setIsDialogOpen(false)
  }

  const handleDeleteLog = async (id: string) => {
    await deleteLog(id)
  }

  const groupedLogs = logs.reduce((acc, log) => {
    if (!acc[log.meal_type]) {
      acc[log.meal_type] = []
    }
    acc[log.meal_type].push(log)
    return acc
  }, {} as Record<string, typeof logs>)

  const getMealLabel = (key: string) => t.nutrition[key as keyof typeof t.nutrition] || key

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t.nutrition.title}</h1>
          <p className="text-muted-foreground">
            {t.nutrition.subtitle}
          </p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              {t.nutrition.addFood}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t.nutrition.addFood}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>{t.nutrition.foodName}</Label>
                <Input
                  value={foodName}
                  onChange={(e) => setFoodName(e.target.value)}
                  placeholder="e.g., Pechuga de pollo"
                />
              </div>
              <div className="space-y-2">
                <Label>{t.nutrition.mealType}</Label>
                <Select value={mealType} onValueChange={setMealType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar" />
                  </SelectTrigger>
                  <SelectContent>
                    {mealTypes.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex items-center gap-2">
                          <type.icon className="h-4 w-4" />
                          {getMealLabel(type.labelKey)}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t.nutrition.quantity}</Label>
                <Input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="100"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t.nutrition.calories}</Label>
                  <Input
                    type="number"
                    value={calories}
                    onChange={(e) => setCalories(e.target.value)}
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t.nutrition.protein}</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={protein}
                    onChange={(e) => setProtein(e.target.value)}
                    placeholder="0"
                  />
                </div>
              </div>
              <Button onClick={handleAddFood} className="w-full">
                {t.nutrition.addFood}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Progress Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">{t.nutrition.calories}</CardTitle>
            <span className="text-sm text-muted-foreground">
              {totals.calories} / {calorieGoal}
            </span>
          </CardHeader>
          <CardContent>
            <Progress 
              value={caloriePercentage} 
              className="h-4"
              indicatorClassName={cn(
                'rounded-full',
                caloriePercentage >= 100 ? 'bg-danger' :
                caloriePercentage >= 90 ? 'bg-warning' : 'bg-primary'
              )}
            />
            <div className="mt-2 flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{caloriePercentage.toFixed(0)}% {t.dashboard.onTrack.toLowerCase()}</span>
              <span className={cn(
                'font-medium',
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
            <CardTitle className="text-sm font-medium">{t.nutrition.protein}</CardTitle>
            <span className="text-sm text-muted-foreground">
              {totals.protein.toFixed(0)}g / {proteinGoal}g
            </span>
          </CardHeader>
          <CardContent>
            <Progress 
              value={proteinPercentage} 
              className="h-4"
              indicatorClassName={cn(
                'rounded-full',
                proteinPercentage >= 100 ? 'bg-danger' :
                proteinPercentage >= 90 ? 'bg-warning' : 'bg-primary'
              )}
            />
            <div className="mt-2 flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{proteinPercentage.toFixed(0)}% {t.dashboard.onTrack.toLowerCase()}</span>
              <span className={cn(
                'font-medium',
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

      {/* Food Log by Meal */}
      {mealTypes.map(meal => {
        const mealLogs = groupedLogs[meal.value] || []
        const mealCalories = mealLogs.reduce((sum, log) => sum + log.calories, 0)
        const mealProtein = mealLogs.reduce((sum, log) => sum + log.protein, 0)

        return (
          <Card key={meal.value}>
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                  <meal.icon className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-base">{getMealLabel(meal.labelKey)}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {mealCalories} cal • {mealProtein.toFixed(1)}g {t.nutrition.protein.toLowerCase()}
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {mealLogs.length > 0 ? (
                <div className="space-y-2">
                  {mealLogs.map(log => (
                    <div
                      key={log.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                    >
                      <div>
                        <p className="font-medium">{log.food_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {log.quantity}g
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <span className="font-medium">{log.calories}</span>
                          <span className="text-muted-foreground"> cal</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteLog(log.id)}
                          className="text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-sm text-muted-foreground py-4">
                  Sin {getMealLabel(meal.labelKey).toLowerCase()}
                </p>
              )}
            </CardContent>
          </Card>
        )
      })}

      {logs.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Utensils className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
            <p className="text-muted-foreground">{t.nutrition.noFoodLogged}</p>
            <p className="text-sm text-muted-foreground">{t.dashboard.addFirstMeal}</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}