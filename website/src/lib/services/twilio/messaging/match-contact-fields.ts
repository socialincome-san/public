export const MESSAGING_CONTACT_FIELD_KEYS = [
	'firstName',
	'lastName',
	'callingName',
	'email',
	'gender',
	'language',
	'dateOfBirth',
	'profession',
] as const;

export type MessagingContactFieldKey = (typeof MESSAGING_CONTACT_FIELD_KEYS)[number];
