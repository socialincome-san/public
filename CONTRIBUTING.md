# Contributing Code to Social Income

#### Setup and conventions

- Setup, local login and deployment: [README](README.md)
- Website (Next.js app and backend):
  [website/AGENTS.md](website/AGENTS.md)
- Design system (shared components and tokens):
  [design-system/AGENTS.md](design-system/AGENTS.md)
- Recipient App: [Readme](recipients_app/README.md) /
  [Contributing](recipients_app/CONTRIBUTING.md)

The `AGENTS.md` files are written for people and coding agents alike.
They describe the architecture that lint enforces: generic UI lives in
the design system, the website composes it, and backend code follows the
module, integration and lib structure. Point your agent at them, and run
`npm run lint`, `npm run typecheck` and `npm run test:unit` in every
workspace you changed before opening a pull request.

#### Find your issue to work on:

- [Good first issues](https://github.com/socialincome-san/public/contribute)
- [Help wanted](https://github.com/socialincome-san/public/issues?q=is%3Aopen+is%3Aissue+label%3A%22good+first+issue%22)
- [All issues](https://github.com/socialincome-san/public/issues?q=is%3Aopen+is%3Aissue)
