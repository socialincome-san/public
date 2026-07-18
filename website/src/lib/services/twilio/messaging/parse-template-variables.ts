import type { ParsedVariable } from './twilio-messaging.types';

const VARIABLE_REGEX = /\{\{\s*([^}\s]+)\s*\}\}/g;

export function parseTemplateVariables(body: string | null, examples: Record<string, unknown>): ParsedVariable[] {
	if (!body) {
		return [];
	}

	const seen = new Set<string>();
	const variables: ParsedVariable[] = [];

	for (const match of body.matchAll(VARIABLE_REGEX)) {
		const key = match[1];
		if (seen.has(key)) {
			continue;
		}
		seen.add(key);
		const example = examples[key];
		variables.push({
			key,
			exampleValue: typeof example === 'string' ? example : null,
		});
	}

	return variables;
}
