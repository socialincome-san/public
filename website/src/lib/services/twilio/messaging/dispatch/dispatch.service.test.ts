import { MessagingDispatchService } from './dispatch.service';
import type { DispatchSendInput } from './dispatch.types';

type MockTwilioMessage = { sid: string };
type MockTwilioClient = {
	messages: { create: jest.Mock<Promise<MockTwilioMessage>, [unknown]> };
	content: { v1: { contents: jest.Mock<{ fetch: () => Promise<unknown> }> } };
};

function makeService(opts: {
	contacts: { id: string; firstName: string; phone: { number: string; hasWhatsApp: boolean } | null }[];
	isAdmin?: boolean;
}) {
	const twilioClient: MockTwilioClient = {
		messages: {
			create: jest.fn((payload: unknown): Promise<MockTwilioMessage> => {
				void payload;

				return Promise.resolve({ sid: `SM${Math.random().toString(36).slice(2, 10)}` });
			}),
		},
		content: {
			v1: {
				contents: jest.fn(() => ({
					fetch: () =>
						Promise.resolve({
							sid: 'HX1',
							friendlyName: 'test',
							language: 'en',
							types: { 'twilio/text': { body: 'Hi {{1}}' } },
							variables: {},
						}),
				})),
			},
		},
	};

	const created: { jobs: { id: string; data: Record<string, unknown> }[]; logs: Record<string, unknown>[] } = {
		jobs: [],
		logs: [],
	};
	const jobUpdates: { id: string; data: Record<string, unknown> }[] = [];
	const logUpdates: { id: string; data: Record<string, unknown> }[] = [];

	const db = {
		$transaction: (fn: (tx: unknown) => Promise<unknown>) =>
			fn({
				messagingJob: {
					create: ({ data }: { data: Record<string, unknown> }) => {
						const row = { id: `job_${created.jobs.length + 1}`, ...data };
						created.jobs.push({ id: row.id, data });

						return Promise.resolve(row);
					},
				},
				messageLog: {
					createMany: ({ data }: { data: Record<string, unknown>[] }) => {
						for (const d of data) {
							created.logs.push({ id: `log_${created.logs.length + 1}`, ...d });
						}

						return Promise.resolve({ count: data.length });
					},
					findMany: () => Promise.resolve(created.logs.map((d, i) => ({ id: `log_${i + 1}`, ...d }))),
				},
			}),
		messagingJob: {
			update: ({ where, data }: { where: { id: string }; data: Record<string, unknown> }) => {
				jobUpdates.push({ id: where.id, data });

				return Promise.resolve({ id: where.id });
			},
		},
		messageLog: {
			update: ({ where, data }: { where: { id: string }; data: Record<string, unknown> }) => {
				logUpdates.push({ id: where.id, data });

				return Promise.resolve({ id: where.id });
			},
			findMany: () => Promise.resolve(created.logs.map((d, i) => ({ id: `log_${i + 1}`, ...d }))),
		},
		contact: {
			findMany: () =>
				Promise.resolve(
					opts.contacts.map((c) => ({
						id: c.id,
						firstName: c.firstName,
						lastName: '',
						callingName: null,
						email: null,
						gender: null,
						language: null,
						dateOfBirth: null,
						profession: null,
						phone: c.phone,
					})),
				),
		},
	};

	const userService = {
		isAdmin: jest.fn(() =>
			Promise.resolve(
				opts.isAdmin === false ? { success: false, error: 'Permission denied' } : { success: true, data: true as const },
			),
		),
	};

	const twilioTemplateService = {
		getTwilioTemplate: jest.fn(() =>
			Promise.resolve({
				success: true as const,
				data: {
					sid: 'HX1',
					friendlyName: 'test',
					language: 'en',
					contentType: 'twilio/text',
					body: 'Hi {{1}}',
					variables: [{ key: '1', exampleValue: null }],
				},
			}),
		),
	};

	// recipientsService is unused because resolveContactIdsForType is overridden on the instance below.
	const service = new MessagingDispatchService(
		db as never,
		userService as never,
		twilioTemplateService as never,
		undefined as never,
	);
	// Override Twilio client + env requirement check.
	(service as unknown as { getTwilioClient: () => unknown }).getTwilioClient = () => ({ success: true, data: twilioClient });
	(service as unknown as { resolveContactIdsForType: (...args: unknown[]) => Promise<string[]> }).resolveContactIdsForType =
		() => Promise.resolve(opts.contacts.map((c) => c.id));

	process.env.TWILIO_MESSAGING_SERVICE_SID = 'MGtest';
	process.env.BASE_URL = 'https://test.example';

	return { service, twilioClient, created, jobUpdates, logUpdates };
}

describe('MessagingDispatchService.dispatchSend', () => {
	test('happy path: 3 contacts, 1 fallback, 1 skipped (no phone)', async () => {
		const { service, twilioClient, created, jobUpdates } = makeService({
			contacts: [
				{ id: 'c1', firstName: 'A', phone: { number: '+411', hasWhatsApp: true } },
				{ id: 'c2', firstName: 'B', phone: { number: '+412', hasWhatsApp: false } },
				{ id: 'c3', firstName: 'C', phone: null },
			],
		});

		const input: DispatchSendInput = {
			templateSid: 'HX1',
			channel: 'whatsapp',
			recipientType: 'contributor',
			selection: { mode: 'include', ids: new Set(['c1', 'c2', 'c3']) },
			assignments: { '1': { source: 'field', path: 'contact.firstName' } },
		};

		const result = await service.dispatchSend(input, 'user1');
		expect(result.success).toBe(true);

		expect(created.jobs).toHaveLength(1);
		expect(created.jobs[0].data).toMatchObject({
			templateSid: 'HX1',
			channelRequested: 'whatsapp',
			totalSelected: 3,
		});
		expect(created.logs).toHaveLength(3);
		// 2 Twilio API calls: c1 via whatsapp, c2 via sms (fallback). c3 skipped.
		expect(twilioClient.messages.create).toHaveBeenCalledTimes(2);

		const calls = twilioClient.messages.create.mock.calls.map((c) => c[0] as Record<string, unknown>);
		const whatsappCall = calls.find((c) => (c.to as string).startsWith('whatsapp:'));
		const smsCall = calls.find((c) => !(c.to as string).startsWith('whatsapp:'));
		expect(whatsappCall).toMatchObject({
			to: 'whatsapp:+411',
			contentSid: 'HX1',
			messagingServiceSid: 'MGtest',
			statusCallback: 'https://test.example/api/v1/twilio/messaging/status',
		});
		expect(smsCall).toMatchObject({
			to: '+412',
			contentSid: 'HX1',
			statusCallback: 'https://test.example/api/v1/twilio/messaging/status',
		});

		// Final job update should set status=completed.
		const completionUpdate = jobUpdates.find((u) => u.data.status === 'completed');
		expect(completionUpdate).toBeDefined();
		expect(completionUpdate?.data).toMatchObject({
			sentCount: 2,
			failedCount: 0,
			skippedCount: 1,
			fallbackCount: 1,
		});
	});

	test('non-admin caller is rejected before any DB writes', async () => {
		const { service, twilioClient, created } = makeService({ contacts: [], isAdmin: false });
		const result = await service.dispatchSend(
			{
				templateSid: 'HX1',
				channel: 'sms',
				recipientType: 'contributor',
				selection: { mode: 'include', ids: new Set(['c1']) },
				assignments: {},
			},
			'user1',
		);
		expect(result.success).toBe(false);
		expect(twilioClient.messages.create).not.toHaveBeenCalled();
		expect(created.jobs).toHaveLength(0);
	});

	test('per-message Twilio failure: marks failed and continues', async () => {
		const { service, twilioClient, created, jobUpdates, logUpdates } = makeService({
			contacts: [
				{ id: 'c1', firstName: 'A', phone: { number: '+411', hasWhatsApp: false } },
				{ id: 'c2', firstName: 'B', phone: { number: '+412', hasWhatsApp: false } },
			],
		});
		twilioClient.messages.create
			.mockResolvedValueOnce({ sid: 'SMok' })
			.mockRejectedValueOnce(Object.assign(new Error('boom'), { code: 21610 }));

		const result = await service.dispatchSend(
			{
				templateSid: 'HX1',
				channel: 'sms',
				recipientType: 'contributor',
				selection: { mode: 'include', ids: new Set(['c1', 'c2']) },
				assignments: { '1': { source: 'field', path: 'contact.firstName' } },
			},
			'user1',
		);
		expect(result.success).toBe(true);
		expect(created.logs).toHaveLength(2);
		expect(twilioClient.messages.create).toHaveBeenCalledTimes(2);

		const finalUpdate = jobUpdates.at(-1);
		expect(finalUpdate?.data).toMatchObject({ sentCount: 1, failedCount: 1, status: 'completed' });

		const failedLogUpdate = logUpdates.find((u) => u.data.twilioStatus === 'failed');
		expect(failedLogUpdate?.data).toMatchObject({ twilioErrorCode: '21610' });
	});

	test('omits statusCallback when BASE_URL is not https (e.g. local dev)', async () => {
		const previous = process.env.BASE_URL;
		try {
			const { service, twilioClient } = makeService({
				contacts: [{ id: 'c1', firstName: 'A', phone: { number: '+411', hasWhatsApp: false } }],
			});
			process.env.BASE_URL = 'http://localhost:3000';

			const result = await service.dispatchSend(
				{
					templateSid: 'HX1',
					channel: 'sms',
					recipientType: 'contributor',
					selection: { mode: 'include', ids: new Set(['c1']) },
					assignments: { '1': { source: 'field', path: 'contact.firstName' } },
				},
				'user1',
			);
			expect(result.success).toBe(true);
			expect(twilioClient.messages.create).toHaveBeenCalledTimes(1);
			const callArg = twilioClient.messages.create.mock.calls[0][0] as Record<string, unknown>;
			expect(callArg).not.toHaveProperty('statusCallback');
		} finally {
			process.env.BASE_URL = previous;
		}
	});

	test('missing TWILIO_MESSAGING_SERVICE_SID fails fast', async () => {
		const { service, created } = makeService({ contacts: [] });
		delete process.env.TWILIO_MESSAGING_SERVICE_SID;
		const result = await service.dispatchSend(
			{
				templateSid: 'HX1',
				channel: 'sms',
				recipientType: 'contributor',
				selection: { mode: 'include', ids: new Set() },
				assignments: {},
			},
			'user1',
		);
		expect(result.success).toBe(false);
		expect(created.jobs).toHaveLength(0);
	});
});
