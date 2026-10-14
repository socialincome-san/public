export type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue | undefined };

/** Who made a write, from where, and optional context such as a CSV import id. */
export type AuditContext = {
	actor: {
		type: 'user' | 'local-partner' | 'contributor' | 'recipient' | 'system';
		id: string;
		/** Display name at the time of the write. */
		name?: string | null;
	};
	source: 'portal' | 'partner-space' | 'mobile-app' | 'website' | 'system';
	metadata?: Record<string, string | number | boolean | null>;
};

export type AuditChange = {
	path: string;
	old: JsonValue;
	new: JsonValue;
};
