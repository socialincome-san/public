import type {
	Assignment,
	VariableAssignments,
} from '@/lib/services/twilio/messaging/twilio-templates/twilio-template.types';

export const emptyAssignments = (): VariableAssignments => ({});

export const setFieldSource = (state: VariableAssignments, key: string, path: string): VariableAssignments => ({
	...state,
	[key]: { source: 'field', path },
});

export const setConstantSource = (state: VariableAssignments, key: string, value: string): VariableAssignments => ({
	...state,
	[key]: { source: 'constant', value },
});

export const clearAssignment = (state: VariableAssignments, key: string): VariableAssignments => {
	if (!(key in state)) {
		return state;
	}
	const next = { ...state };
	delete next[key];

	return next;
};

export const getAssignment = (state: VariableAssignments, key: string): Assignment | null => state[key] ?? null;
