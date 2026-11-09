import 'server-only';

import { DatabaseError } from 'pg';

// Connection errors and timeouts can arrive after commit; only known statement rejections allow cleanup.
export const isConfirmedWriteFailure = (error: unknown) =>
	error instanceof DatabaseError && /^(22|23|42)/.test(error.code ?? '');
