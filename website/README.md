# Website

Customer facing website of Social Income.

## Basic Setup

For the basic setup, please refer to the main [README](../README.md)

## Start Website Locally

To serve the development server locally using docker run

```
make website-serve
```

or without docker use

```
npm run website:serve:emulator
```

The website will be accessible at http://localhost:3001

## Build Website Locally

To test the "production" bundling using the test data from the firebase
emulator, for docker run

```
make website-build
```

or without docker use

```
npm run website:build:emulator
```

## Deployment

The website is hosted on vercel.com. The deployment is done
automatically after merging a PR into the main branch. In the PRs, a
preview version is deployed.
