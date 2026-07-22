import { VARIABLE_REGEX } from './parse-template-variables';
import type { ParsedVariable, VariableAssignments } from './twilio-template.types';

export type RenderableContact = {
	firstName: string;
	lastName: string;
	callingName: string | null;
	email: string | null;
	gender: string | null;
	language: string | null;
	dateOfBirth: Date | null;
	profession: string | null;
};

function resolveFieldPath(path: string, contact: RenderableContact): string {
	const segments = path.split('.');
	if (segments[0] !== 'contact' || segments.length !== 2) {
		return '';
	}
	const key = segments[1] as keyof RenderableContact;
	const value = contact[key];
	if (value === null || value === undefined) {
		return '';
	}
	if (value instanceof Date) {
		return value.toISOString().slice(0, 10);
	}

	return String(value);
}

function resolveVariable(key: string, assignments: VariableAssignments, contact: RenderableContact): string {
	const assignment = assignments[key];
	if (!assignment) {
		return '';
	}
	if (assignment.source === 'constant') {
		return assignment.value;
	}

	return resolveFieldPath(assignment.path, contact);
}

export function renderTemplateBody(
	body: string,
	variables: ParsedVariable[],
	assignments: VariableAssignments,
	contact: RenderableContact,
): string {
	void variables;

	return body.replace(VARIABLE_REGEX, (_match, key: string) => resolveVariable(key, assignments, contact));
}

export function buildContentVariables(
	variables: ParsedVariable[],
	assignments: VariableAssignments,
	contact: RenderableContact,
): Record<string, string> {
	const out: Record<string, string> = {};
	for (const variable of variables) {
		out[variable.key] = resolveVariable(variable.key, assignments, contact);
	}

	return out;
}
