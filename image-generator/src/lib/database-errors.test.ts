import { DatabaseError } from 'pg';
import { isConfirmedWriteFailure } from './database-errors';

jest.mock('server-only', () => ({}));

test.each(['22001', '23502', '23505', '42P01', '42501'])('recognizes SQLSTATE %s as a rejected statement', (code) => {
	expect(isConfirmedWriteFailure(Object.assign(new DatabaseError('Rejected', 0, 'error'), { code }))).toBe(true);
});

test.each([new Error('Connection lost'), { code: '23505' }, null, undefined])(
	'retains blobs for unrecognized errors: %s',
	(error) => {
		expect(isConfirmedWriteFailure(error)).toBe(false);
	},
);
