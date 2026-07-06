# API Backend — Convex Functions

## Ubicación de Archivos

| Archivo | Contenido |
|---|---|
| `convex/auth.ts` | `getCurrentUser` (existente, mejorado) |
| `convex/habits.ts` | Queries de hábitos |
| `convex/habit-mutations.ts` | Mutations de hábitos |
| `convex/achievements.ts` | Lógica de logros |
| `convex/notifications.ts` | Lógica de notificaciones |

## Helper: Obtener usuario actual

Todas las funciones protegidas usan este patrón (importando desde `./auth`):

```typescript
// convex/auth.ts
import { betterAuth } from "./auth";

export async function getCurrentUserOrThrow(ctx: any) {
  const user = await betterAuth.getCurrentUser(ctx);
  if (!user) throw new Error("No autenticado");
  return user;
}
```

---

## Queries

### `getUserHabits`

```
args: {}
returns: HabitWithProgress[]
```

Retorna todos los hábitos donde el usuario es miembro aceptado, con progreso resumido.

**Lógica:**
1. Obtener `currentUser`
2. Query `habitMembers` con `.withIndex("by_user", q => q.eq("userId", currentUser._id)).filter(q => q.eq(q.field("status"), "accepted"))`
3. Para cada miembro, fetch del `habits` correspondiente
4. Para cada hábito, contar logs de los últimos 7 días del grupo (para la preview)
5. Calcular racha personal y grupal actual (últimos 7 días)
6. Retornar array con: habit info + member count + racha personal + racha grupal

---

### `getHabitDetails`

```
args: { habitId: v.id("habits") }
returns: {
  habit: Habit,
  members: Member[],
  logs: { date: string, completedBy: number, totalMembers: number, userIds: string[] }[],
  personalLogs: { date: string, completed: boolean }[],
  groupStreak: number,
  personalStreak: number,
}
```

**Lógica:**
1. Validar que el usuario actual es miembro aceptado del hábito
2. Fetch habit info
3. Query habitMembers aceptados
4. Query habitLogs para el rango de fechas (hoy - 34 días)
5. Para cada día del rango, calcular:
   - Cuántos miembros completaron
   - Quiénes completaron
   - Ratio de cumplimiento
6. Calcular racha grupal (días consecutivos hacia atrás donde todos completaron)
7. Calcular racha personal del usuario

---

### `getPendingInvitations`

```
args: {}
returns: Invitation[]
```

Solo si implementamos invitación por email en el futuro. Para MVP con link, las invitaciones se aceptan automáticamente al unirse.

*Mantener esqueleto: retornar array vacío.*

---

## Mutations

### `createHabit`

```
args: { name: v.string(), description: v.optional(v.string()) }
returns: habitId
```

**Lógica:**
1. Validar `name` no vacío
2. Obtener `currentUser`
3. Generar `inviteCode` único (12 chars alfanuméricos, ej. nanoid)
4. Insertar en `habits`
5. Insertar en `habitMembers` con status "accepted" (creator)
6. Retornar `habitId`

---

### `toggleLog`

```
args: { habitId: v.id("habits"), date: v.string() }
returns: { completed: boolean }
```

**Lógica:**
1. Validar que el usuario es miembro aceptado
2. Validar que `date` no sea futura
3. Buscar log existente con `.withIndex("by_habit_user_date", ...)`
4. Si existe: hacer `patch` invirtiendo `completed`
5. Si no existe: `insert` con `completed: true`
6. Retornar nuevo estado
7. **Side effect**: check y otorgar logros

---

### `regenerateInviteCode`

```
args: { habitId: v.id("habits") }
returns: { inviteCode: string }
```

**Lógica:**
1. Validar que el usuario actual es el creador del hábito
2. Generar nuevo código único
3. Actualizar `habits` con nuevo código

---

### `joinViaLink`

```
args: { inviteCode: v.string() }
returns: { habitId }
```

**Lógica:**
1. Buscar `habits` por `inviteCode`
2. Si no existe → error "Código inválido"
3. Obtener `currentUser`
4. Verificar que no sea ya miembro
5. Insertar en `habitMembers` con status "accepted"
6. Crear notificación: `"{nombre} se unió al hábito"`
7. Check logro `first_member` para el creador (si aplica)

---

### `leaveHabit`

```
args: { habitId: v.id("habits") }
returns: void
```

**Lógica:**
1. Validar que es miembro
2. Si es el creador y hay otros miembros → error "Debes transferir o eliminar el hábito"
3. Si es el creador y es el único miembro → eliminar hábito
4. Eliminar `habitMembers` document
5. Crear notificación al creador

---

### `removeMember`

```
args: { habitId: v.id("habits"), memberId: v.id("users") }
returns: void
```

**Lógica:**
1. Validar que el usuario actual es el creador
2. Validar que no se está removiendo a sí mismo
3. Eliminar `habitMembers` del miembro

---

## Cálculo de Rachas

### Racha Personal

```
función calcularRachaPersonal(logs: { date: string, completed: boolean }[], hoy: string): number
```

1. Ordenar logs por fecha descendente
2. Iniciar desde hoy
3. Por cada día hacia atrás (consecutivo): si `completed === true`, incrementar racha
4. Si el día actual no tiene log → racha = 0
5. Si encuentra un día sin completar → detenerse
6. Retornar racha

### Racha Grupal

```
función calcularRachaGrupal(miembros: Member[], logs: Log[], hoy: string): number
```

1. Para cada día desde hoy hacia atrás:
   - Obtener todos los logs de ese día
   - Si TODOS los miembros tienen `completed === true` → incrementar racha
   - Si algún miembro no completó → detenerse
2. Retornar racha

---

## Sistema de Logros

### Check y Otorgamiento

Se ejecuta después de `toggleLog`. Archivo: `convex/achievements.ts`

```typescript
async function checkAndAwardAchievements(ctx, habitId, userId) {
  // Obtener logs del usuario y del grupo
  // Verificar cada tipo de logro
  // Si no está ya otorgado → insertar en achievements + crear notificación
}
```

### Condiciones de cada logro

| Logro | Condición |
|---|---|
| `first_log` | Primer `habitLog` del usuario en cualquier hábito |
| `streak_3` | Racha personal ≥ 3 |
| `streak_7` | Racha personal ≥ 7 |
| `streak_14` | Racha personal ≥ 14 |
| `streak_30` | Racha personal ≥ 30 |
| `perfect_week` | 7 logs consecutivos completados |
| `group_streak_3` | Racha grupal ≥ 3 |
| `group_streak_7` | Racha grupal ≥ 7 |
| `group_perfect_week` | Racha grupal ≥ 7 |
| `first_member` | Segundo `habitMember` aceptado en el hábito |

---

## Sistema de Notificaciones

### Crear notificación

Archivo: `convex/notifications.ts`

```typescript
async function createNotification(ctx, { userId, type, habitId, message }) {
  await ctx.db.insert("notifications", {
    userId,
    type,
    habitId,
    message,
    read: false,
    createdAt: Date.now(),
  });
}
```

### Consultar no leídas

Query: `getUnreadNotifications`
```
args: {}
returns: Notification[]
```

### Marcar como leídas

Mutation: `markNotificationsRead`
```
args: { notificationIds: v.array(v.id("notifications")) }
returns: void
```
