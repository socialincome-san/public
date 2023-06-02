# Website

Customer facing website of Social Income.

## Basic Setup

For the basic setup, please refer to the main [README](../README.md)

## Start Website Locally

To serve the development server locally, run the following commands as
separate processes:

```shell
npm run firebase:serve
npm run website:serve
```

Or if you directly want to run the firebase emulator and the website

```shell
npm run website:serve:emulator
```

The website will be accessible at http://localhost:3001

## Build Website Locally

To test the "production" bundling using the test data from the firebase
emulator, run:

```shell
npm run website:build:emulator
```

## Translations

We use [next-i18next](https://github.com/i18next/next-i18next) as
translation framework for nextjs. It builds up on
[i18next](https://www.i18next.com).

Please refer to
[this](https://www.i18next.com/translation-function/essentials) and the
following documentation sections to understand how the details of
interpolation, formatting and plurals work.

The translation files are located in `/shared/locales`. This allows us
to reuse generic translations (like for example country names) among
several services. Website specific files can be prefixed with
`website-`.

We integrated
[i18next-parser](https://github.com/i18next/i18next-parser) to
automatically sync the keys used in the code with the ones available in
the translations jsons.

For the website, we will split the translation files into namespaces
(e.g. one per page or component). This allows to avoid pushing unused
data to the client. The
[next-i18next Readme](https://github.com/i18next/next-i18next#3-project-setup)
explains all the details.

In a nutshell, adding translations to a page involves 3 steps:

- Add
  `...(await serverSideTranslations(locale, ['website-myNewPage'])),` to
  the `getStaticProps` of your page
- Add `const { t } = useTranslation('website-myNewPage');` in your
  component and use it in your code `<p>{t('description')}</p>`
- Run `npm run website:extract-translations` for npm to update the json
  files.

If you want to use multiple translation files (namespaces) in 1 page you
can do it like this:

- Add
  `...(await serverSideTranslations(locale, ['website-myNewPage', 'common'])),`
  to the `getStaticProps` of your page
- Add `const { t } = useTranslation('website-myNewPage');` By default we
  use the `website-myNewPage` file. E.g. `{t('yourKeyInmyNewPage')}`
- If you want to use a key from the common file you can write
  `{t('yourKeyInCommon', { ns: 'common' })}`.

Within the GitHub PR checks, we will run `check-translations` which
returns an error if the jsons files are not in sync with the code.

## Run Tests

### Unit Tests

To test individual components with jest. They are located in the `tests`
directory.

```shell
npm run website:test:emulator
```

### End-to-End Tests

We use playwright to test against unwanted regressions on several
browsers. The e2e tests are located in `tests-e2e`.

To add a visual snapshot regression test for a new page, create a new
spec ts file with the following content:

```
import { multiLanguageSnapshotTest } from './__utils__/snapshots';
multiLanguageSnapshotTest('/your-new-path');
```

The test is executed as part of `website` GitHub Action when creating a
PR. A link to the hosted report is automatically posted in a comment.

To update the baseline snapshots post a comment with
`/update-website-snapshots` to the PR. This will trigger the
`website-update-snapshots` action which will commit the new pngs.

## Deployment

The website is hosted on vercel.com. The deployment is done
automatically after merging a PR into the main branch. In the PRs, a
preview version is deployed.
