import { types } from 'node:util';
import type { AuditAction, AuditChange, AuditFieldClassification, AuditScalar, AuditValue } from './audit-types';

// The snapshot type is checked against the policy in AuditedEntity, so the
// diff itself reads snapshots structurally.
export const computeAuditChanges = (
	action: AuditAction,
	fields: Record<string, AuditFieldClassification>,
	before: unknown,
	after: unknown,
): AuditChange[] =>
	Object.entries<AuditFieldClassification>(fields).flatMap(([path, classification]): AuditChange[] => {
		const previous = toAuditValue(readPath(before, path), path);
		const next = toAuditValue(readPath(after, path), path);
		if (JSON.stringify(previous) === JSON.stringify(next)) {
			return [];
		}

		return [
			classification === 'plain' || action === 'update' ? { path, old: previous, new: next } : { path, redacted: true },
		];
	});

// A missing relation reads as null for all its fields, so connecting or
// disconnecting a relation shows up as changes of its leaves.
const readPath = (snapshot: unknown, path: string): unknown =>
	path.split('.').reduce<unknown>((value, segment) => (isRecord(value) ? value[segment] : undefined), snapshot);

const toAuditValue = (value: unknown, path: string): AuditValue => {
	if (Array.isArray(value)) {
		return value.map((item) => toAuditScalar(item, path));
	}

	return toAuditScalar(value, path);
};

const toAuditScalar = (value: unknown, path: string): AuditScalar => {
	if (value === null || value === undefined) {
		return null;
	}
	if (types.isDate(value)) {
		return value.toISOString();
	}
	if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
		return value;
	}
	if (typeof value === 'bigint') {
		return value.toString();
	}

	throw new Error(`Audit field "${path}" is not a leaf value. Classify its leaves instead.`);
};

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null;
