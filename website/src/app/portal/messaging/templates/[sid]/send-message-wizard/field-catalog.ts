export type FieldEntry = { path: string; label: string };

export const getFieldCatalog = (): readonly FieldEntry[] => [
	{ path: 'contact.firstName', label: 'First name' },
	{ path: 'contact.lastName', label: 'Last name' },
	{ path: 'contact.callingName', label: 'Calling name' },
	{ path: 'contact.email', label: 'Email' },
	{ path: 'contact.gender', label: 'Gender' },
	{ path: 'contact.language', label: 'Language' },
	{ path: 'contact.dateOfBirth', label: 'Date of birth' },
	{ path: 'contact.profession', label: 'Profession' },
];
