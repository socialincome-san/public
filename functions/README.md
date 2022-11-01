# Functions

The backend of Social Income which takes care of the data management. It
consists of scheduled jos, firestore triggers and webhooks deployed to
firebase functions.

## Basic Setup

For the basic setup, please refer to the main [README](../README.md)

## Run Tests

Run the following command to start the emulators and run the tests

```
make functions-test
```

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
