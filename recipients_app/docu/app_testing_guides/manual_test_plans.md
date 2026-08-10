# Manual test plans

Usually these tests are done on the environment STAGING. Testaccounts
can be created in the Admin Staging Tool
https://staging.socialincome.org/en/int/login.

## Phone verification and Login, Logout

- Login via phone number (Success case)
- Login via phone number (Error cases)
  - Enter wrong OTP
  - Test Resending of OTP code
  - Test OTP Code expired (Expired after 10 Minutes) => Shows user
    friendly error message
- Login via phone number and Terms accepted == false
- Login with phone number but no recipient account exists

- On the Account creation page, by clicking the text link “Privacy
  Policy” a webview with the privacy policy is opened.

- User stays logged in after app restart
- Switch off the internet and try to login. => An error message occurs
- Logout of the app: Go to “Edit”, scroll down and “Sign Out” => The
  user is signed out and back on the Login page. This also works if
  there is no internet.

## Demo mode

- Switch between normal mode and demo mode

## Profile/Account

- Tap on “Edit” and change personal data. => There should be a message
  “Profile updated successfully” after the change
- Switch off the internet and tap on “Edit” and change personal data. =>
  There is a message which tells you that you are offline and you can
  not do this change at the moment.
- Payment phone number and mobile money provider can not be changed in
  the mobile app. Fields are read-only.
- Test contact phone: Contact number can be empty or another phone number than the payment number. If you try to set the payment number as contact number, the value will not be saved.
- Test language settings

## Payments

- Can you pull to refresh to see a newly added payment in the Admin
  Staging Tool
- Can you confirm if a payment has been made and if the change has been
  stored into the Backend?
  - Offline feature: Additionally, if you confirm while in flight mode
    you get a message which tells you that you are offline and you can
    not do this change at the moment.
- Can you deny a payment?
- Can you resolve the issue from the mobile phone?

## Surveys

- Do you see the card “My surveys”
- If you tap the button “Overview”, then a new page with a list of all
  surveys is shown.
- If there is a due survey, then the list entry of this survey has a
  “Start Survey” button
- Can you pull to refresh to see a changed survey status in the Admin
  Staging Tool
- Is a survey that is due shown as a separate card on the main screen?
  - A card for a survey should show if
    - Survey’s due date is in 10 days or less
    - Survey’s due date was less than 20 days ago
  - The card says “Missed Survey” if
    - Survey’s due date was less than 15 days ago
- If two surveys are due, then two cards are shown
- Does the survey open on a new page when you tap “Start Survey”?
- Can you fill out the survey?
- If you filled out a survey, then the survey is shown as “Completed”.

## Test offline case

- Offline banner should be shown if no internet connection
- Offline on first launch of the app
- Offline on non first app launch
- Offline and want to change data
  - Give payment feedback
  - Do recipient changes
  - Accept Terms

## OS Permission stuff

### Android 13 and higher

On first startup the app asks for permission to send notifications. This
happens when the login page is shown.

### Android 12 and lower

There is no permission dialog on app start up. Permissions for
notifications are set automatically to “allowed”. You can check this in
the app info for the app in the Android settings app:
Settings->Apps->Social Income-> Notifications are allowed.

## Account deletion

Not yet added as feature

# Admin Staging Tool

## How do you add a new recipient in the Admin Staging Tool?

TODO

## How do you add a new payment in the Admin Staging Tool?

TODO

## How do you change a survey status in the Admin Staging Tool?

TODO
