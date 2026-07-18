import { MessagingWebhookService } from './webhook.service';

function makeService(opts: { existingLog?: { id: string; jobId: string; twilioStatus: string | null } }) {
	const updates: { table: string; data: Record<string, unknown> }[] = [];
	const db = {
		messageLog: {
			findUnique: async () => (opts.existingLog ? { ...opts.existingLog } : null),
			update: async ({ data }: { data: Record<string, unknown> }) => {
				updates.push({ table: 'messageLog', data });

				return { id: opts.existingLog!.id };
			},
		},
		messagingJob: {
			update: async ({ data }: { data: Record<string, unknown> }) => {
				updates.push({ table: 'messagingJob', data });

				return { id: opts.existingLog!.jobId };
			},
		},
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
