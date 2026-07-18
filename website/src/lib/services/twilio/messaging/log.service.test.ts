import { MessagingLogService } from './log.service';

type StoredJob = {
	id: string;
	templateFriendlyName: string;
	channelRequested: 'sms' | 'whatsapp';
	sentCount: number;
	totalSelected: number;
	status: 'running' | 'completed' | 'interrupted' | 'failed';
	startedAt: Date;
	createdBy: { contact: { firstName: string; lastName: string } | null } | null;
};

function makeService(opts: { jobs: StoredJob[]; isAdmin?: boolean }) {
	const findManyCalls: Record<string, unknown>[] = [];
	const db = {
		messagingJob: {
			findMany: async (args: Record<string, unknown>) => {
				findManyCalls.push(args);
				const skip = (args.skip as number) ?? 0;
				const take = (args.take as number) ?? opts.jobs.length;

				return opts.jobs.slice(skip, skip + take);
			},
			count: async () => opts.jobs.length,
		},
	};
	const userService = {
		isAdmin: jest.fn(async () =>
			opts.isAdmin === false
				? { success: false as const, error: 'Permission denied' }
				: { success: true as const, data: true as const },
		),
	};

	return { service: new MessagingLogService(db as never, userService as never), findManyCalls };
}

const job = (overrides: Partial<StoredJob> & { id: string }): StoredJob => ({
	templateFriendlyName: 'Tpl',
	channelRequested: 'sms',
	sentCount: 0,
	totalSelected: 0,
	status: 'completed',
	startedAt: new Date('2026-06-23T12:00:00Z'),
	createdBy: { contact: { firstName: 'Ada', lastName: 'Lovelace' } },
	...overrides,
});

describe('MessagingLogService.listJobs', () => {
	test('returns paginated rows with flattened createdByName', async () => {
		const { service, findManyCalls } = makeService({
			jobs: [job({ id: 'j1' }), job({ id: 'j2' }), job({ id: 'j3' })],
		});

		const result = await service.listJobs({ page: 1, pageSize: 2 }, 'user1');
		expect(result.success).toBe(true);
		if (!result.success) {
			throw new Error('expected success');
		}

		expect(result.data.totalCount).toBe(3);
		expect(result.data.rows).toHaveLength(2);
		expect(result.data.rows[0].id).toBe('j1');
		expect(result.data.rows[0].createdByName).toBe('Ada Lovelace');
		expect(findManyCalls[0].skip).toBe(0);
		expect(findManyCalls[0].take).toBe(2);
		expect(findManyCalls[0].orderBy).toEqual({ startedAt: 'desc' });
	});

	test('respects page offset', async () => {
		const { service, findManyCalls } = makeService({
			jobs: [job({ id: 'j1' }), job({ id: 'j2' }), job({ id: 'j3' }), job({ id: 'j4' })],
		});

		const result = await service.listJobs({ page: 2, pageSize: 2 }, 'user1');
		expect(result.success).toBe(true);
		if (!result.success) {
			throw new Error('expected success');
		}
		expect(result.data.rows.map((r) => r.id)).toEqual(['j3', 'j4']);
		expect(findManyCalls[0].skip).toBe(2);
	});

	test('non-admin caller is rejected', async () => {
		const { service } = makeService({ jobs: [], isAdmin: false });
		const result = await service.listJobs({ page: 1, pageSize: 10 }, 'user1');
		expect(result.success).toBe(false);
	});

	test('createdByName falls back when contact is null', async () => {
		const { service } = makeService({
			jobs: [job({ id: 'j1', createdBy: { contact: null } })],
		});
		const result = await service.listJobs({ page: 1, pageSize: 10 }, 'user1');
		expect(result.success).toBe(true);
		if (!result.success) {
			throw new Error('expected success');
		}
		expect(result.data.rows[0].createdByName).toBe('Unknown');
	});

	test('createdByName falls back when createdBy itself is null', async () => {
		const { service } = makeService({
			jobs: [job({ id: 'j1', createdBy: null })],
		});
		const result = await service.listJobs({ page: 1, pageSize: 10 }, 'user1');
		expect(result.success).toBe(true);
		if (!result.success) {
			throw new Error('expected success');
		}
		expect(result.data.rows[0].createdByName).toBe('Unknown');
	});
});

describe('MessagingLogService.getJobWithMessages', () => {
	type StoredMessage = {
		id: string;
		contact: { firstName: string; lastName: string };
		phoneNumber: string | null;
		channelUsed: 'sms' | 'whatsapp' | null;
		fellBack: boolean;
		twilioStatus: string | null;
		twilioErrorCode: string | null;
		twilioErrorMessage: string | null;
		skippedReason: string | null;
		createdAt: Date;
	};

	function makeService(opts: {
		job:
			| (StoredJob & {
					templateSid: string;
					recipientType: string;
					failedCount: number;
					skippedCount: number;
					fallbackCount: number;
					deliveredCount: number;
					finishedAt: Date | null;
			  })
			| null;
		messages?: StoredMessage[];
		isAdmin?: boolean;
	}) {
		const db = {
			messagingJob: {
				findUnique: async () => opts.job,
			},
			messageLog: {
				findMany: async (args: Record<string, unknown>) => {
					const skip = (args.skip as number) ?? 0;
					const take = (args.take as number) ?? opts.messages?.length ?? 0;

					return (opts.messages ?? []).slice(skip, skip + take);
				},
				count: async () => opts.messages?.length ?? 0,
			},
		};
		const userService = {
			isAdmin: jest.fn(async () =>
				opts.isAdmin === false
					? { success: false as const, error: 'Permission denied' }
					: { success: true as const, data: true as const },
			),
		};

		return new MessagingLogService(db as never, userService as never);
	}

	const baseJob = {
		id: 'j1',
		templateSid: 'HX1',
		templateFriendlyName: 'Welcome',
		channelRequested: 'sms' as const,
		recipientType: 'contributor',
		sentCount: 2,
		failedCount: 1,
		skippedCount: 0,
		fallbackCount: 0,
		deliveredCount: 1,
		totalSelected: 3,
		status: 'completed' as const,
		startedAt: new Date('2026-06-23T12:00:00Z'),
		finishedAt: new Date('2026-06-23T12:01:00Z'),
		createdBy: { contact: { firstName: 'Ada', lastName: 'Lovelace' } },
	};

	test('returns flattened job view and paginated messages', async () => {
		const service = makeService({
			job: baseJob,
			messages: [
				{
					id: 'm1',
					contact: { firstName: 'Grace', lastName: 'Hopper' },
					phoneNumber: '+11',
					channelUsed: 'sms',
					fellBack: false,
					twilioStatus: 'delivered',
					twilioErrorCode: null,
					twilioErrorMessage: null,
					skippedReason: null,
					createdAt: new Date('2026-06-23T12:00:01Z'),
				},
				{
					id: 'm2',
					contact: { firstName: 'Joan', lastName: 'Clarke' },
					phoneNumber: '+12',
					channelUsed: 'sms',
					fellBack: false,
					twilioStatus: 'failed',
					twilioErrorCode: '30003',
					twilioErrorMessage: 'Unreachable',
					skippedReason: null,
					createdAt: new Date('2026-06-23T12:00:02Z'),
				},
			],
		});

		const result = await service.getJobWithMessages('j1', { page: 1, pageSize: 25 }, 'user1');
		expect(result.success).toBe(true);
		if (!result.success) {
			throw new Error('expected success');
		}

		expect(result.data.job).toMatchObject({
			id: 'j1',
			templateSid: 'HX1',
			recipientType: 'contributor',
			deliveredCount: 1,
			finishedAt: new Date('2026-06-23T12:01:00Z'),
			createdByName: 'Ada Lovelace',
		});
		expect(result.data.messages.totalCount).toBe(2);
		expect(result.data.messages.rows[0]).toMatchObject({
			id: 'm1',
			contactName: 'Grace Hopper',
			twilioStatus: 'delivered',
		});
		expect(result.data.messages.rows[1]).toMatchObject({
			id: 'm2',
			twilioErrorCode: '30003',
			twilioErrorMessage: 'Unreachable',
		});
	});

	test('returns failure when job not found', async () => {
		const service = makeService({ job: null });
		const result = await service.getJobWithMessages('missing', { page: 1, pageSize: 25 }, 'user1');
		expect(result.success).toBe(false);
		if (result.success) {
			throw new Error('expected failure');
		}
		expect(result.error).toMatch(/not found/i);
	});

	test('non-admin caller is rejected', async () => {
		const service = makeService({ job: baseJob, isAdmin: false });
		const result = await service.getJobWithMessages('j1', { page: 1, pageSize: 25 }, 'user1');
		expect(result.success).toBe(false);
	});
});
