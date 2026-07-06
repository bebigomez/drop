# Rutas y Componentes — Frontend

## Estructura de React Router

Archivo: `src/App.tsx`

```typescript
// Usar createBrowserRouter + RouterProvider
// Las rutas existentes de auth (Authenticated/Unauthenticated) se mantienen
// Pero en lugar de <Welcome />, se renderiza <RouterProvider>

// Estructura de rutas:
const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,  // Layout con Navbar + Outlet
    children: [
      { index: true, element: <Dashboard /> },
      { path: "habitos/nuevo", element: <CreateHabit /> },
      { path: "habitos/:id", element: <HabitDetail /> },
      { path: "unirse/:codigo", element: <JoinHabit /> },
    ],
  },
]);
```

## Árbol de Componentes

```
<RouterProvider>
  <Layout>                  ← Navbar + Toast container + Outlet
    <Dashboard>             ← "/"
      <HabitCard />         ← por cada hábito
    <CreateHabit />         ← "/habitos/nuevo"
    <HabitDetail />         ← "/habitos/:id"
      <ContributionCalendar>
        <CalendarCell />    ← por cada día
      </ContributionCalendar>
      <GroupStreak />
      <MemberList />
      <InviteButton />
    <JoinHabit />           ← "/unirse/:codigo"
  </Layout>
</RouterProvider>
```

## Layout (`src/components/Layout.tsx`)

**Navbar:**
- Logo/nombre de la app ("Drop")
- Link a Dashboard ("Mis hábitos")
- Badge con contador de notificaciones no leídas + dropdown
- Botón "Cerrar sesión"

**ToastContainer:**
- Renderiza toasts desde un contexto/provider
- Posición: top-right
- Auto-dismiss después de 4s
- Tipos: success (logro), info (notificación), error

## Dashboard (`src/pages/Dashboard.tsx`)

**HabitCard:**
- Nombre del hábito
- Racha personal actual
- Mini-calendario de 7 días (mini barras de cumplimiento)
- Número de miembros
- onClick → navega a `/habitos/:id`

## CreateHabit (`src/pages/CreateHabit.tsx`)

**Flujo:**
1. Llenar nombre + descripción opcional
2. Click "Crear hábito" → mutation `createHabit`
3. Redirigir a `/habitos/:id` del nuevo hábito

## HabitDetail (`src/pages/HabitDetail.tsx`)

**Secciones:**
1. **Header**: nombre, descripción, botón invitar
2. **Rachas**: grupal y personal lado a lado
3. **ContributionCalendar**: grid de 5 semanas (7 rows × ~5 cols)
4. **MemberList**: lista de miembros con racha personal y % de cumplimiento

### ContributionCalendar

El componente central. Renderiza un grid de 7 filas (lun-dom) × 5-6 columnas (semanas).

**Especificaciones:**
- Cada celda representa un día
- Se muestran los últimos 35 días (5 semanas) hasta hoy
- Las celdas futuras (después de hoy) se muestran vacías/gris claro
- Las celdas se dibujan de lunes a domingo (como GitHub)

**Colores de celda (Tailwind clases):**
| Estado | Clase | Descripción |
|---|---|---|
| Sin datos / futuro | `bg-gray-100 dark:bg-gray-800` | No hay registro |
| 0% completado | `bg-gray-200 dark:bg-gray-700` | Nadie completó |
| >0% y < 50% | `bg-green-200 dark:bg-green-900` | Algunos completaron |
| ≥50% y < 100% | `bg-green-400 dark:bg-green-600` | Mayoría completó |
| 100% completado | `bg-green-600 dark:bg-green-400` | Todos completaron |
| Hoy | `ring-2 ring-purple-500` | Borde destacado |

**Tooltip al hover:**
```
"lun 15 de marzo · 3/4 miembros completaron"
```

**Click:**
- Si es el día de hoy o pasado → toggle del log personal
- Si es futuro → no hacer nada

### CalendarCell

Componente individual de celda.

**Props:**
```typescript
type CalendarCellProps = {
  date: string;           // "YYYY-MM-DD"
  completionRatio: number; // 0-1
  totalMembers: number;
  completedCount: number;
  isToday: boolean;
  isFuture: boolean;
  isPersonalCompleted: boolean | null;
}
```

### GroupStreak

```
🔥 Racha grupal: 5 días
```

Simplemente muestra el número de racha grupal con un ícono de fuego. Si la racha es 0, mostrar "Sin racha activa".

### MemberList

Lista de todos los miembros aceptados.

**Por cada miembro:**
- Avatar inicial (primera letra del nombre, con color aleatorio basado en userId)
- Nombre
- Racha personal
- % de cumplimiento en el periodo visible

## InviteButton

- Al hacer click en "Copiar link" → `navigator.clipboard.writeText(...)` + toast "Link copiado"
- Al regenerar → confirmación + mutation `regenerateInviteCode`

El link generado es: `{origin}/unirse/{inviteCode}`

## JoinHabit (`src/pages/JoinHabit.tsx`)

Página de destino del link de invitación.

**Flujo:**
1. Al cargar, validar que el `inviteCode` existe
2. Mostrar info del hábito
3. Click "Unirse" → mutation `joinViaLink`
4. Redirigir a `/habitos/:id`
5. Si el usuario no está autenticado → mostrar pantalla de auth primero

## Toast System

### Contexto: `useToast`

```typescript
type Toast = {
  id: string;
  type: "success" | "info" | "error";
  message: string;
};

function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  function addToast(type, message) {
    const id = nanoid();
    setToasts(prev => [...prev, { id, type, message }]);
    setTimeout(() => removeToast(id), 4000);
  }

  function removeToast(id) {
    setToasts(prev => prev.filter(t => t.id !== id));
  }

  return { toasts, addToast, removeToast };
}
```

### Cuándo mostrar toasts

| Evento | Tipo | Mensaje |
|---|---|---|
| Hábito creado | success | "Hábito creado correctamente" |
| Día completado | success | "¡Bien hecho!" |
| Día desmarcado | info | "Día marcado como pendiente" |
| Link copiado | success | "Link de invitación copiado" |
| Unido al grupo | success | "Te has unido al hábito" |
| Logro desbloqueado | success | "🎉 Logro: Racha de 7 días" |
| Error general | error | mensaje del error |
