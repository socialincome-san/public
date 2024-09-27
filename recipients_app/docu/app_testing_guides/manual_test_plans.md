# Manual test plans

Usually these tests are done on the environment STAGING with the
corresponding
[test accounts](https://docs.google.com/document/d/1-y__kbnLX3KCHp2pdXhzq58rbMmnXwUI-Cirihy224o/edit?pli=1#heading=h.4a9qjbxltxku).

## Registration

- On the Account creation page, by clicking the text link “Privacy
  Policy” a webview with the privacy policy is opened.
- TODO: Click on the button “Create Account” then …

## Login

- Switch off the internet and try to login. => An error message occurs
- Can I login with a valid account? => Enter registered phone number,
  enter verification code, You are logged in.

## Logout

- Logout of the app: Go to “Edit”, scroll down and “Sign Out” => The
  user is signed out and back on the Login page. This also works if
  there is no internet.

## Profile

- Tap on “Edit” and change personal data. => There should be a message
  “Profile updated successfully” after the change
- Switch off the internet and tap on “Edit” and change personal data. =>
  There is no message. Data is saved locally and will be synced once the
  internet is back again. This is also the case if you leave the Profile
  page.

## Payments

- Can you pull to refresh to see a newly added payment in the Admin
  Staging Tool
- Can you confirm if a payment has been made and if the change has been
  stored in Firebase?
  - Offline feature: Additionally, if you confirm while in flight mode
    and then reconnect to the internet, is it also stored in Firebase?
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

# Video manuals for Admin Staging Tool

#### How do you add a new payment in the Admin Staging Tool?

→
[Add payment.mov](https://drive.google.com/file/d/1I6PFLXp3BpN1v3X1mPL4wofL5SEG2rTy/view?usp=drive_link)

#### How do you change a survey status in the Admin Staging Tool?

→
[Change survey status.mov](https://drive.google.com/file/d/1I3SELIPc0ReLpIGc_Q0lY291GWUjFrgU/view?usp=sharing)

# Things to know about the app or Sierra Leone

- The leone is the currency of Sierra Leone. It is subdivided into 100
  cents. As of 1 July 2022, the ISO 4217 code is SLE due to a
  redenomination of the old leone (SLL) at a rate of SLL 1000 to SLE 1.
