# Arquitectura — Drop (App de Hábitos Grupales)

## Tech Stack

| Capa | Tecnología | Versión |
|---|---|---|
| Frontend | React + TypeScript | 19.x |
| Build | Vite | 8.x |
| Routing | React Router | 7.x |
| Estilos | Tailwind CSS | 4.x |
| Backend/Database | Convex | 1.x |
| Autenticación | Better Auth (via @convex-dev/better-auth) | ~0.11.x |

## Flujo de Datos

```
Usuario (React) → Convex Mutation → Convex Database → Reactive Query → UI se actualiza
                                                        ↓
                                             Otros miembros ven cambios en tiempo real
```

### Ciclo completo (toggle de hábito)

1. Usuario hace click en un día del calendario
2. Se llama `toggleLog(habitId, date)` mutation
3. Convex valida auth, busca/actualiza/crea el log
4. `getHabitDetails` query se re-ejecuta reactivamente
5. Calendario se re-renderiza con los nuevos datos del grupo
6. Si se cumple condición de logro, se crea en DB y aparece toast

### Ciclo de invitación por link

1. Usuario A hace click en "Invitar" → se genera código único → se muestra link
2. Usuario A copia link y lo comparte
3. Usuario B abre link → página `/unirse/:codigo` → mutation `joinViaLink`
4. Usuario B queda como miembro aceptado
5. Se crea notificación para el creador del hábito

## Decisiones de Diseño

| Decisión | Elección | Justificación |
|---|---|---|
| Invitación | Link único con código | Más simple que email. No requiere buscar usuario. |
| Frecuencia | Diario (schema extensible) | MVP. Futuro: semanal, días laborables. |
| Calendario | Rolling 5 semanas | Suficiente para ver progreso. 12 meses es demasiado. |
| Zona horaria | Hora local del navegador | App se usa en un solo país por ahora. |
| Cierre del día | Medianoche local | `new Date()` en el navegador. |
| Racha grupal | Días donde TODOS completaron | Estricto. Más significativo. |
| Miembros | Salir libre / Creador puede expulsar | Ambos. |
| Notificaciones | Tabla en DB + badge navbar + toasts | Sin push, sin emails. |
| Gamificación | Logros en DB + toasts al desbloquear | Tabla `achievements`, cálculo en backend. |
| Idioma | Español | Toda la UI y este documento. |

## Convenciones

- **Idioma**: UI en español. Código (variables, funciones, comentarios, commits) en inglés
- **Tipado estricto**: TypeScript strict mode, evitar `any`
- **Validación**: Todas las funciones públicas de Convex usan `v.*` validators
- **Naming**: camelCase en variables/funciones, PascalCase en componentes/tipos
- **Archivos**: kebab-case para archivos de páginas y componentes
- **Rutas**: plural (`/habits`, `/habits/:id`)

## Estructura de Archivos (a crear/modificar)

```
convex/
├── schema.ts              ← NUEVO
├── auth.ts                ← EXISTENTE (mejorar)
├── habits.ts              ← NUEVO (queries)
├── habit-mutations.ts     ← NUEVO (mutations)
├── achievements.ts        ← NUEVO
├── notifications.ts       ← NUEVO
├── invites.ts             ← NUEVO

src/
├── main.tsx               ← MODIFICAR
├── App.tsx                ← MODIFICAR (RouterProvider)
├── index.css              ← MODIFICAR (@import tailwind)
├── lib/
│   └── auth-client.ts     ← EXISTENTE
├── components/
│   ├── Layout.tsx          ← NUEVO (navbar + Outlet)
│   ├── Toast.tsx           ← NUEVO
│   ├── ContributionCalendar.tsx ← NUEVO
│   ├── CalendarCell.tsx    ← NUEVO
│   ├── GroupStreak.tsx     ← NUEVO
│   ├── MemberList.tsx      ← NUEVO
│   ├── InviteButton.tsx    ← NUEVO
│   └── HabitCard.tsx       ← NUEVO
├── pages/
│   ├── Dashboard.tsx       ← NUEVO
│   ├── HabitDetail.tsx     ← NUEVO
│   ├── CreateHabit.tsx     ← NUEVO
│   ├── JoinHabit.tsx       ← NUEVO
│   └── Invitations.tsx     ← NUEVO
├── hooks/
│   └── useToast.ts         ← NUEVO
└── types/
    └── index.ts            ← NUEVO (tipos compartidos)
```
