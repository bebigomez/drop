# AGENTS.md — Drop

## Quick Start
```bash
npm run dev        # Vite dev server (localhost:5173)
npx convex dev     # Convex backend (requires Docker running)
npm run build      # tsc -b && vite build (typecheck first)
npm run lint       # ESLint
```

## Project State
Group habit tracking app ("Drop") built on a `convex-auth-starter` template.
- **Done**: Tailwind v4 installed, docs written
- **Next**: Convex schema → backend functions → routing → pages → calendar → invites → toasts → achievements
- **Current branch**: `feat/setup-tailwind` (not yet merged to main)

## Architecture
- **Stack**: React 19 + Vite 8 + React Router (planned, not yet installed) + Tailwind v4 + Convex + Better Auth
- **Auth gating**: `<Authenticated>` / `<Unauthenticated>` / `<AuthLoading>` from `convex/react`; Convex client has `expectAuth: true`
- **Convex auth pattern**: `authComponent.getAuthUser(ctx)` in mutations/queries; `authComponent.getAuth(createAuth, ctx)` for server-side Better Auth API calls
- **Client auth**: `authClient.useSession()` from `better-auth/react` for session data; `authClient` created in `src/lib/auth-client.ts` with `convexClient()` + `crossDomainClient()` plugins from `@convex-dev/better-auth/client/plugins`
- **Better Auth**: configured with email/password + Google; HTTP routes in `convex/http.ts`; database adapter via `authComponent.adapter(ctx)`
- **Self-hosted Convex**: Docker required; config in `docker-compose.yml`; `.env.local` needs `VITE_CONVEX_URL`, `VITE_CONVEX_SITE_URL`, `BETTER_AUTH_URL`, `SITE_URL`, Google OAuth vars

## Conventions
- UI text in **Spanish**, code (identifiers, comments, commits) in **English**
- camelCase vars/functions, PascalCase components/types, kebab-case file names
- Commits: `tipo(scope): desc en español` — `feat`, `fix`, `chore`, `refactor`, `docs`
- Branches: GitHub Flow (feature → main via PR)
- All public Convex functions must validate args with `v.*` validators

## TypeScript Quirks
- `verbatimModuleSyntax: true` → use `import type` for type-only imports
- `noUnusedLocals` / `noUnusedParameters` → unused vars/params cause compilation errors
- `erasableSyntaxOnly` → no `enum` keyword, use union types instead
- `build` runs `tsc -b` first → type errors block production build

## Tailwind CSS v4
- Vite plugin (`@tailwindcss/vite`) in `vite.config.ts` — no PostCSS, no `tailwind.config.js`
- CSS entry: `@import "tailwindcss"` — no `@tailwind` directives
- Existing CSS vars in `index.css` coexist with Tailwind classes

## Convex Specifics
- Types auto-generated in `convex/_generated/` — run `npx convex dev` to regenerate after schema changes
- Schema: `defineSchema` + `defineTable` with `v.*` validators; indexes defined inline with `.index("by_name", ["field"])`
- `@convex-dev/better-auth` is a Convex component registered in `convex/convex.config.ts`
- Convex queries are reactive — UI updates automatically without polling
- Convex file names: only alphanumeric, underscores, or periods — **no hyphens** (e.g. `habit_mutations.ts`, not `habit-mutations.ts`)

## Implementation Plan (docs/05-plan-implementacion.md)
| Step | What | Branch |
|------|------|--------|
| 1 | Setup Tailwind | `feat/setup-tailwind` |
| 2-3 | Schema + backend | `feat/backend-core` |
| 4-5 | Routing + pages | `feat/routing-and-pages` (depends on steps 1, 2-3) |
| 6 | Calendar | `feat/habit-calendar` |
| 7 | Invitations | `feat/invitations` |
| 8 | Toasts + notifications | `feat/notifications-and-toasts` |
| 9 | Achievements | `feat/gamification` |

## Resources
- 6 spec docs in `docs/` — consult for schema, API, routes, component design, plan, branching
- `docs/06-plan-desarrollo.md` for full branch/commit plan
