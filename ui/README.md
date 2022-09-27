# Social Income - User Interface (UI)

The UI guidelines, specifications, assets and components to be used for
Social Income services and platforms.

- Reusable components for React
- Documentation, preview and test environment with Storybook.

## Development

### Prerequisites

Setup as described in the `README.md` of the root folder of this
monorepo.

### Setup

This package should be run in the context of the public monorepo of
Social Income. The recommended way is to use `make` with the `Makefile`
in the root of the project. Those commands run the project inside
Docker.

```sh
# Build the UI. For one time builds e.g. production builds.
$ make build-ui

# Run the development server on http://localhost:6006. Just use this while developing for the UI.
$ make serve-ui
```

\_Installation of the dependencies is happening on running any of these
commands\_

#### Without Make

If for whatever reason you can't use make, you can the Docker Compose
commands directly. See the `Makefile` in the root for how that might
work.

## Contribute

There are several ways to contribute to the Social Income UI project.
See the [`CONTRIBUTION.md`](/CONTRIBUTION.md) file.
