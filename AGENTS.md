<!-- BEGIN:smartive-agent-rules -->

> Managed by @smartive-private/ai-playbook v1.9.0.

# Philosophy

Write code that stays maintainable under repeated change. Prefer small,
verifiable improvements over clever shortcuts. Fight entropy. Leave the
codebase better than you found it.

## General Rules

- Ask questions until you have enough context to give an accurate and
  confident answer
- Only make changes that are directly requested. Keep solutions simple
  and focused.
- Prefer clear function/variable names over inline comments
- Prefer simple inline expressions over extracting single-use helper
  functions
- Always read and understand relevant files before proposing edits. Do
  not speculate about code you have not inspected.

# React Rules

- Customize behavior through composition; reserve boolean props for
  clear semantics (for example `disabled`).
- Split massive JSX blocks into understandable and composable smaller
  components
- Colocate code and state that changes together
- Keep state minimal; derive values when possible.
- Consolidate related state transitions with `useReducer` when multiple
  state updates belong together
- Use `useEffect` only for external synchronization; if unsure, check
  `.ai-playbook/react-use-effect.md`

# Web App Rules

- When creating web UIs, follow Web Interface Guidelines in
  `.ai-playbook/web-interface-guidelines.md`
- When creating web animations, follow Web Animation Design in
  `.ai-playbook/web-animation-design.md`

# TypeScript Rules

- NEVER use any, as any, or @ts-ignore. If types are complex, take the
  time to define them properly or ask for clarification.
- Prefer arrow functions over function declarations
- Prefer destructuring over assigning to a variable
- Prefer template literals over string concatenation
- Prefer types over interfaces
- Prefer type guards over type assertions
- Prefer importing types using the type keyword (e.g.
  `import { type MyType } from 'package';`), to ensure they are erased
  at runtime

# Terraform Rules

- Keep plans deterministic; pin provider versions and avoid implicit
  behavior.
- Treat `terraform plan` output as a required review artifact.
- Prefer modules and variables over duplicated infrastructure blocks.
- Protect state and credentials; never store secrets in plaintext.

<!-- END:smartive-agent-rules -->

# Repository

Social Income is an open-source platform for unconditional basic income.
Instructions for a specific app live next to that app, so they load only
when work is happening there.

- `design-system/` — shared React components (`@socialincome/design-system`) and Storybook. No Storyblok, Prisma, or website modules. Rules: `design-system/AGENTS.md`.
- `website/` — Next.js app (public site, portal, dashboard, partner space, API). Run commands from this directory. Node is pinned in `website/mise.toml`. Rules: `website/AGENTS.md`.
- `recipients_app/` — Flutter app for recipients. Rules: `recipients_app/AGENTS.md`.
- `seed/` — Firebase emulator seed data.

Install dependencies with `npm ci` from the repository root (`npm ci --prefix ..` from `website/`). From `website/`: `mise dev` starts Postgres, the Firebase emulators, and Next.js. `npm run lint` runs the architecture tests, then ESLint. Also `npm run typecheck` and `npm run test:unit`. Storybook runs from `design-system/`.
