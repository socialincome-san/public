import { campaignSubmissionConfig } from '@/lib/campaign-submission';
import { addDays, format, startOfDay } from 'date-fns';

const mockFindCampaignForEdit = jest.fn();
const mockUpdateCampaignDetails = jest.fn();
const mockGetCampaignStory = jest.fn();
const mockUpdatePublishedCampaignStory = jest.fn<Promise<unknown>, [number, Record<string, unknown>]>();
const mockUploadStoryblokAsset = jest.fn();
const mockGetStoryblokAsset = jest.fn();
const mockDeleteStoryblokAsset = jest.fn();
const mockSendMail = jest.fn<Promise<unknown>, [{ to: string[]; subject: string; text: string }]>();

jest.mock('./campaign.repository.read', () => ({
	findCampaignForEdit: mockFindCampaignForEdit,
}));

jest.mock('./campaign.repository.write', () => ({
	updateCampaignDetails: mockUpdateCampaignDetails,
}));

jest.mock('./campaign.service', () => ({
	getPublicCampaignStatsByIds: jest.fn(),
}));

jest.mock('./campaign-submission.service', () => ({
	resolveImage: jest.fn(),
}));

jest.mock('@/modules/storyblok-content/storyblok-content.cache', () => ({
	getCampaignBySlug: jest.fn(),
}));

jest.mock('@/modules/mail/mail.service', () => ({
	sendMail: mockSendMail,
}));

jest.mock('@/integrations/storyblok/storyblok-management.integration', () => ({
	getCampaignStory: mockGetCampaignStory,
	updatePublishedCampaignStory: mockUpdatePublishedCampaignStory,
	uploadStoryblokAsset: mockUploadStoryblokAsset,
	getStoryblokAsset: mockGetStoryblokAsset,
	deleteStoryblokAsset: mockDeleteStoryblokAsset,
}));

import { updateOwnCampaign } from './campaign-edit.service';

const audit = { actor: { type: 'contributor' as const, id: 'contributor-1', name: 'Alex' }, source: 'website' as const };

const endDate = startOfDay(addDays(new Date(), 30));

const asset = (id: number) => ({
	id,
	filename: `https://a.storyblok.com/f/109655/${id}.png`,
	fieldtype: 'asset' as const,
	alt: '',
	name: '',
	title: '',
	focus: '',
});

const storyContent = {
	component: 'Campaign',
	_uid: 'uid-1',
	portalSlug: 'my-campaign',
	title: 'My Campaign',
	description: 'Description',
	public: true,
	approved: true,
	creatorName: 'Alex',
	quote: 'Thanks!',
	primaryImage: asset(1),
	profilePicture: asset(2),
	faq: ['faq-uuid'],
	communityEnabled: true,
};

const fields = {
	title: 'My Campaign',
	description: 'Description',
	goal: 500 as number | null,
	currency: 'CHF' as const,
	endDate,
	public: true,
	creatorName: 'Alex',
	quote: 'Thanks!',
	hasAdditionalInformation: false,
	sectionDescription: null as string | null,
	instagramHandle: null as string | null,
	xHandle: null as string | null,
	linkWebsite: null as string | null,
	tiktokHandle: null as string | null,
};

const keepImages = {
	primaryImage: { kind: 'keep' as const },
	profilePicture: { kind: 'keep' as const },
	sectionImage: { kind: 'keep' as const },
};

describe('updateOwnCampaign', () => {
	beforeEach(() => {
		jest.clearAllMocks();
		process.env.CAMPAIGN_EDIT_NOTIFICATION_RECIPIENTS = 'staff@example.org';
		mockFindCampaignForEdit.mockResolvedValue({
			id: 'campaign-1',
			slug: 'my-campaign',
			contributorId: 'contributor-1',
			goal: 500,
			currency: 'CHF',
			endDate,
		});
		mockGetCampaignStory.mockResolvedValue({ success: true, data: { storyId: 42, content: storyContent } });
		mockUpdatePublishedCampaignStory.mockResolvedValue({ success: true, data: undefined });
		mockUpdateCampaignDetails.mockResolvedValue({ id: 'campaign-1' });
		mockSendMail.mockResolvedValue({ success: true, data: undefined });
		mockGetStoryblokAsset.mockResolvedValue({ success: true, data: null });
	});

	test('rejects campaigns of other contributors', async () => {
		const result = await updateOwnCampaign(audit, 'contributor-2', 'campaign-1', fields, keepImages);

		expect(result).toEqual({ success: false, error: 'campaign-not-found', status: 404 });
		expect(mockUpdatePublishedCampaignStory).not.toHaveBeenCalled();
		expect(mockUpdateCampaignDetails).not.toHaveBeenCalled();
	});

	test('does nothing when nothing changed', async () => {
		const result = await updateOwnCampaign(audit, 'contributor-1', 'campaign-1', fields, keepImages);

		expect(result.success).toBe(true);
		expect(mockUpdatePublishedCampaignStory).not.toHaveBeenCalled();
		expect(mockSendMail).not.toHaveBeenCalled();
	});

	test('keeps fields only staff edit and notifies staff', async () => {
		const result = await updateOwnCampaign(
			audit,
			'contributor-1',
			'campaign-1',
			{ ...fields, title: 'New title', goal: 800 },
			{ ...keepImages, profilePicture: { kind: 'remove' } },
		);

		expect(result.success).toBe(true);
		const [storyId, content] = mockUpdatePublishedCampaignStory.mock.calls[0];
		expect(storyId).toBe(42);
		expect(content).toMatchObject({
			title: 'New title',
			approved: true,
			faq: ['faq-uuid'],
			communityEnabled: true,
			primaryImage: asset(1),
		});
		expect(content.profilePicture).toBeUndefined();
		expect(mockUpdateCampaignDetails).toHaveBeenCalledWith(audit, 'campaign-1', {
			goal: 800,
			currency: 'CHF',
			endDate,
		});
		const mail = mockSendMail.mock.calls[0]?.[0];
		expect(mail?.to).toEqual(['staff@example.org']);
		expect(mail?.text).toContain('Changed: title, profilePicture, goal');
	});

	test('deletes a removed image only from the campaign asset folder', async () => {
		mockGetStoryblokAsset.mockResolvedValue({
			success: true,
			data: { id: 2, assetFolderId: campaignSubmissionConfig.storyblokCampaignAssetFolderId },
		});

		await updateOwnCampaign(audit, 'contributor-1', 'campaign-1', fields, {
			...keepImages,
			profilePicture: { kind: 'remove' },
		});

		expect(mockDeleteStoryblokAsset).toHaveBeenCalledWith(2);
	});

	test('keeps a removed image that lives outside the campaign asset folder', async () => {
		mockGetStoryblokAsset.mockResolvedValue({ success: true, data: { id: 2, assetFolderId: 1 } });

		await updateOwnCampaign(audit, 'contributor-1', 'campaign-1', fields, {
			...keepImages,
			profilePicture: { kind: 'remove' },
		});

		expect(mockDeleteStoryblokAsset).not.toHaveBeenCalled();
	});

	test('reverts the database when Storyblok fails', async () => {
		mockUpdatePublishedCampaignStory.mockResolvedValue({ success: false, error: 'Storyblok request failed.', status: 503 });

		const result = await updateOwnCampaign(audit, 'contributor-1', 'campaign-1', { ...fields, goal: 800 }, keepImages);

		expect(result).toEqual({ success: false, error: 'submission-failed', status: 503 });
		expect(mockUpdateCampaignDetails).toHaveBeenLastCalledWith(audit, 'campaign-1', {
			goal: 500,
			currency: 'CHF',
			endDate,
		});
		expect(mockSendMail).not.toHaveBeenCalled();
	});

	test('leaves the database untouched when only story fields change', async () => {
		mockFindCampaignForEdit.mockResolvedValue({
			id: 'campaign-1',
			slug: 'my-campaign',
			contributorId: 'contributor-1',
			goal: 500,
			currency: 'CHF',
			endDate: new Date(endDate.getTime() + 17 * 60 * 60 * 1000),
		});

		const result = await updateOwnCampaign(
			audit,
			'contributor-1',
			'campaign-1',
			{ ...fields, title: 'New title' },
			keepImages,
		);

		expect(result.success).toBe(true);
		expect(mockUpdateCampaignDetails).not.toHaveBeenCalled();
		expect(mockUpdatePublishedCampaignStory).toHaveBeenCalled();
	});

	test('treats a missing public flag like a private campaign', async () => {
		mockGetCampaignStory.mockResolvedValue({
			success: true,
			data: { storyId: 42, content: { ...storyContent, public: undefined } },
		});

		const result = await updateOwnCampaign(audit, 'contributor-1', 'campaign-1', { ...fields, public: false }, keepImages);

		expect(result.success).toBe(true);
		expect(mockUpdatePublishedCampaignStory).not.toHaveBeenCalled();
	});

	test('tells staff when unpublished CMS changes went live', async () => {
		mockGetCampaignStory.mockResolvedValue({
			success: true,
			data: { storyId: 42, content: storyContent, hasUnpublishedChanges: true },
		});

		await updateOwnCampaign(audit, 'contributor-1', 'campaign-1', { ...fields, title: 'New title' }, keepImages);

		expect(mockSendMail.mock.calls[0]?.[0].text).toContain('unpublished changes');
	});

	test('rejects a new end date outside the duration limits', async () => {
		const tooSoon = startOfDay(addDays(new Date(), 1));

		const result = await updateOwnCampaign(
			audit,
			'contributor-1',
			'campaign-1',
			{ ...fields, endDate: tooSoon },
			keepImages,
		);

		expect(result).toEqual({ success: false, error: 'end-date-too-soon', status: 400 });
		expect(format(tooSoon, 'yyyy-MM-dd')).not.toBe(format(endDate, 'yyyy-MM-dd'));
	});
});
