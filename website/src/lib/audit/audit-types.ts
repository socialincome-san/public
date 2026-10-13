export const AUDIT_ACTIONS = ['create', 'update', 'delete'] as const;

export type AuditAction = (typeof AUDIT_ACTIONS)[number];

export const AUDIT_ACTOR_TYPES = ['user', 'local-partner', 'contributor', 'recipient', 'system'] as const;

type AuditActor = {
	type: (typeof AUDIT_ACTOR_TYPES)[number];
	id: string;
};

export const AUDIT_SOURCES = ['portal', 'partner-space', 'mobile-app', 'website', 'system'] as const;

export type AuditSource = (typeof AUDIT_SOURCES)[number];

export type AuditScalar = string | number | boolean | null;

export type AuditValue = AuditScalar | AuditScalar[];

export type AuditChange = { path: string; old: AuditValue; new: AuditValue } | { path: string; redacted: true };

// Flat on purpose: metadata explains an operation (import id, reason) and
// must never carry personal data.
export type AuditMetadata = Record<string, AuditScalar>;

/**
 * - `plain`: old and new values are stored for every action.
 * - `personal`: values are stored for updates only. Create and delete record
 *   that the field was set, so the trail never holds a full copy of a person.
 */
export type AuditFieldClassification = 'plain' | 'personal';

type AuditLeaf = string | number | boolean | Date | null | undefined | readonly AuditScalar[];

/** Dot paths to every leaf of a snapshot, e.g. `contact.phone.number`. */
type AuditPath<T> = {
	[K in keyof T & string]: NonNullable<T[K]> extends AuditLeaf ? K : `${K}.${AuditPath<NonNullable<T[K]>>}`;
}[keyof T & string];

/** Every snapshot leaf must be classified, so a new field is never audited by accident. */
export type AuditFieldPolicy<TSnapshot> = Record<AuditPath<TSnapshot>, AuditFieldClassification>;

/** Who made a write, from where, and optional context such as a CSV import id. */
export type AuditContext = {
	actor: AuditActor;
	source: AuditSource;
	metadata?: AuditMetadata;
};
