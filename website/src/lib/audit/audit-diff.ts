import type { AuditChange, JsonValue } from './audit-types';

/** Field changes between two audit snapshots, as dot paths such as `contact.phone.number`. */
export const diffSnapshots = (before: JsonValue, after: JsonValue): AuditChange[] => {
	const previous = flatten(before);
	const next = flatten(after);

	return [...new Set([...previous.keys(), ...next.keys()])].flatMap((path) => {
		const old = previous.get(path) ?? null;
		const value = next.get(path) ?? null;

		return JSON.stringify(old) === JSON.stringify(value) ? [] : [{ path, old, new: value }];
	});
};

const flatten = (value: JsonValue, path = '', leaves = new Map<string, JsonValue>()): Map<string, JsonValue> => {
	if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
		Object.entries(value).forEach(([key, child]) => flatten(child ?? null, path ? `${path}.${key}` : key, leaves));
	} else if (path) {
		leaves.set(path, value);
	}

	return leaves;
};
