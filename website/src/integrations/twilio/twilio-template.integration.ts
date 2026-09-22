export type TwilioTemplateVariable = {
	key: string;
	exampleValue: string | null;
};

type TwilioTemplateAssignment = { source: 'field'; path: string } | { source: 'constant'; value: string };

export type TwilioTemplateAssignments = Record<string, TwilioTemplateAssignment>;

export type TwilioTemplateContact = {
	firstName: string;
	lastName: string;
	callingName: string | null;
	email: string | null;
	gender: string | null;
	language: string | null;
	dateOfBirth: Date | null;
	profession: string | null;
};

const VARIABLE_REGEX = /\{\{\s*([^}\s]+)\s*\}\}/g;

export const parseTwilioTemplateVariables = (
	body: string | null,
	examples: Record<string, unknown>,
): TwilioTemplateVariable[] => {
	if (!body) {
		return [];
	}
	const seen = new Set<string>();
	const variables: TwilioTemplateVariable[] = [];
	for (const match of body.matchAll(VARIABLE_REGEX)) {
		const key = match[1];
		if (!key || seen.has(key)) {
			continue;
		}
		seen.add(key);
		variables.push({ key, exampleValue: typeof examples[key] === 'string' ? examples[key] : null });
	}

	return variables;
};

export const renderTwilioTemplateBody = (
	body: string,
	assignments: TwilioTemplateAssignments,
	contact: TwilioTemplateContact,
): string => body.replace(VARIABLE_REGEX, (_match, key: string) => resolveTemplateVariable(key, assignments, contact));

export const buildTwilioContentVariables = (
	variables: TwilioTemplateVariable[],
	assignments: TwilioTemplateAssignments,
	contact: TwilioTemplateContact,
): Record<string, string> =>
	Object.fromEntries(variables.map(({ key }) => [key, resolveTemplateVariable(key, assignments, contact)]));

const resolveTemplateVariable = (
	key: string,
	assignments: TwilioTemplateAssignments,
	contact: TwilioTemplateContact,
): string => {
	const assignment = assignments[key];
	if (!assignment) {
		return '';
	}
	if (assignment.source === 'constant') {
		return assignment.value;
	}

	const segments = assignment.path.split('.');
	const contactKey = segments[1];
	if (segments[0] !== 'contact' || segments.length !== 2 || !isTwilioTemplateContactKey(contactKey)) {
		return '';
	}
	const value = contact[contactKey];
	if (value === null) {
		return '';
	}

	return value instanceof Date ? value.toISOString().slice(0, 10) : String(value);
};

const isTwilioTemplateContactKey = (key: string | undefined): key is keyof TwilioTemplateContact =>
	key === 'firstName' ||
	key === 'lastName' ||
	key === 'callingName' ||
	key === 'email' ||
	key === 'gender' ||
	key === 'language' ||
	key === 'dateOfBirth' ||
	key === 'profession';
