export type FieldEntry = { path: string; label: string };

export type FieldCatalogLabels = {
	firstName: string;
	lastName: string;
	callingName: string;
	email: string;
	gender: string;
	language: string;
	dateOfBirth: string;
	profession: string;
};

export const getFieldCatalog = (labels: FieldCatalogLabels): readonly FieldEntry[] => [
	{ path: 'contact.firstName', label: labels.firstName },
	{ path: 'contact.lastName', label: labels.lastName },
	{ path: 'contact.callingName', label: labels.callingName },
	{ path: 'contact.email', label: labels.email },
	{ path: 'contact.gender', label: labels.gender },
	{ path: 'contact.language', label: labels.language },
	{ path: 'contact.dateOfBirth', label: labels.dateOfBirth },
	{ path: 'contact.profession', label: labels.profession },
];
