# Readme for Social Income's User Interface (UI)

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

```shell
# Build the UI. For one time builds e.g. production builds.
ui:build

# Run the development server on http://localhost:6006. Use only this while developing for the UI.
ui:serve
```

## Contribute

There are several ways to contribute to the Social Income UI project.
See the [`CONTRIBUTING.md`](/CONTRIBUTING.md) file.

---

**For more information: [Main Readme](/README.md) /
[UI Contributing](/ui/README.md)**
