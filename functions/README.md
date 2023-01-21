# Functions

The backend of Social Income which takes care of the data management. It
consists of scheduled jos, firestore triggers and webhooks deployed to
firebase functions.

## Basic Setup

For the basic setup, please refer to the main [README](../README.md)

## Run Tests

Run the following command to start the emulators and run the unit tests

```
make functions-test
```

### End-to-End Tests

We use playwright to test against unwanted regressions on several
browsers. The playwright tests are located in `tests/playwright`.

The test is executed as part of `functions` GitHub Action when creating
a PR. A link to the hosted report is automatically posted in a comment.

To update the baseline snapshots post a comment with
`/update-functions-snapshots` to the PR. This will trigger the
`functions-update-snapshots` action which will commit the new pngs.

## Start Functions Locally

To serve https endpoints (e.g. webhooks) locally run

```shell
make functions-serve
```

## Deployment

Deployment is handled automatically through the
[Functions Github Worklow](../.github/workflows/functions.yml).

It takes care to test the PRs and deploy to production after them
merging into main.
