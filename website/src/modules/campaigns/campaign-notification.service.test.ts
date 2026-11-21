const mockSendNotification = jest.fn();

jest.mock('@/modules/mail/mail.service', () => ({
	sendNotification: mockSendNotification,
}));

import { notifyStaffOfCampaignCreated, notifyStaffOfCampaignEdit } from './campaign-notification.service';

const campaign = { id: 'campaign-1', slug: 'my-campaign', title: 'My Campaign', storyId: 42 };

describe('campaign notifications', () => {
	beforeEach(() => {
		jest.clearAllMocks();
		mockSendNotification.mockResolvedValue({ success: true, data: { sent: 1, skipped: 0 } });
	});

	test('sends the created email once per campaign', async () => {
		const data = {
			...campaign,
			creatorName: 'Alex Creator',
			goal: 5000,
			currency: 'CHF',
			endDate: new Date('2027-01-31T00:00:00.000Z'),
			public: true,
			hasAccount: false,
		};

		await expect(notifyStaffOfCampaignCreated(data)).resolves.toEqual({ success: true, data: undefined });
		expect(mockSendNotification).toHaveBeenCalledWith({
			type: 'campaign-created',
			data,
			idempotencyKey: 'campaign-created:campaign-1',
			campaignId: 'campaign-1',
		});
	});

	test('reports a failed edit email without throwing', async () => {
		mockSendNotification.mockResolvedValue({ success: false, error: 'Could not send notification' });
		const consoleError = jest.spyOn(console, 'error').mockImplementation(() => undefined);

		await expect(
			notifyStaffOfCampaignEdit({ ...campaign, editorName: 'Ada', changedFields: ['title'], hadUnpublishedChanges: false }),
		).resolves.toEqual({ success: false, error: 'Could not send notification' });
		expect(consoleError).toHaveBeenCalled();
		consoleError.mockRestore();
	});
});
