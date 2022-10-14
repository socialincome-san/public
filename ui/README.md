# Social Income - User Interface (UI)

The UI guidelines, specifications, assets and components to be used for
Social Income services and platforms.

- Reusable components for React
- Documentation, preview and test environment with Storybook.

## Usage in React

To use the React components in a project:

### Install

**Important: The package is not yet published to npm and cannot be
installed this way**.

```sh
$ npm i @socialincome/ui
```

Use the components:

```tsx
import { SoButton } from '@socialincome/ui';
```

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

## Build for publishing

To create the bundle that can be consumed by other projects, we need to
build the project with RollupJs. When you run `build`, following steps
are performed:

- **Create barrels**: Barrels are `index` files that allow users to
  import files via the package name without expanding the path
  explicitly. We use
  [BarrelsBy](https://github.com/bencoveney/barrelsby) to automatically
  create the barrel files when `build` is run.
- **Create a build with Rollup**: RollupJS creates different bundle for
  different use cases e.g. CommonJS or ES.

## Contribute

There are several ways to contribute to the Social Income UI project.
See the [`CONTRIBUTION.md`](/CONTRIBUTION.md) file.
