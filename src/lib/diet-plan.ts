export type MealType = 'breakfast' | 'pre-workout' | 'dinner'

export interface MealItem {
  name: string
  amount: string
  notes?: string
}

export interface Meal {
  name: string
  type: MealType
  items: MealItem[]
  macros: {
    protein: number
    calories: number
  }
  cooking?: string
}

export interface DayPlan {
  day: string
  shortDay: string
  meals: Meal[]
}

export interface WeekPlan {
  name: string
  days: DayPlan[]
  totals: {
    calories: number
    protein: number
  }
}

// Admin email for managing premium users (only for initial setup, database will be the source of truth after)
export const ADMIN_EMAIL = 'oussamablhbnz@gmail.com'

export const MON_WED_PLAN: WeekPlan = {
  name: 'Lunes - Miércoles',
  days: [
    {
      day: 'Lunes',
      shortDay: 'LUN',
      meals: [
        {
          name: 'Desayuno',
          type: 'breakfast',
          items: [
            { name: '2 huevos enteros', amount: '2 unidades' },
            { name: 'Pan integral', amount: '80g' },
            { name: 'Yogur griego alto en proteína', amount: '250g', notes: 'sin azúcar' },
            { name: 'Plátano', amount: '1 unidad' }
          ],
          macros: { protein: 46, calories: 590 },
          cooking: 'Huevos: hervidos o sartén antiadherente | Pan: tostadora'
        },
        {
          name: 'Pre-Entreno / Boxeo',
          type: 'pre-workout',
          items: [
            { name: 'Pechuga de pollo', amount: '220g', notes: 'cortado en trozos' },
            { name: 'Arroz blanco (crudo)', amount: '90g', notes: 'hervido, sin mantequilla' },
            { name: 'Verduras', amount: '250g', notes: 'microondas o sartén' },
            { name: 'Aceite de oliva', amount: '5g' },
            { name: 'Manzana', amount: '1 unidad' }
          ],
          macros: { protein: 61, calories: 755 },
          cooking: 'Pollo: sal, pimienta, ajo en polvo, paprika, air fryer o sartén, solo 5g aceite'
        },
        {
          name: 'Cena',
          type: 'dinner',
          items: [
            { name: 'Carne molida magra 5%', amount: '180g', notes: 'escurrir grasa, sin aceite extra' },
            { name: 'Patata', amount: '220g', notes: 'air fryer u horno, estilo wedge' },
            { name: 'Ensalada', amount: '200g', notes: 'limón o vinagre, max 1cdta aceite' },
            { name: 'Yogur proteico', amount: '200g' }
          ],
          macros: { protein: 64, calories: 565 },
          cooking: 'Carne: sartén antiadherente, escurrir grasa | Patatas: paprika, ajo en polvo, sin freír'
        }
      ]
    },
    {
      day: 'Martes',
      shortDay: 'MAR',
      meals: [
        {
          name: 'Desayuno',
          type: 'breakfast',
          items: [
            { name: '2 huevos enteros', amount: '2 unidades' },
            { name: 'Pan integral', amount: '80g' },
            { name: 'Yogur griego alto en proteína', amount: '250g', notes: 'sin azúcar' },
            { name: 'Plátano', amount: '1 unidad' }
          ],
          macros: { protein: 46, calories: 590 },
          cooking: 'Huevos: hervidos o sartén antiadherente | Pan: tostadora'
        },
        {
          name: 'Pre-Entreno / Boxeo',
          type: 'pre-workout',
          items: [
            { name: 'Pechuga de pollo', amount: '220g', notes: 'cortado en trozos' },
            { name: 'Arroz blanco (crudo)', amount: '90g', notes: 'hervido, sin mantequilla' },
            { name: 'Verduras', amount: '250g', notes: 'microondas o sartén' },
            { name: 'Aceite de oliva', amount: '5g' },
            { name: 'Manzana', amount: '1 unidad' }
          ],
          macros: { protein: 61, calories: 755 },
          cooking: 'Pollo: sal, pimienta, ajo en polvo, paprika, air fryer o sartén, solo 5g aceite'
        },
        {
          name: 'Cena',
          type: 'dinner',
          items: [
            { name: 'Carne molida magra 5%', amount: '180g', notes: 'escurrir grasa, sin aceite extra' },
            { name: 'Patata', amount: '220g', notes: 'air fryer u horno, estilo wedge' },
            { name: 'Ensalada', amount: '200g', notes: 'limón o vinagre, max 1cdta aceite' },
            { name: 'Yogur proteico', amount: '200g' }
          ],
          macros: { protein: 64, calories: 565 },
          cooking: 'Carne: sartén antiadherente, escurrir grasa | Patatas: paprika, ajo en polvo, sin freír'
        }
      ]
    },
    {
      day: 'Miércoles',
      shortDay: 'MIÉ',
      meals: [
        {
          name: 'Desayuno',
          type: 'breakfast',
          items: [
            { name: '2 huevos enteros', amount: '2 unidades' },
            { name: 'Pan integral', amount: '80g' },
            { name: 'Yogur griego alto en proteína', amount: '250g', notes: 'sin azúcar' },
            { name: 'Plátano', amount: '1 unidad' }
          ],
          macros: { protein: 46, calories: 590 },
          cooking: 'Huevos: hervidos o sartén antiadherente | Pan: tostadora'
        },
        {
          name: 'Pre-Entreno / Boxeo',
          type: 'pre-workout',
          items: [
            { name: 'Pechuga de pollo', amount: '220g', notes: 'cortado en trozos' },
            { name: 'Arroz blanco (crudo)', amount: '90g', notes: 'hervido, sin mantequilla' },
            { name: 'Verduras', amount: '250g', notes: 'microondas o sartén' },
            { name: 'Aceite de oliva', amount: '5g' },
            { name: 'Manzana', amount: '1 unidad' }
          ],
          macros: { protein: 61, calories: 755 },
          cooking: 'Pollo: sal, pimienta, ajo en polvo, paprika, air fryer o sartén, solo 5g aceite'
        },
        {
          name: 'Cena',
          type: 'dinner',
          items: [
            { name: 'Carne molida magra 5%', amount: '180g', notes: 'escurrir grasa, sin aceite extra' },
            { name: 'Patata', amount: '220g', notes: 'air fryer u horno, estilo wedge' },
            { name: 'Ensalada', amount: '200g', notes: 'limón o vinagre, max 1cdta aceite' },
            { name: 'Yogur proteico', amount: '200g' }
          ],
          macros: { protein: 64, calories: 565 },
          cooking: 'Carne: sartén antiadherente, escurrir grasa | Patatas: paprika, ajo en polvo, sin freír'
        }
      ]
    }
  ],
  totals: { calories: 1910, protein: 171 }
}

export const THU_SAT_PLAN: WeekPlan = {
  name: 'Jueves - Sábado',
  days: [
    {
      day: 'Jueves',
      shortDay: 'JUE',
      meals: [
        {
          name: 'Desayuno',
          type: 'breakfast',
          items: [
            { name: '2 huevos', amount: '2 unidades' },
            { name: 'Pan integral', amount: '70g' },
            { name: 'Queso fresco sin grasa', amount: '300g' },
            { name: 'Manzana', amount: '1 unidad' }
          ],
          macros: { protein: 43, calories: 545 }
        },
        {
          name: 'Pre-Entreno',
          type: 'pre-workout',
          items: [
            { name: 'Carne molida magra', amount: '200g', notes: 'sartén antiadherente' },
            { name: 'Pasta (cruda)', amount: '85g', notes: 'hervida, sin crema' },
            { name: 'Verduras', amount: '250g' },
            { name: 'Aceite de oliva', amount: '5g' },
            { name: 'Plátano', amount: '1 unidad' }
          ],
          macros: { protein: 58, calories: 775 },
          cooking: 'Pasta: sin crema, sin queso, tomate natural permitido | Carne: escurrir grasa'
        },
        {
          name: 'Cena',
          type: 'dinner',
          items: [
            { name: 'Pechuga de pollo', amount: '220g' },
            { name: 'Patatas', amount: '220g' },
            { name: 'Ensalada', amount: '200g' },
            { name: 'Yogur proteico', amount: '200g' }
          ],
          macros: { protein: 76, calories: 570 }
        }
      ]
    },
    {
      day: 'Viernes',
      shortDay: 'VIE',
      meals: [
        {
          name: 'Desayuno',
          type: 'breakfast',
          items: [
            { name: '2 huevos', amount: '2 unidades' },
            { name: 'Pan integral', amount: '70g' },
            { name: 'Queso fresco sin grasa', amount: '300g' },
            { name: 'Manzana', amount: '1 unidad' }
          ],
          macros: { protein: 43, calories: 545 }
        },
        {
          name: 'Pre-Entreno',
          type: 'pre-workout',
          items: [
            { name: 'Carne molida magra', amount: '200g', notes: 'sartén antiadherente' },
            { name: 'Pasta (cruda)', amount: '85g', notes: 'hervida, sin crema' },
            { name: 'Verduras', amount: '250g' },
            { name: 'Aceite de oliva', amount: '5g' },
            { name: 'Plátano', amount: '1 unidad' }
          ],
          macros: { protein: 58, calories: 775 },
          cooking: 'Pasta: sin crema, sin queso, tomate natural permitido | Carne: escurrir grasa'
        },
        {
          name: 'Cena',
          type: 'dinner',
          items: [
            { name: 'Pechuga de pollo', amount: '220g' },
            { name: 'Patatas', amount: '220g' },
            { name: 'Ensalada', amount: '200g' },
            { name: 'Yogur proteico', amount: '200g' }
          ],
          macros: { protein: 76, calories: 570 }
        }
      ]
    },
    {
      day: 'Sábado',
      shortDay: 'SÁB',
      meals: [
        {
          name: 'Desayuno',
          type: 'breakfast',
          items: [
            { name: '2 huevos', amount: '2 unidades' },
            { name: 'Pan integral', amount: '70g' },
            { name: 'Queso fresco sin grasa', amount: '300g' },
            { name: 'Manzana', amount: '1 unidad' }
          ],
          macros: { protein: 43, calories: 545 }
        },
        {
          name: 'Pre-Entreno',
          type: 'pre-workout',
          items: [
            { name: 'Carne molida magra', amount: '200g', notes: 'sartén antiadherente' },
            { name: 'Pasta (cruda)', amount: '85g', notes: 'hervida, sin crema' },
            { name: 'Verduras', amount: '250g' },
            { name: 'Aceite de oliva', amount: '5g' },
            { name: 'Plátano', amount: '1 unidad' }
          ],
          macros: { protein: 58, calories: 775 },
          cooking: 'Pasta: sin crema, sin queso, tomate natural permitido | Carne: escurrir grasa'
        },
        {
          name: 'Cena',
          type: 'dinner',
          items: [
            { name: 'Pechuga de pollo', amount: '220g' },
            { name: 'Patatas', amount: '220g' },
            { name: 'Ensalada', amount: '200g' },
            { name: 'Yogur proteico', amount: '200g' }
          ],
          macros: { protein: 76, calories: 570 }
        }
      ]
    }
  ],
  totals: { calories: 1890, protein: 177 }
}

export const SUNDAY_PLAN: WeekPlan = {
  name: 'Domingo',
  days: [
    {
      day: 'Domingo',
      shortDay: 'DOM',
      meals: [
        {
          name: 'Desayuno',
          type: 'breakfast',
          items: [
            { name: '2 huevos', amount: '2 unidades' },
            { name: 'Pan integral', amount: '80g' },
            { name: 'Yogur proteico', amount: '250g' }
          ],
          macros: { protein: 45, calories: 490 }
        },
        {
          name: 'Almuerzo',
          type: 'pre-workout',
          items: [
            { name: 'Pollo', amount: '250g' },
            { name: 'Arroz', amount: '90g' },
            { name: 'Verduras', amount: '250g' }
          ],
          macros: { protein: 68, calories: 660 }
        },
        {
          name: 'Cena',
          type: 'dinner',
          items: [
            { name: 'Atún', amount: '2 latas' },
            { name: 'Patata', amount: '250g' },
            { name: 'Ensalada', amount: '200g' },
            { name: 'Yogur proteico', amount: '200g' }
          ],
          macros: { protein: 59, calories: 510 }
        }
      ]
    }
  ],
  totals: { calories: 1660, protein: 172 }
}

export const ALL_PLANS = [MON_WED_PLAN, THU_SAT_PLAN, SUNDAY_PLAN]

export const WEEK_DAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']

export const ABS_TIPS = [
  { title: 'Sigue la dieta estrictamente', description: 'Cada comida cuenta para ver resultados' },
  { title: '10k-15k pasos diarios', description: 'Caminar es tu arma secreta para perder grasa' },
  { title: '15 min caminata inclinada después de entrenar', description: 'Máxima quema de grasa con mínimo esfuerzo' },
  { title: 'Duerme mínimo 7h', description: 'La recuperación es cuando se construyen los abdominales' }
]

export const TRANSFORMATION_RESULTS = [
  'Pérdida de -4 a -6kg',
  'Cintura más pequeña',
  'Abdominales parcialmente visibles',
  'Espalda baja más definida',
  'Cara más perfilada'
]

export function getDayPlan(dayName: string): DayPlan | undefined {
  for (const plan of ALL_PLANS) {
    const day = plan.days.find(d => d.day.toLowerCase() === dayName.toLowerCase())
    if (day) return day
  }
  return undefined
}

export function calculateDayTotals(day: DayPlan) {
  return day.meals.reduce(
    (acc, meal) => ({
      calories: acc.calories + meal.macros.calories,
      protein: acc.protein + meal.macros.protein
    }),
    { calories: 0, protein: 0 }
  )
}