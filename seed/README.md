# Data Seed  

An initial set of data is imported into the Firebase emulators during
startup. You can add, delete or amend data directly in your local Admin Tool
([localhost:3000](http://localhost:3000)) or in your local Firestore Admin Interface
([localhost:4000](http://localhost:4000/firestore/data)). 

First start the Admin Tool with:

```
make admin-serve
```

For the basic setup, please refer to the main [Readme](../README.md). 

## Adding Data

To add new data to your local collection, you have two options: 

**1. Add it through the local Admin Tool via [localhost:3000](http://localhost:3000):**

<img width="1376" alt="Screenshot 2022-12-18 at 23 22 18" src="https://user-images.githubusercontent.com/6095849/208322659-cf0134e5-a979-492f-80bd-ba30eb527276.png">


**2. Add it on the Firebase Emulator via [localhost:4000](http://localhost:4000):**

<img width="1421" alt="Screenshot 2022-12-15 at 10 28 58" src="https://user-images.githubusercontent.com/6095849/207823490-0bb85239-b77e-4f65-868c-9931fe0f871c.png">

## Committing Data

If you want to commit (no sensitive data) or keep a local copy of your altered data set, you can execute in a second shell (while the command
above still is running) the command:

```
 make firebase-export
```

To commit the data, make a pull request with the complemented data set. 

## Communication Channels

1. GitHub for issue related discussion
2. Everything else on [Slack](https://social-income.slack.com/home)
