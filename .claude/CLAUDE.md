# Social Income - CLAUDE.md

## Primary Directive

- Match existing code patterns exactly before writing any code
- Examine 3+ similar files before making changes
- Never introduce new patterns without approval
- Avoid `any` type - use existing types, package types, or define new
  ones

## Project Overview

Social Income is an open-source platform for unconditional basic income.
npm workspaces monorepo with Node 22.

**Workspaces:**

- `website/` - Main Next.js 16 app (public site, portal, dashboard, API)
- `ui/` - Storybook component library (legacy, being migrated to
  website)
- `recipients_app/` - Flutter mobile app
- `recipients_selection/` - Cryptographic recipient draw

## Architecture Patterns

**Service Layer** (business logic):

- Services extend `BaseService` and return `ServiceResult<T>`
- Example: `website/src/lib/services/candidate/candidate.service.ts`

**Server Actions** (API layer):

- Use services, never access DB directly
- Always call `getActorOrThrow()` for auth
- Example: `website/src/lib/server-actions/candidate-actions.ts`

**Components** (UI):

- Use `React.forwardRef` with `displayName`
- Use CVA (class-variance-authority) for variants
- Use Radix UI primitives as base
- Example: `ui/src/components/button.tsx`

## Key File Locations

- Prisma schema: `website/src/lib/database/schema.prisma`
- Services: `website/src/lib/services/[domain]/`
- Server Actions: `website/src/lib/server-actions/`
- UI Components: `ui/src/components/`
- App Routes: `website/src/app/`
- Utilities: `ui/src/lib/utils.ts` (cn function)

## Tech Stack

- React 19, Next.js 16, TypeScript 5.7
- Prisma ORM + PostgreSQL
- Firebase (Auth, Storage)
- Storyblok CMS
- Tailwind CSS + Radix UI
- XState (state machines), Zod (validation)
- lodash, date-fns, luxon

## Commands

```bash
mise dev                      # Full local environment
npm run website:start         # Website + Firebase emulators
npm run ui:serve              # Storybook (port 6006)
npm run db:studio             # Prisma Studio
npm run website:test:unit     # Jest tests
npm run typecheck             # TypeScript check
npm run website:lint          # ESLint
npm run format-code           # Prettier
```

## File Naming

- All files: `kebab-case`
- Semantic suffixes: `*.service.ts`, `*-actions.ts`, `*.types.ts`,
  `*-form.tsx`, `*-helpers.ts`
- Default exports for pages, named exports for utilities

## Critical Rules

- Use lodash for utilities before writing custom implementations
- Use Tailwind classes only (no CSS modules, styled-components)
- Use Zod for validation schemas
- Use `cn()` from `ui/src/lib/utils.ts` for class merging
- Follow ServiceResult pattern for error handling
- Check existing implementations in codebase before adding dependencies

## Test Accounts (Local Dev)

| Role          | Email              | Route          |
| ------------- | ------------------ | -------------- |
| Contributor   | test@dashboard.org | /dashboard     |
| User          | test@portal.org    | /portal        |
| Local Partner | test@partner.org   | /partner-space |

## Resources

- API Docs: https://socialincome.org/v1/api-docs
- Storybook: http://design.socialincome.org
- Project README: `/README.md`
