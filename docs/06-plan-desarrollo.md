# Plan de Desarrollo — Branches, Commits y PRs

## Estrategia

**GitHub Flow**: Cada feature branch se mergea directo a `main` vía Pull Request.

## Branches

| # | Branch | Pasos | Commits |
|---|---|---|---|
| 1 | `feat/setup-tailwind` | Paso 1 | `chore: add tailwind css v4 with vite plugin` |
| 2 | `feat/backend-core` | Pasos 2+3 | `feat: define convex schema with 5 tables` → `feat: implement queries` → `feat: implement mutations` → `feat: add notification and achievement helpers` |
| 3 | `feat/routing-and-pages` | Pasos 4+5 | `feat: set up react router with auth-gated layout` → `feat: add dashboard page with habit cards` → `feat: add create habit page` |
| 4 | `feat/habit-calendar` | Paso 6 | `feat: add contribution calendar component` → `feat: add habit detail page with calendar, streaks, and member list` |
| 5 | `feat/invitations` | Paso 7 | `feat: add invite link generation and join via link flow` |
| 6 | `feat/notifications-and-toasts` | Paso 8 | `feat: add toast system with useToast hook` → `feat: add in-app notification badge and dropdown in navbar` |
| 7 | `feat/gamification` | Paso 9 | `feat: add achievement system with automatic awarding and toast` |

## Formato de Commits

```
tipo(scope): descripción en español

Tipos: feat, fix, chore, refactor, docs
Scope: schema, api, ui, calendar, invites, notifications, achievements
```

## Formato de PR

Cada PR incluye:
- **Qué hace**
- **Enlace** al paso del plan (`docs/05-plan-implementacion.md#paso-N`)
- **Checklist** de criterios de éxito

## Dependencias

```
feat/setup-tailwind        ← independiente (paralelo con backend-core)
feat/backend-core          ← independiente (paralelo con setup-tailwind)
feat/routing-and-pages     ← depende de setup-tailwind + backend-core
feat/habit-calendar        ← depende de routing-and-pages + backend-core
feat/invitations           ← depende de backend-core
feat/notifications-toasts  ← depende de backend-core + routing-and-pages
feat/gamification          ← depende de habit-calendar + backend-core
```
