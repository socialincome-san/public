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
	const updateManyCalls: Record<string, unknown>[] = [];
	const db = {
		messagingJob: {
			findMany: (args: Record<string, unknown>) => {
				findManyCalls.push(args);
				const skip = (args.skip as number) ?? 0;
				const take = (args.take as number) ?? opts.jobs.length;

				return Promise.resolve(opts.jobs.slice(skip, skip + take));
			},
			count: () => Promise.resolve(opts.jobs.length),
			updateMany: (args: Record<string, unknown>) => {
				updateManyCalls.push(args);

				return Promise.resolve({ count: 0 });
			},
		},
	};
	const userService = {
		isAdmin: jest.fn(() =>
			Promise.resolve(
				opts.isAdmin === false
					? { success: false as const, error: 'Permission denied' }
					: { success: true as const, data: true as const },
			),
		),
	};

	return {
		service: new MessagingLogService(db as never, userService as never, { handleStatusCallback: jest.fn() } as never),
		findManyCalls,
		updateManyCalls,
	};
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

	test('sweeps stale running jobs to interrupted before listing', async () => {
		const { service, updateManyCalls } = makeService({ jobs: [job({ id: 'j1' })] });

		await service.listJobs({ page: 1, pageSize: 10 }, 'user1');

		expect(updateManyCalls).toHaveLength(1);
		const call = updateManyCalls[0] as { where: { status: string; updatedAt: { lt: Date } }; data: { status: string } };
		expect(call.where.status).toBe('running');
		expect(call.where.updatedAt.lt).toBeInstanceOf(Date);
		expect(call.data.status).toBe('interrupted');
	});

	test('does not sweep for a non-admin caller', async () => {
		const { service, updateManyCalls } = makeService({ jobs: [], isAdmin: false });

		await service.listJobs({ page: 1, pageSize: 10 }, 'user1');

		expect(updateManyCalls).toHaveLength(0);
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
				findUnique: () => Promise.resolve(opts.job),
			},
			messageLog: {
				findMany: (args: Record<string, unknown>) => {
					const skip = (args.skip as number) ?? 0;
					const take = (args.take as number) ?? opts.messages?.length ?? 0;

					return Promise.resolve((opts.messages ?? []).slice(skip, skip + take));
				},
				count: () => Promise.resolve(opts.messages?.length ?? 0),
			},
		};
		const userService = {
			isAdmin: jest.fn(() =>
				Promise.resolve(
					opts.isAdmin === false
						? { success: false as const, error: 'Permission denied' }
						: { success: true as const, data: true as const },
				),
			),
		};

		return new MessagingLogService(db as never, userService as never, { handleStatusCallback: jest.fn() } as never);
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

describe('MessagingLogService.syncJobStatuses', () => {
	type TwilioMessage = { status: string; errorCode?: number | null; errorMessage?: string | null };

	function makeService(opts: {
		logs: { twilioMessageSid: string | null }[];
		twilioMessages?: Record<string, TwilioMessage | (() => never)>;
		updatedForStatus?: (status: string) => boolean;
		twilioClientFails?: boolean;
		isAdmin?: boolean;
	}) {
		const findManyCalls: Record<string, unknown>[] = [];
		const db = {
			messageLog: {
				findMany: (args: Record<string, unknown>) => {
					findManyCalls.push(args);

					return Promise.resolve(opts.logs);
				},
			},
		};
		const userService = {
			isAdmin: jest.fn(() =>
				Promise.resolve(
					opts.isAdmin === false
						? { success: false as const, error: 'Permission denied' }
						: { success: true as const, data: true as const },
				),
			),
		};
		const handleStatusCallback = jest.fn((input: { status: string }) =>
			Promise.resolve({
				success: true as const,
				data: { updated: opts.updatedForStatus ? opts.updatedForStatus(input.status) : true },
			}),
		);
		const webhookService = { handleStatusCallback };

		const service = new MessagingLogService(db as never, userService as never, webhookService as never);

		// getTwilioClient is protected and would otherwise construct a real client from env vars.
		const twilioClient = {
			messages: (sid: string) => ({
				fetch: () => {
					const entry = opts.twilioMessages?.[sid];
					if (typeof entry === 'function') {
						return Promise.reject(new Error(`fetch failed for ${sid}`));
					}

					return Promise.resolve(entry);
				},
			}),
		};
		(service as unknown as { getTwilioClient: () => unknown }).getTwilioClient = () =>
			opts.twilioClientFails
				? { success: false, error: 'Missing Twilio environment variables' }
				: { success: true, data: twilioClient };

		return { service, findManyCalls, handleStatusCallback };
	}

	test('only queries non-terminal rows with a Twilio SID', async () => {
		const { service, findManyCalls } = makeService({ logs: [] });

		await service.syncJobStatuses('j1', 'user1');

		expect(findManyCalls[0].where).toEqual({
			jobId: 'j1',
			twilioMessageSid: { not: null },
			twilioStatus: { notIn: ['delivered', 'read', 'failed', 'undelivered'] },
		});
	});

	test('fetches each SID and applies status through handleStatusCallback', async () => {
		const { service, handleStatusCallback } = makeService({
			logs: [{ twilioMessageSid: 'SM1' }, { twilioMessageSid: 'SM2' }],
			twilioMessages: {
				SM1: { status: 'delivered' },
				SM2: { status: 'failed', errorCode: 30003, errorMessage: 'Unreachable' },
			},
		});

		const result = await service.syncJobStatuses('j1', 'user1');

		expect(result.success).toBe(true);
		if (!result.success) {
			throw new Error('expected success');
		}
		expect(result.data).toEqual({ checked: 2, updated: 2 });
		expect(handleStatusCallback).toHaveBeenCalledWith({
			messageSid: 'SM1',
			status: 'delivered',
			errorCode: null,
			errorMessage: null,
		});
		// Numeric Twilio error codes are stringified for the callback.
		expect(handleStatusCallback).toHaveBeenCalledWith({
			messageSid: 'SM2',
			status: 'failed',
			errorCode: '30003',
			errorMessage: 'Unreachable',
		});
	});

	test('counts only rows the callback reports as updated', async () => {
		const { service } = makeService({
			logs: [{ twilioMessageSid: 'SM1' }, { twilioMessageSid: 'SM2' }],
			twilioMessages: { SM1: { status: 'delivered' }, SM2: { status: 'queued' } },
			updatedForStatus: (status) => status === 'delivered',
		});

		const result = await service.syncJobStatuses('j1', 'user1');

		expect(result.success && result.data).toEqual({ checked: 2, updated: 1 });
	});

	test('a failing Twilio fetch does not abort the whole sync', async () => {
		const { service, handleStatusCallback } = makeService({
			logs: [{ twilioMessageSid: 'SM1' }, { twilioMessageSid: 'SM2' }],
			twilioMessages: { SM1: () => undefined as never, SM2: { status: 'delivered' } },
		});

		const result = await service.syncJobStatuses('j1', 'user1');

		expect(result.success && result.data).toEqual({ checked: 2, updated: 1 });
		expect(handleStatusCallback).toHaveBeenCalledTimes(1);
		expect(handleStatusCallback).toHaveBeenCalledWith(expect.objectContaining({ messageSid: 'SM2' }));
	});

	test('fails when the Twilio client is unavailable', async () => {
		const { service } = makeService({ logs: [{ twilioMessageSid: 'SM1' }], twilioClientFails: true });

		const result = await service.syncJobStatuses('j1', 'user1');

		expect(result.success).toBe(false);
	});

	test('non-admin caller is rejected', async () => {
		const { service, findManyCalls } = makeService({ logs: [{ twilioMessageSid: 'SM1' }], isAdmin: false });

		const result = await service.syncJobStatuses('j1', 'user1');

		expect(result.success).toBe(false);
		expect(findManyCalls).toHaveLength(0);
	});
});
