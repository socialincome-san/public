# Social Income - CLAUDE.md

## Primary Directive

- Match existing code patterns exactly before writing any code
- Examine 3+ similar files before making changes
- Never introduce new patterns without approval
- Avoid `any` type - use existing types, package types, or define new
  ones

## Project Overview

Social Income is an open-source platform for unconditional basic income.
The repository holds a Next.js app in `website/` and a Flutter app in
`recipients_app/`. Node 24 is pinned in `website/mise.toml`.

**Apps:**

- `website/` - Main Next.js app (public site, portal, dashboard, API)
- `recipients_app/` - Flutter mobile app

## Architecture

Follow @../AGENTS.md. That file is the module, Result, and lint contract.
Do not restate it here.

**Components** (UI):

- Use `React.forwardRef` with `displayName`
- Use CVA (class-variance-authority) for variants
- Use Radix UI primitives as base
- Example: `website/src/components/button/button.tsx`

## Key File Locations

- Prisma schema: `website/src/lib/database/schema.prisma`
- Modules: `website/src/modules/[domain]/`
- Integrations: `website/src/integrations/`
- UI Components: `website/src/components/`
- App Routes: `website/src/app/`
- `cn`: `website/src/lib/utils/cn.ts`

## Tech Stack

- React 19, Next.js 16, TypeScript 6
- Prisma ORM + PostgreSQL
- Firebase (Auth, Firestore, Storage)
- Storyblok CMS
- Tailwind CSS + Radix UI
- XState (state machines), Zod (validation)
- date-fns, luxon

## Commands

```bash
cd website
mise dev                      # Postgres, Firebase emulators, Next.js, Storybook
npm run lint                  # Architecture rule tests, then ESLint
npm run typecheck             # TypeScript check
npm run test:unit             # Jest tests
npm run test:e2e              # Playwright
npm run db:studio             # Prisma Studio
npm run format:fix            # Prettier
```

## File Naming

- All files: `kebab-case`
- Semantic suffixes: `*.service.ts`, `*.actions.ts`, `*.repository.ts`,
  `*.types.ts`, `*-form.tsx`, `*-helpers.ts`
- Default exports for pages, named exports for utilities

## Critical Rules

- Use Tailwind classes only (no CSS modules, styled-components)
- Use `cn()` from `website/src/lib/utils/cn.ts` for class merging
- Check existing implementations in the codebase before adding dependencies

## Test Accounts (Local Dev)

- Local auth uses deterministic hardcoded seed data.
- To see which users can log in locally, open:
  <http://localhost:4000/auth>

## Resources

- API Docs: <https://socialincome.org/v1/api-docs>
- Storybook: <https://socialincome.org/storybook>
- Project README: `/README.md`
