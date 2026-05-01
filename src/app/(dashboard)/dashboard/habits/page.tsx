'use client'

import { useState, useEffect } from 'react'
import { Flame, Plus, Trash2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog'
import { useHabitsStore } from '@/stores/habits-store'
import { useI18n } from '@/lib/i18n-provider'
import { useAuthStore } from '@/stores/auth-store'
import { cn, getTodayISO } from '@/lib/utils'

export default function HabitsPage() {
  const { habits, fetchHabits, toggleHabit, addHabit, deleteHabit, isLoading } = useHabitsStore()
  const { user } = useAuthStore()
  const { t } = useI18n()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [newHabitName, setNewHabitName] = useState('')
  const [newHabitIcon, setNewHabitIcon] = useState('✨')
  const [newHabitColor, setNewHabitColor] = useState('#10b981')
  const today = getTodayISO()

  useEffect(() => {
    if (user && habits.length === 0) {
      fetchHabits()
    }
  }, [user])

  const handleToggle = async (habitId: string) => {
    await toggleHabit(habitId, today)
  }

  const handleAddHabit = async () => {
    if (!newHabitName.trim()) return
    
    const slug = newHabitName.toLowerCase().replace(/\s+/g, '-')
    await addHabit({
      name: newHabitName,
      slug,
      icon: newHabitIcon,
      color: newHabitColor,
      frequency: 'daily',
      target_days: [0,1,2,3,4,5,6],
      is_default: false
    })
    
    setNewHabitName('')
    setNewHabitIcon('✨')
    setNewHabitColor('#10b981')
    setIsDialogOpen(false)
  }

  const handleDeleteHabit = async (habitId: string) => {
    await deleteHabit(habitId)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t.habits.title}</h1>
          <p className="text-muted-foreground">
            {t.habits.subtitle}
          </p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              {t.habits.addHabit}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t.habits.addHabit}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>{t.habits.habitName}</Label>
                <Input
                  value={newHabitName}
                  onChange={(e) => setNewHabitName(e.target.value)}
                  placeholder="e.g., Lee 30 minutos"
                />
              </div>
              <div className="space-y-2">
                <Label>{t.habits.selectIcon}</Label>
                <Input
                  value={newHabitIcon}
                  onChange={(e) => setNewHabitIcon(e.target.value)}
                  placeholder="✨"
                />
              </div>
              <div className="space-y-2">
                <Label>{t.habits.selectColor}</Label>
                <div className="flex gap-2">
                  {['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'].map(color => (
                    <button
                      key={color}
                      type="button"
                      className={cn(
                        'h-8 w-8 rounded-full border-2 transition-all',
                        newHabitColor === color ? 'border-white scale-110' : 'border-transparent'
                      )}
                      style={{ backgroundColor: color }}
                      onClick={() => setNewHabitColor(color)}
                    />
                  ))}
                </div>
              </div>
              <Button onClick={handleAddHabit} className="w-full">
                {t.habits.addHabit}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Habit Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {habits.map((habit) => {
          const todayEntry = (habit.entries || []).find(e => e.date === today)
          const isCompleted = todayEntry?.completed || false
          
          return (
            <Card 
              key={habit.id} 
              className={cn(
                'transition-all duration-300 card-hover',
                isCompleted && 'border-primary/50 bg-primary/5'
              )}
            >
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div 
                      className="flex h-14 w-14 items-center justify-center rounded-xl text-2xl"
                      style={{ backgroundColor: `${habit.color}20` }}
                    >
                      {habit.icon}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">{habit.name}</h3>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Flame className="h-3 w-3 text-orange-500" />
                        <span>{habit.streak || 0} {t.dashboard.dayStreak}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <Button
                    variant={isCompleted ? 'default' : 'outline'}
                    onClick={() => handleToggle(habit.id)}
                    className={cn(
                      isCompleted && 'bg-primary',
                      !isCompleted && 'border-2'
                    )}
                  >
                    {isCompleted ? t.habits.completed : 'Marcar'}
                  </Button>
                  
                  {!habit.is_default && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteHabit(habit.id)}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {habits.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">{t.habits.noHabits}. {t.habits.createFirst}!</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}