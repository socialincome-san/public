import { MessagingWebhookService } from './webhook.service';

function makeService(opts: { existingLog?: { id: string; jobId: string; twilioStatus: string | null } }) {
	const updates: { table: string; data: Record<string, unknown> }[] = [];

	const messageLog = {
		findUnique: () => Promise.resolve(opts.existingLog ? { ...opts.existingLog } : null),
		update: ({ data }: { data: Record<string, unknown> }) => {
			updates.push({ table: 'messageLog', data });

			return Promise.resolve({ id: opts.existingLog!.id });
		},
		updateMany: ({ where, data }: { where: { twilioStatus?: { notIn?: string[] } }; data: Record<string, unknown> }) => {
			// Model the atomic guard: the row matches only if its current status is not in the blocked set.
			const blocked = where.twilioStatus?.notIn ?? [];
			const matches = !blocked.includes(opts.existingLog!.twilioStatus as string);
			if (matches) {
				updates.push({ table: 'messageLog', data });
			}

			return Promise.resolve({ count: matches ? 1 : 0 });
		},
	};

	const messagingJob = {
		update: ({ data }: { data: Record<string, unknown> }) => {
			updates.push({ table: 'messagingJob', data });

			return Promise.resolve({ id: opts.existingLog!.jobId });
		},
	};

	const db = {
		messageLog,
		messagingJob,
		$transaction: (fn: (tx: { messageLog: typeof messageLog; messagingJob: typeof messagingJob }) => Promise<unknown>) =>
			fn({ messageLog, messagingJob }),
	};

	return { service: new MessagingWebhookService(db as never), updates };
}

describe('MessagingWebhookService.handleStatusCallback', () => {
	test('updates the log status and increments deliveredCount on first delivered', async () => {
		const { service, updates } = makeService({ existingLog: { id: 'l1', jobId: 'j1', twilioStatus: 'sent' } });
		const r = await service.handleStatusCallback({ messageSid: 'SM1', status: 'delivered' });
		expect(r.success && r.data.updated).toBe(true);
		expect(updates.some((u) => u.table === 'messageLog' && u.data.twilioStatus === 'delivered')).toBe(true);
		expect(
			updates.some((u) => u.table === 'messagingJob' && (u.data.deliveredCount as { increment: number }).increment === 1),
		).toBe(true);
	});

	test('does not double-increment when delivered transitions to delivered', async () => {
		const { service, updates } = makeService({ existingLog: { id: 'l1', jobId: 'j1', twilioStatus: 'delivered' } });
		await service.handleStatusCallback({ messageSid: 'SM1', status: 'delivered' });
		expect(updates.some((u) => u.table === 'messagingJob')).toBe(false);
	});

	test('does not let a late non-delivered callback regress a delivered row', async () => {
		const { service, updates } = makeService({ existingLog: { id: 'l1', jobId: 'j1', twilioStatus: 'delivered' } });
		const r = await service.handleStatusCallback({ messageSid: 'SM1', status: 'sent' });
		expect(r.success && r.data.updated).toBe(false);
		expect(updates).toHaveLength(0);
	});

	test('allows a delivered row to advance to read', async () => {
		const { service, updates } = makeService({ existingLog: { id: 'l1', jobId: 'j1', twilioStatus: 'delivered' } });
		const r = await service.handleStatusCallback({ messageSid: 'SM1', status: 'read' });
		expect(r.success && r.data.updated).toBe(true);
		expect(updates.some((u) => u.table === 'messageLog' && u.data.twilioStatus === 'read')).toBe(true);
	});

	test('does not regress a read row back to delivered or double-count', async () => {
		const { service, updates } = makeService({ existingLog: { id: 'l1', jobId: 'j1', twilioStatus: 'read' } });
		const r = await service.handleStatusCallback({ messageSid: 'SM1', status: 'delivered' });
		expect(r.success && r.data.updated).toBe(false);
		expect(updates.some((u) => u.table === 'messagingJob')).toBe(false);
	});

	test('unknown messageSid returns updated:false without throwing', async () => {
		const { service, updates } = makeService({});
		const r = await service.handleStatusCallback({ messageSid: 'SMx', status: 'delivered' });
		expect(r.success && r.data.updated).toBe(false);
		expect(updates).toHaveLength(0);
	});

	test('failed status records error code and message', async () => {
		const { service, updates } = makeService({ existingLog: { id: 'l1', jobId: 'j1', twilioStatus: 'sent' } });
		await service.handleStatusCallback({
			messageSid: 'SM1',
			status: 'failed',
			errorCode: '30003',
			errorMessage: 'Unreachable',
		});
		const logUpd = updates.find((u) => u.table === 'messageLog');
		expect(logUpd?.data).toMatchObject({
			twilioStatus: 'failed',
			twilioErrorCode: '30003',
			twilioErrorMessage: 'Unreachable',
		});
	});
});
