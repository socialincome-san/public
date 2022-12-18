# Admin Tool

<img width="1377" alt="Screenshot 2022-12-19 at 00 26 28" src="https://user-images.githubusercontent.com/6095849/208325012-9588fc20-7243-4fb9-9c77-111dd17e2739.png">

The Admin Tool is a react frontend app. We are using
[Firestore](https://firebase.google.com/docs/firestore) as database and
[FireCMS](https://firecms.co/) as UI tool. All the access patterns for
the firestore collections are configured through the firestore security
rules.

## Basic Setup

For the basic setup, please refer to the main [readme](../README.md).
The [Makefile](Makefile) gives you a good overview of the available
commands.

## Getting Started

Execute

```
make admin-serve
```

which launches the Admin Tool on [localhost:3000](localhost:3000) and
the required dependencies (firestore, functions).

⚠️ The first time this takes a while since the packages might need to be
installed the typescript code needs to be compiled.

## Data Seed

How you can change, add and export data from the local data set, see the
specific [Readme](seed/README.md) in _seed_ subfolder.

## Call Functions from Admin

One can call backend functions directly from the admin. For example to
send an email.
[This dummy admin button](https://github.com/socialincome-san/public/blob/5eee5a7610e3402f47f6ff94bd810ee5713eb078/admin/src/CallDummyFunctionButton.tsx)
for example calls
[this](https://github.com/socialincome-san/public/blob/5eee5a7610e3402f47f6ff94bd810ee5713eb078/functions/src/dummy/dummyFunction.ts#L4)
function.

## Testing

Run `make admin-test` to run the tests locally.

## Deployment

Deployment is handled automatically through the
[Admin Github Worklow](../.github/workflows/admin.yml).

The production Firebase keys are ingested through
[GitHub secrets](<[url](https://docs.github.com/en/actions/security-guides/encrypted-secrets)>).

When creating a PR, the action tests the code and deploys it with the
production credentials to a preview hosting. There, one can see the
proposed change with the production Firestore database as backend.

After merging the PR into main, the action automatically deploys the
code to [admin.socialincome.org](https://admin.socialincome.org).
