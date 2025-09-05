# TODO

## Fields missing or unclear how to get them

- recipient.successor -> ? -> field doesnt exist anymore
- recipient.mobileMoneyPhone -> ? -> how can I get the mobileMoneyPhone?
- recipient.communicationMobilePhone -> ? -> how can I get the
  communicationMobilePhone?
- recipient.termsAccepted -> ? -> field doesnt exist anymore
- recipient.paymentProvider -> ? -> field doesnt exist anymore, do we
  still need it?
- organization -> localPartner?
- organization.contactNumber -> ? -> localPartner.user.phoneNumber[0] ?

# General questions

- if I want to change firstName, lastName, ... which was currently part
  of the recipient, I'm calling PATCH /recipients/me instead of PATCH
  /users/me? Is this correct?
- why does the PhoneNumber contain the User object?
- why does the LocalPartner contain a List<Recipient>?
- recipient.omUid -> whats that?
- user.address -> since this is a list, shouldnt it be user.addresses?
- user.phoneNumber -> since this is a list, shouldnt it be
  user.phoneNumbers?
- recipient.selectedLanguage -> ? -> field doesnt exist anymore
- user.languageCode -> this can be de, en, it, fr, kri -
  survey.recipientMainLanguage can be en, kri -> does it make sense to
  use the same enum or should we add the recipientMainLanguage also to
  recipient? so recipient.selectedLanguage as it was before the update?
