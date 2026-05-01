'use client'

import { useState } from 'react'
import { User, Bell, Palette, Target, Loader2, Globe } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { useAuthStore } from '@/stores/auth-store'
import { useI18n } from '@/lib/i18n-provider'

export default function SettingsPage() {
  const { user, updateProfile } = useAuthStore()
  const { t, lang, setLanguage } = useI18n()
  const [isSaving, setIsSaving] = useState(false)
  const [goals, setGoals] = useState({
    calories: user?.goal_calories || 2000,
    protein: user?.goal_protein || 150
  })

  const handleSaveGoals = async () => {
    setIsSaving(true)
    await updateProfile({
      goal_calories: goals.calories,
      goal_protein: goals.protein
    })
    setIsSaving(false)
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t.settings.title}</h1>
        <p className="text-muted-foreground">
          Gestiona tu cuenta y preferencias
        </p>
      </div>

      {/* Language Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Idioma
          </CardTitle>
          <CardDescription>Selecciona el idioma de la interfaz</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Español</Label>
              <p className="text-sm text-muted-foreground">
                Interfaz en español
              </p>
            </div>
            <Switch 
              checked={lang === 'es'}
              onCheckedChange={() => setLanguage(lang === 'es' ? 'en' : 'es')}
            />
          </div>
        </CardContent>
      </Card>

      {/* Profile Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            {t.settings.profile}
          </CardTitle>
          <CardDescription>Tu información personal</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>{t.settings.email}</Label>
            <Input 
              value={user?.email || ''} 
              disabled 
              className="bg-muted"
            />
            <p className="text-xs text-muted-foreground">
              Contacta soporte para cambiar tu correo
            </p>
          </div>
          <div className="space-y-2">
            <Label>{t.settings.name}</Label>
            <Input 
              defaultValue={user?.full_name || ''}
              placeholder="Ingresa tu nombre"
            />
          </div>
        </CardContent>
      </Card>

      {/* Goals Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            {t.settings.goals}
          </CardTitle>
          <CardDescription>Establece tus objetivos nutricionales</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t.settings.calorieGoal}</Label>
              <Input
                type="number"
                value={goals.calories}
                onChange={(e) => setGoals({ ...goals, calories: parseInt(e.target.value) || 0 })}
                min={500}
                max={10000}
              />
            </div>
            <div className="space-y-2">
              <Label>{t.settings.proteinGoal}</Label>
              <Input
                type="number"
                value={goals.protein}
                onChange={(e) => setGoals({ ...goals, protein: parseInt(e.target.value) || 0 })}
                min={0}
                max={500}
              />
            </div>
          </div>
          <Button onClick={handleSaveGoals} disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t.common.loading}
              </>
            ) : (
              t.common.save
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Appearance Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            {t.settings.preferences}
          </CardTitle>
          <CardDescription>Personaliza la apariencia</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>{t.settings.theme} {t.settings.dark}</Label>
              <p className="text-sm text-muted-foreground">
                Usar tema oscuro
              </p>
            </div>
            <Switch defaultChecked={user?.theme === 'dark'} />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Reduced Motion</Label>
              <p className="text-sm text-muted-foreground">
                Minimizar animaciones
              </p>
            </div>
            <Switch />
          </div>
        </CardContent>
      </Card>

      {/* Notifications Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notificaciones
          </CardTitle>
          <CardDescription>Gestiona tus preferencias de notificaciones</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Recordatorios diarios</Label>
              <p className="text-sm text-muted-foreground">
                Reciberecordatorios para registrar tus hábitos
              </p>
            </div>
            <Switch defaultChecked />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Resumen semanal</Label>
              <p className="text-sm text-muted-foreground">
                Recibe un reporte semanal de progreso
              </p>
            </div>
            <Switch defaultChecked />
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="text-destructive">Zona de peligro</CardTitle>
          <CardDescription>Acciones irreversibles</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Eliminar cuenta</Label>
              <p className="text-sm text-muted-foreground">
                Elimina permanentemente tu cuenta y todos los datos
              </p>
            </div>
            <Button variant="destructive" size="sm">
              Eliminar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}