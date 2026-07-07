# Code Review: Convex Backend

Evaluación del backend de Convex contra las mejores prácticas documentadas en [docs.convex.dev](https://docs.convex.dev) (Julio 2026).

## Buenas prácticas seguidas ✅

- **Validación de args con `v.*`** — todas las funciones públicas (`query`, `mutation`) usan validadores
- **Nombres de índices con prefijo `by_`** — ej. `by_invite_code`, `by_habit_user`, `by_user_habit_date`
- **Esquema modular** — `defineSchema`/`defineTable` con tipos generados automáticamente
- **Separación por dominio** — `auth.ts`, `habits.ts`, `habit_mutations.ts`, `notifications.ts`, `achievements.ts`
- **`import type`** — respeta `verbatimModuleSyntax` en todo el código
- **Auth con Better Auth** — uso correcto de `authComponent.getAuthUser(ctx)` (método propio del componente, no `ctx.auth` estándar)
- **Config de TypeScript** — `convex/tsconfig.json` hereda de `tsconfig.node.json` con `types: ["node"]`

## Áreas de mejora ❌

### 1. Usar `ConvexError` en vez de `throw new Error`

**Docs**: [Application Errors](https://docs.convex.dev/functions/error-handling/application-errors)

`ConvexError` propaga datos estructurados al cliente y permite manejo diferenciado con `instanceof`. `Error` plano se trata como error interno de desarrollador y no llega al frontend.

**Afecta**: `auth.ts`, `habits.ts`, `habit_mutations.ts` (~15 ocurrencias)

```typescript
// ❌ Actual
throw new Error("No autenticado");

// ✅ Recomendado
throw new ConvexError("No autenticado");
```

### 2. Falta `returns` en funciones públicas

**Docs**: [Function Validation](https://docs.convex.dev/functions/validation)

Especificar `returns` mejora la documentación y la seguridad de tipos extremo a extremo.

**Afecta**: todas las funciones en `habits.ts` y `habit_mutations.ts`

```typescript
// ❌ Actual
export const createHabit = mutation({
  args: { name: v.string(), description: v.optional(v.string()) },
  handler: async (ctx, args) => { ... },
});

// ✅ Recomendado
export const createHabit = mutation({
  args: { name: v.string(), description: v.optional(v.string()) },
  returns: v.id("habits"),
  handler: async (ctx, args) => { ... },
});
```

### 3. Magic number `34` hardcodeado

Aparece en `habits.ts` (líneas 28, 81) y `achievements.ts` (línea 112) como ventana de días hacia atrás.

```typescript
// ❌ Actual
const pastDate = getPastDate(34, today);

// ✅ Recomendado
const DAYS_LOOKBACK = 34;
const pastDate = getPastDate(DAYS_LOOKBACK, today);
```

### 4. Type assertion frágil en `getCurrentUserOrThrow`

**Afecta**: `auth.ts`

El tipo retornado por `authComponent.getAuthUser(ctx)` tiene `userId: string | null | undefined` por el schema interno del componente Better Auth. La aserción actual es funcional pero verbosa.

```typescript
// ❌ Actual
return user as typeof user & { userId: string };

// Alternativa: tipo auxiliar
type AuthedUser = NonNullable<Awaited<ReturnType<typeof authComponent.getAuthUser>>>;
// o extraer a un tipo reutilizable
```

## Referencias

- [Convex Function Guidelines](https://docs.convex.dev/functions)
- [Schema Validation](https://docs.convex.dev/functions/validation)
- [Application Errors](https://docs.convex.dev/functions/error-handling/application-errors)
- [Better Auth Component](https://www.convex.dev/components/better-auth)
- [TypeScript Best Practices](https://docs.convex.dev/understanding/best-practices/typescript)
