# Plan de Implementación

## Orden de Implementación

Cada paso depende del anterior. No saltarse pasos.

---

## Paso 1: Setup de Tailwind CSS

**Archivos a modificar:**
- `vite.config.ts`
- `src/index.css`
- `package.json`

**Qué hacer:**
1. Instalar dependencias:
   ```bash
   npm install tailwindcss@next @tailwindcss/vite@next
   ```
2. Agregar plugin de Vite en `vite.config.ts`:
   ```typescript
   import tailwindcss from "@tailwindcss/vite";

   export default defineConfig({
     plugins: [
       tailwindcss(),
       react(),
     ],
   });
   ```
3. Reemplazar contenido de `src/index.css`:
   ```css
   @import "tailwindcss";
   ```
4. Verificar que compile con `npm run dev`

**Criterio de éxito:** La app carga sin errores de CSS/Tailwind.

---

## Paso 2: Schema de Convex

**Archivos a crear:**
- `convex/schema.ts`

**Qué hacer:**
1. Crear schema con las 5 tablas: `habits`, `habitMembers`, `habitLogs`, `achievements`, `notifications`
2. Definir índices según docs/02-esquema-bd.md
3. Ejecutar `npx convex dev` para generar tipos
4. Verificar que `convex/_generated/dataModel.d.ts` tenga los tipos correctos

**Criterio de éxito:** `convex dev` corre sin errores. Los tipos están generados.

---

## Paso 3: Funciones de Convex (Backend)

**Archivos a crear:**
- `convex/habits.ts` — queries
- `convex/habit-mutations.ts` — mutations
- `convex/achievements.ts` — lógica de logros
- `convex/notifications.ts` — lógica de notificaciones

**Archivos a modificar:**
- `convex/auth.ts` — exportar helper `getCurrentUserOrThrow`

**Qué hacer (en orden):**
1. Exportar helper `getCurrentUserOrThrow` desde `convex/auth.ts`
2. Crear query `getUserHabits`
3. Crear query `getHabitDetails`
4. Crear mutation `createHabit`
5. Crear mutation `toggleLog`
6. Crear mutation `regenerateInviteCode`
7. Crear mutation `joinViaLink`
8. Crear mutation `leaveHabit`
9. Crear mutation `removeMember`
10. Implementar sistema de logros en `convex/achievements.ts`
11. Implementar sistema de notificaciones en `convex/notifications.ts`
12. Verificar que todo compila con `npx convex dev`

**Detalle importante para toggleLog:**
- El side effect de check de logros debe ejecutarse DESPUÉS de insertar/actualizar el log
- Usar un `setTimeout` no es necesario — es síncrono dentro de la mutation
- Los logros y notificaciones se crean en la misma transacción de Convex

**Criterio de éxito:** Todas las funciones compilan. Se pueden invocar desde el playground de Convex.

---

## Paso 4: React Router + Layout Base

**Archivos a modificar:**
- `src/main.tsx`
- `src/App.tsx`

**Archivos a crear:**
- `src/components/Layout.tsx`

**Qué hacer:**
1. Modificar `src/App.tsx` para usar `createBrowserRouter` + `RouterProvider`
2. Crear `Layout.tsx` con Navbar + `<Outlet />`
3. Mantener el wrapper `<Authenticated>` / `<Unauthenticated>` gating
4. Las rutas protegidas (autenticadas) son: Dashboard, HabitDetail, CreateHabit
5. La ruta `/unirse/:codigo` puede ser accedida sin auth (redirige a login si no está autenticado)
6. Verificar navegación entre rutas

**Criterio de éxito:** Se puede navegar entre rutas. La Navbar aparece en todas las páginas autenticadas.

---

## Paso 5: Páginas Principales

**Archivos a crear:**
- `src/pages/Dashboard.tsx`
- `src/pages/CreateHabit.tsx`
- `src/pages/HabitDetail.tsx`
- `src/pages/JoinHabit.tsx`
- `src/components/HabitCard.tsx`

**Qué hacer (en orden):**
1. `CreateHabit.tsx` — Formulario simple, llama a `createHabit`, redirige
2. `Dashboard.tsx` + `HabitCard.tsx` — Lista de hábitos, llama a `getUserHabits`
3. `HabitDetail.tsx` — Página principal del hábito (sin calendario aún)
4. `JoinHabit.tsx` — Página de destino del link de invitación

**Criterio de éxito:** Se puede crear un hábito, verlo en el dashboard, y navegar a su detalle.

---

## Paso 6: Calendario de Contribuciones

**Archivos a crear:**
- `src/components/ContributionCalendar.tsx`
- `src/components/CalendarCell.tsx`
- `src/components/GroupStreak.tsx`
- `src/components/MemberList.tsx`

**Qué hacer:**
1. `CalendarCell.tsx` — Componente de celda individual con colores según ratio de cumplimiento
2. `ContributionCalendar.tsx` — Grid de 7 filas × ~5 columnas. Calcular fechas. Dibujar celdas.
3. Integrar calendario en `HabitDetail.tsx`
4. `GroupStreak.tsx` — Mostrar racha grupal
5. `MemberList.tsx` — Lista de miembros con racha y % de cumplimiento

**Lógica del calendario (detalle):**
```typescript
function getWeeksForCalendar(today: Date): Date[][] {
  // 1. Ir 34 días atrás desde hoy
  // 2. Agrupar por semana (lun-dom)
  // 3. Retornar array de semanas, cada semana es array de 7 días
  // Nota: la primera y última semana pueden tener días del mes anterior/siguiente
}
```

**Colores con Tailwind:**
- Usar clases condicionales basadas en el ratio de cumplimiento
- `ring-2 ring-purple-500` para hoy
- Tooltip con datos al hover (usar `title` o un tooltip personalizado simple)

**Criterio de éxito:** El calendario se renderiza con colores. Click en celda hace toggle. Tooltip muestra datos.

---

## Paso 7: Invitaciones por Link

**Archivos a modificar:**
- `src/components/InviteButton.tsx` (nuevo)
- `src/pages/JoinHabit.tsx` (completar)

**Qué hacer:**
1. `InviteButton.tsx` — Botón que genera link y lo copia al portapapeles
   - Mostrar el link en un input readonly con botón "Copiar"
   - Opción de "Regenerar código" con confirmación
2. Completar `JoinHabit.tsx` — Llamar `joinViaLink`, mostrar resultado, redirigir
3. El creador ve el botón de invitar en `HabitDetail.tsx`
4. Cualquier miembro puede ver y compartir el link

**Criterio de éxito:** Se genera link. Otro usuario puede unirse usando el link.

---

## Paso 8: Toast + Notificaciones

**Archivos a crear:**
- `src/hooks/useToast.ts`
- `src/components/Toast.tsx`

**Archivos a modificar:**
- `src/components/Layout.tsx` — agregar ToastContainer
- `src/pages/HabitDetail.tsx` — agregar notificaciones

**Qué hacer:**
1. Crear contexto/provider de toasts en `useToast.ts`
2. Crear `Toast.tsx` — componente visual de toast flotante
3. Integrar en `Layout.tsx` — ToastContainer
4. Agregar badge de notificaciones no leídas en Navbar
5. Mostrar dropdown con lista de notificaciones al hacer click en badge
6. Marcar como leídas al abrir dropdown

**Criterio de éxito:** Toasts aparecen al crear hábito, toggle log, copiar link, etc. Badge de notificaciones funciona.

---

## Paso 9: Gamificación (Logros)

**Archivos a modificar:**
- `convex/achievements.ts`

**Qué hacer:**
1. Implementar lógica de check de logros en el backend (ya esqueleto en paso 3)
2. Asegurar que los logros se otorgan automáticamente después de `toggleLog`
3. Logros también se checkean al unirse un nuevo miembro (para `first_member`)
4. Mostrar toasts de logro desbloqueado
5. (Opcional) Mostrar lista de logros conseguidos en algún lado

**Criterio de éxito:** Al cumplir streak de 3 días, aparece toast de logro. Logro queda registrado en DB.

---

## Verificación Final (Checklist MVP)

- [ ] Usuario se registra e inicia sesión
- [ ] Usuario crea un hábito → aparece en Dashboard
- [ ] Usuario ve link de invitación → lo copia
- [ ] Otro usuario usa el link → se une al hábito
- [ ] Ambos ven el calendario con los datos del grupo
- [ ] Usuario hace click en un día → se marca como completado
- [ ] El calendario cambia de color según cumplimiento grupal
- [ ] La racha grupal se actualiza correctamente
- [ ] La racha personal se muestra correctamente
- [ ] Aparecen toasts al completar un día, crear hábito, copiar link
- [ ] Logros se otorgan (streak 3, 7, etc.) con toast
- [ ] Notificaciones aparecen cuando alguien se une
- [ ] Usuario puede salirse del hábito
- [ ] Creador puede expulsar miembros
- [ ] Todo funciona en español
