# Esquema de Base de Datos — Convex

Archivo: `convex/schema.ts`

## Tablas

### `habits`

Almacena la definición del hábito.

```typescript
habits: defineTable({
  name: v.string(),
  description: v.optional(v.string()),
  createdBy: v.id("users"),
  frequency: v.string(),          // "daily"
  inviteCode: v.string(),         // código único para link de invitación
  createdAt: v.number(),          // Date.now()
})
.index("by_invite_code", ["inviteCode"])
.index("by_creator", ["createdBy"])
```

- `frequency` se deja como string para poder añadir "weekly" o "weekdays" después
- `inviteCode` es un string aleatorio (ej. `nanoid(12)`) único

### `habitMembers`

Usuarios que pertenecen a un hábito.

```typescript
habitMembers: defineTable({
  habitId: v.id("habits"),
  userId: v.id("users"),
  status: v.string(),       // "accepted" | "pending" | "declined"
  invitedBy: v.id("users"),
  joinedAt: v.optional(v.number()),
})
.index("by_habit", ["habitId"])
.index("by_user", ["userId"])
.index("by_habit_user", ["habitId", "userId"])
```

- `pending` solo para invitaciones por email (futuro). Con invite link se crea directo como `accepted`
- `invitedBy` es el usuario que creó el hábito o generó el link

### `habitLogs`

Registro diario de cumplimiento por usuario.

```typescript
habitLogs: defineTable({
  habitId: v.id("habits"),
  userId: v.id("users"),
  date: v.string(),            // "YYYY-MM-DD"
  completed: v.boolean(),
  updatedAt: v.number(),       // Date.now()
})
.index("by_habit_date", ["habitId", "date"])
.index("by_habit_user_date", ["habitId", "userId", "date"])
.index("by_user_habit_date", ["userId", "habitId", "date"])
```

- `date` en formato YYYY-MM-DD usando hora local del navegador
- Un documento por (habitId, userId, date). Si el usuario no ha completado, no hay documento.
- `updatedAt` permite saber cuándo fue la última vez que se modificó

### `achievements`

Logros desbloqueados por usuarios.

```typescript
achievements: defineTable({
  habitId: v.id("habits"),
  userId: v.id("users"),
  type: v.string(),         // ver "Tipos de logros" abajo
  unlockedAt: v.number(),   // Date.now()
})
.index("by_habit_user", ["habitId", "userId"])
.index("by_user", ["userId"])
```

### `notifications`

Notificaciones in-app.

```typescript
notifications: defineTable({
  userId: v.id("users"),          // destinatario
  type: v.string(),                // "member_joined" | "achievement_unlocked"
  habitId: v.id("habits"),
  message: v.string(),             // texto en español
  read: v.boolean(),
  createdAt: v.number(),           // Date.now()
})
.index("by_user", ["userId"])
.index("by_user_unread", ["userId", "read"])
```

## Tipos de Logros

```typescript
// Personales
"first_log"           // Primer día completado
"streak_3"            // Racha personal de 3 días
"streak_7"            // Racha personal de 7 días
"streak_14"           // Racha personal de 14 días
"streak_30"           // Racha personal de 30 días
"perfect_week"        // 7 días seguidos completados

// Grupales
"group_streak_3"      // Racha grupal de 3 días
"group_streak_7"      // Racha grupal de 7 días
"group_perfect_week"  // Todos completaron 7 días seguidos
"first_member"        // Primer miembro en unirse (después del creador)
```

## Tipos de Notificaciones

```typescript
"member_joined"         // "{nombre} se unió al hábito"
"achievement_unlocked"  // "Logro desbloqueado: {nombre del logro}"
"member_left"           // "{nombre} abandonó el hábito"
```

## Relaciones

```
habits.createdBy ──→ users._id
habits._id ──→ habitMembers.habitId
users._id ──→ habitMembers.userId
habits._id ──→ habitLogs.habitId
users._id ──→ habitLogs.userId
habits._id ──→ achievements.habitId
users._id ──→ achievements.userId
users._id ──→ notifications.userId
```

## Validaciones Adicionales

- `inviteCode` en `habits`: único, 12 caracteres alfanuméricos
- `date` en `habitLogs`: formato YYYY-MM-DD válido
- `status` en `habitMembers`: solo "accepted" | "pending" | "declined"
- `frequency` en `habits": solo "daily" por ahora
- Un usuario no puede tener más de un `habitMember` por `habitId` (índice único compuesto)
