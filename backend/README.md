# Backend

The backend takes care of the data management. It consists of scheduled
functions, firestore triggers and webhooks deployed to firebase
functions.

## Basic Setup

We are using [Firestore](https://firebase.google.com/docs/firestore) as
database and
[Firebase Functions](https://firebase.google.com/docs/functions) as
serverless framework. For development we use
[Docker](https://www.docker.com) and rely on local emulators, which are
populated with dummy seed data. This makes sure that no one will require
production Firebase credentials to contribute.

## Run Tests

Run the following command to start the emulators and run the tests

```shell
make backend-test
```

## Start Functions Locally

To serve https endpoints (e.g. webhooks) locally run

```shell
make backend-serve
```

#### Deployment

Deployment is handled automatically through
[GitHub actions](https://github.com/socialincome-san/public/actions).

When creating a PR, an action runs the tests.

After merging the PR into main, a deployment action automatically
deploys the code to production.
