# Contributing Code for the Admin Tool

## Getting Started

Install dependencies and start the local development server:

```shell
npm install
npm run firebase:serve
npm run admin:serve
```

## Testing

Run:

```shell
npm run admin:test
```

This will automatically start a new emulator instance and run the tests
against it.

## Deployment

Commits to open PRs are automatically deployed as previews on to
Firebase (runs on staging Firestore). When a PR is merged into the
`main` branch, the code is automatically deployed to the staging
environment. See the [Github Actions](../.github/workflows) for more
details.
