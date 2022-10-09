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

This package should be run within the public monorepo of Social Income.
The recommended way is to use `make` with `Makefile` in the root of the
project. These commands run the project inside Docker.

```sh
# Build the UI. For one time builds e.g. production builds.
$ make ui-build

# Run the development server on http://localhost:6006. Use only this while developing for the UI.
$ make ui-serve
```

\_Installation of dependencies happens upon running any of these
commands\_

#### Without `make`

If for whatever reason you can't use `make`, you can the Docker Compose
commands directly. See the `Makefile` in the root for how that might
work.

## Contribute

There are several ways to contribute to the Social Income UI project.
See the [`CONTRIBUTION.md`](/CONTRIBUTION.md) file.
