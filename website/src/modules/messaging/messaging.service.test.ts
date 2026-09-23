import { resultOk } from '@/lib/service-result';
import * as messagingRepository from './messaging.repository';
import {
	dispatchMessagingSend,
	handleMessagingStatusCallback,
	listMessagingJobs,
	previewMessagingChannel,
} from './messaging.service';

const mockIsAdmin = jest.fn();
const mockGetRecipientMessagingTargets = jest.fn();
const mockGetTwilioContent = jest.fn();
const mockSendTwilioMessage = jest.fn();

jest.mock('@/modules/users/user.service', () => ({
	isAdmin: (...args: unknown[]): unknown => mockIsAdmin(...args),
}));

jest.mock('@/modules/recipients/recipient.service', () => ({
	getRecipientMessagingTargets: (...args: unknown[]): unknown => mockGetRecipientMessagingTargets(...args),
	getPaginatedRecipientTableView: jest.fn(),
}));

jest.mock('@/modules/contributors/contributor.service', () => ({
	getPaginatedContributorTableView: jest.fn(),
}));

jest.mock('@/modules/local-partners/local-partner.service', () => ({
	getPaginatedLocalPartnerTableView: jest.fn(),
	getLocalPartnerMessagingTargets: jest.fn(),
}));

jest.mock('./messaging.repository', () => ({
	countMessagingJobs: jest.fn(),
	createMessagingJobWithLogs: jest.fn(),
	findContactsForMessagingPlan: jest.fn(),
	findDispatchLogs: jest.fn(),
	findMessagingJobs: jest.fn(),
	findMessageLogByTwilioSid: jest.fn(),
	updateMessageAsFailed: jest.fn(),
	updateMessageAsSent: jest.fn(),
	updateDeliveredMessageStatus: jest.fn(),
	updateMessagingJobCompleted: jest.fn(),
	updateMessagingJobCounters: jest.fn(),
	updateMessagingJobInterrupted: jest.fn(),
	updateMessageStatusUnlessBlocked: jest.fn(),
	updateOrphanedMessagingJobs: jest.fn(),
}));

jest.mock('@/integrations/twilio/twilio-messaging.integration', () => ({
	getTwilioContent: (...args: unknown[]): unknown => mockGetTwilioContent(...args),
	getTwilioMessageStatus: jest.fn(),
	listTwilioContent: jest.fn(),
	sendTwilioContentMessage: (...args: unknown[]): unknown => mockSendTwilioMessage(...args),
	validateTwilioWebhook: jest.fn(),
}));

beforeEach(() => {
	jest.clearAllMocks();
	mockIsAdmin.mockResolvedValue(resultOk(true));
});

describe('messaging recipient channel preview', () => {
	test('uses the selected phone source and resolves WhatsApp fallback', async () => {
		mockGetRecipientMessagingTargets.mockResolvedValue(
			resultOk([
				{
					contactId: 'c1',
					contact: { phone: { number: '+1', hasWhatsApp: true } },
					paymentInformation: { phone: { number: '+2', hasWhatsApp: false } },
				},
				{
					contactId: 'c2',
					contact: { phone: null },
					paymentInformation: null,
				},
			]),
		);

		const result = await previewMessagingChannel(
			{
				channel: 'whatsapp',
				recipientType: 'recipient',
				phoneSource: 'payment',
				phoneFallbackAllowed: true,
				selection: { mode: 'include', ids: new Set(['r1', 'r2']) },
			},
			'user1',
		);

		expect(result).toEqual(resultOk({ total: 2, primary: 0, fallback: 1, skippedNoPhone: 1 }));
		expect(mockGetRecipientMessagingTargets).toHaveBeenCalledWith(['r1', 'r2']);
	});

	test('rejects payment phones for non-recipients before selection lookup', async () => {
		const result = await previewMessagingChannel(
			{
				channel: 'sms',
				recipientType: 'contributor',
				phoneSource: 'payment',
				phoneFallbackAllowed: false,
				selection: { mode: 'include', ids: new Set(['c1']) },
			},
			'user1',
		);

		expect(result).toEqual({ success: false, error: 'Payment phone is only available for recipients' });
		expect(mockGetRecipientMessagingTargets).not.toHaveBeenCalled();
	});
});

describe('messaging dispatch', () => {
	test('creates a durable plan and records sent, fallback, and skipped progress', async () => {
		process.env.TWILIO_MESSAGING_SERVICE_SID = 'MGtest';
		process.env.BASE_URL = 'https://example.org';
		mockGetTwilioContent.mockResolvedValue(
			resultOk({
				sid: 'HX1',
				friendlyName: 'Welcome',
				language: 'en',
				content: { 'twilio/text': { body: 'Hi {{1}}' } },
				variables: { '1': 'Ada' },
				whatsappStatus: 'approved',
			}),
		);
		mockGetRecipientMessagingTargets.mockResolvedValue(
			resultOk([
				{
					contactId: 'c1',
					contact: { phone: { number: '+1', hasWhatsApp: true } },
					paymentInformation: null,
				},
				{
					contactId: 'c2',
					contact: { phone: { number: '+2', hasWhatsApp: false } },
					paymentInformation: null,
				},
				{ contactId: 'c3', contact: { phone: null }, paymentInformation: null },
			]),
		);
		jest.mocked(messagingRepository.findContactsForMessagingPlan).mockResolvedValue([
			{
				id: 'c1',
				firstName: 'Ada',
				lastName: 'Lovelace',
				callingName: null,
				email: null,
				gender: null,
				language: null,
				dateOfBirth: null,
				profession: null,
			},
			{
				id: 'c2',
				firstName: 'Grace',
				lastName: 'Hopper',
				callingName: null,
				email: null,
				gender: null,
				language: null,
				dateOfBirth: null,
				profession: null,
			},
			{
				id: 'c3',
				firstName: 'Joan',
				lastName: 'Clarke',
				callingName: null,
				email: null,
				gender: null,
				language: null,
				dateOfBirth: null,
				profession: null,
			},
		]);
		jest.mocked(messagingRepository.createMessagingJobWithLogs).mockResolvedValue({ id: 'job1' });
		jest.mocked(messagingRepository.findDispatchLogs).mockResolvedValue([
			{ id: 'log1', contactId: 'c1' },
			{ id: 'log2', contactId: 'c2' },
			{ id: 'log3', contactId: 'c3' },
		]);
		mockSendTwilioMessage.mockResolvedValueOnce(resultOk({ sid: 'SM1' })).mockResolvedValueOnce(resultOk({ sid: 'SM2' }));

		const result = await dispatchMessagingSend(
			{
				templateSid: 'HX1',
				channel: 'whatsapp',
				recipientType: 'recipient',
				phoneSource: 'contact',
				phoneFallbackAllowed: false,
				selection: { mode: 'include', ids: new Set(['r1', 'r2', 'r3']) },
				assignments: { '1': { source: 'field', path: 'contact.firstName' } },
			},
			'user1',
		);

		expect(result).toEqual(resultOk({ jobId: 'job1' }));
		expect(mockSendTwilioMessage).toHaveBeenCalledTimes(2);
		expect(mockSendTwilioMessage).toHaveBeenNthCalledWith(
			1,
			expect.objectContaining({ to: 'whatsapp:+1', statusCallback: 'https://example.org/api/v1/twilio/messaging/status' }),
		);
		expect(mockSendTwilioMessage).toHaveBeenNthCalledWith(2, expect.objectContaining({ to: '+2' }));
		expect(messagingRepository.updateMessagingJobCompleted).toHaveBeenCalledWith(
			'job1',
			expect.objectContaining({
				sentCount: 2,
				failedCount: 0,
				skippedCount: 1,
				fallbackCount: 1,
			}),
		);
	});
});

describe('messaging delivery logs', () => {
	test('authorizes, sweeps stale jobs, and maps paginated rows', async () => {
		jest.mocked(messagingRepository.updateOrphanedMessagingJobs).mockResolvedValue({ count: 1 });
		jest.mocked(messagingRepository.findMessagingJobs).mockResolvedValue([
			{
				id: 'job1',
				templateFriendlyName: 'Welcome',
				channelRequested: 'sms',
				sentCount: 2,
				totalSelected: 3,
				status: 'completed',
				startedAt: new Date('2026-01-01T00:00:00.000Z'),
				createdBy: { contact: { firstName: 'Ada', lastName: 'Lovelace' } },
			},
		]);
		jest.mocked(messagingRepository.countMessagingJobs).mockResolvedValue(1);

		const result = await listMessagingJobs({ page: 2, pageSize: 10 }, 'user1');

		expect(result.success && result.data.rows[0]?.createdByName).toBe('Ada Lovelace');
		expect(messagingRepository.findMessagingJobs).toHaveBeenCalledWith(10, 10);
		expect(messagingRepository.updateOrphanedMessagingJobs).toHaveBeenCalledTimes(1);
	});
});

describe('messaging status callbacks', () => {
	test('increments delivery exactly through the atomic repository operation', async () => {
		jest.mocked(messagingRepository.findMessageLogByTwilioSid).mockResolvedValue({
			id: 'log1',
			jobId: 'job1',
			twilioStatus: 'sent',
			twilioErrorCode: null,
			twilioErrorMessage: null,
		});
		jest.mocked(messagingRepository.updateDeliveredMessageStatus).mockResolvedValue(true);

		const result = await handleMessagingStatusCallback({ messageSid: 'SM1', status: 'delivered' });

		expect(result).toEqual(resultOk({ updated: true }));
		expect(messagingRepository.updateDeliveredMessageStatus).toHaveBeenCalledWith({
			messageLogId: 'log1',
			jobId: 'job1',
			data: {
				twilioStatus: 'delivered',
				twilioErrorCode: null,
				twilioErrorMessage: null,
			},
		});
	});

	test('does not fail for an unknown Twilio message SID', async () => {
		jest.mocked(messagingRepository.findMessageLogByTwilioSid).mockResolvedValue(null);

		expect(await handleMessagingStatusCallback({ messageSid: 'unknown', status: 'sent' })).toEqual(
			resultOk({ updated: false }),
		);
	});
});
