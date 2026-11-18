const mockSendNotification = jest.fn<Promise<unknown>, [{ text: string }]>();

jest.mock('@/modules/mail/mail.service', () => ({
	sendNotification: mockSendNotification,
}));

import { notifyStaffOfCampaignCreated } from './campaign-notification.service';

const campaign = {
	id: 'campaign-1',
	slug: 'my-campaign',
	title: 'My Campaign',
	storyId: 42,
	creatorName: 'Alex Creator',
	goal: 5000,
	currency: 'CHF',
	endDate: new Date('2027-01-31T00:00:00.000Z'),
	public: true,
	hasAccount: false,
};

describe('notifyStaffOfCampaignCreated', () => {
	beforeEach(() => {
		jest.clearAllMocks();
		mockSendNotification.mockResolvedValue({ success: true, data: { sent: 1, skipped: 0 } });
	});

	test('sends one staff email per campaign with its details', async () => {
		await notifyStaffOfCampaignCreated(campaign);

		expect(mockSendNotification).toHaveBeenCalledWith(
			expect.objectContaining({
				type: 'campaign-created',
				subject: 'Campaign created: My Campaign',
				idempotencyKey: 'campaign-created:campaign-1',
				campaignId: 'campaign-1',
			}),
		);
		const text = mockSendNotification.mock.calls[0]?.[0].text;
		expect(text).toContain('Alex Creator created the campaign "My Campaign"');
		expect(text).toContain('once it is approved in Storyblok');
		expect(text).toContain('Goal: CHF 5000');
		expect(text).toContain('Ends: 2027-01-31');
		expect(text).toContain('The creator has no account yet');
		expect(text).toContain('/stories/0/0/42');
	});

	test('says when a campaign is private and has no goal', async () => {
		await notifyStaffOfCampaignCreated({ ...campaign, public: false, goal: null, hasAccount: true });

		const text = mockSendNotification.mock.calls[0]?.[0].text;
		expect(text).toContain('It is private and will not be listed.');
		expect(text).toContain('Goal: none');
		expect(text).not.toContain('no account yet');
	});

	test('does not fail the submission when the email cannot be sent', async () => {
		mockSendNotification.mockResolvedValue({ success: false, error: 'Could not send notification' });
		const consoleError = jest.spyOn(console, 'error').mockImplementation(() => undefined);

		await expect(notifyStaffOfCampaignCreated(campaign)).resolves.toEqual({
			success: false,
			error: 'Could not send notification',
		});
		expect(consoleError).toHaveBeenCalled();
		consoleError.mockRestore();
	});
});
