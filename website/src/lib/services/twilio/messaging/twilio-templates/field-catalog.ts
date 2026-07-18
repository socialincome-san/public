import type { MessagingRecipientType } from '../recipients/recipients.types';

const MESSAGING_CONTACT_FIELD_KEYS = [
	'firstName',
	'lastName',
	'callingName',
	'email',
	'gender',
	'language',
	'dateOfBirth',
	'profession',
] as const;

type MessagingContactFieldKey = (typeof MESSAGING_CONTACT_FIELD_KEYS)[number];

export type FieldEntry = { path: string; label: string };

const FIELD_LABELS: Record<MessagingContactFieldKey, string> = {
	firstName: 'First name',
	lastName: 'Last name',
	callingName: 'Calling name',
	email: 'Email',
	gender: 'Gender',
	language: 'Language',
	dateOfBirth: 'Date of birth',
	profession: 'Profession',
};

const CONTACT_FIELDS: readonly FieldEntry[] = MESSAGING_CONTACT_FIELD_KEYS.map((key) => ({
	path: `contact.${key}`,
	label: FIELD_LABELS[key],
}));

export function getFieldCatalog(type: MessagingRecipientType): readonly FieldEntry[] {
	// Field catalog is currently identical across recipient types, but the parameter
	// is retained so future recipient types can return type-specific entries.
	void type;

	return CONTACT_FIELDS;
}
