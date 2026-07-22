import type {
	ParsedVariable,
	VariableAssignments,
} from '@/lib/services/twilio/messaging/twilio-templates/twilio-template.types';

const VARIABLE_REGEX = /\{\{\s*([^}\s]+)\s*\}\}/g;

export function renderTemplatePreview(body: string, variables: ParsedVariable[], assignments: VariableAssignments): string {
	void variables;

	return body.replace(VARIABLE_REGEX, (match, key: string) => {
		const a = assignments[key];
		if (a?.source === 'constant') {
			return a.value;
		}
		if (a?.source === 'field') {
			return `[${a.path}]`;
		}

		return match;
	});
}
