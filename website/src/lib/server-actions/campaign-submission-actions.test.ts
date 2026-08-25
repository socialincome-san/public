const mockGetOrCreateFromEmailAndName = jest.fn();
const mockGetSessionByType = jest.fn();
const mockClaimPendingCampaigns = jest.fn();

jest.mock('@/lib/firebase/current-account', () => ({
	getSessionByType: mockGetSessionByType,
}));

jest.mock('@/lib/services/services', () => ({
	services: {
		write: {
			contributor: {
				getOrCreateFromEmailAndName: mockGetOrCreateFromEmailAndName,
			},
		},
		campaignPendingClaim: {
			claimPendingCampaigns: mockClaimPendingCampaigns,
		},
	},
}));

import { claimPendingCampaignsAction, ensureCampaignGuestAccountAction } from './campaign-submission-actions';

describe('ensureCampaignGuestAccountAction', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	test('fails for non-object input', async () => {
		const result = await ensureCampaignGuestAccountAction('not-json');

		expect(result).toEqual({ success: false, error: 'invalid-submission', status: 400 });
		expect(mockGetOrCreateFromEmailAndName).not.toHaveBeenCalled();
	});

	test('fails for invalid personal fields', async () => {
		const result = await ensureCampaignGuestAccountAction({
			email: 'not-an-email',
			firstName: '',
			lastName: 'Lovelace',
		});

		expect(result.success).toBe(false);
		if (result.success) {
			throw new Error('Expected failure');
		}
		expect(result.error).toMatch(/^(email-invalid|first-name-required)$/);
		expect(result.status).toBe(400);
		expect(mockGetOrCreateFromEmailAndName).not.toHaveBeenCalled();
	});

	test('succeeds when get-or-create succeeds', async () => {
		mockGetOrCreateFromEmailAndName.mockResolvedValue({
			success: true,
			data: { contributor: { id: 'contributor-1' }, isNewContributor: true },
		});

		const result = await ensureCampaignGuestAccountAction({
			email: 'ada@example.com',
			firstName: 'Ada',
			lastName: 'Lovelace',
		});

		expect(result).toEqual({ success: true, data: true });
		expect(mockGetOrCreateFromEmailAndName).toHaveBeenCalledWith({
			email: 'ada@example.com',
			firstName: 'Ada',
			lastName: 'Lovelace',
		});
	});

	test('fails when get-or-create fails', async () => {
		mockGetOrCreateFromEmailAndName.mockResolvedValue({
			success: false,
			error: 'database-down',
		});

		const result = await ensureCampaignGuestAccountAction({
			email: 'ada@example.com',
			firstName: 'Ada',
			lastName: 'Lovelace',
		});

		expect(result).toEqual({ success: false, error: 'submission-failed', status: 503 });
	});
});

describe('claimPendingCampaignsAction', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	test('returns an empty success list when the session is not a contributor', async () => {
		mockGetSessionByType.mockResolvedValue({ success: false, error: 'No contributor session' });

		const result = await claimPendingCampaignsAction(['Ab12Cd34']);

		expect(result).toEqual({ success: true, data: { successfulClaimIds: [] } });
		expect(mockClaimPendingCampaigns).not.toHaveBeenCalled();
	});

	test('returns successful claim ids and campaignSlug for a contributor session', async () => {
		mockGetSessionByType.mockResolvedValue({
			success: true,
			data: { type: 'contributor', id: 'contributor-1' },
		});
		mockClaimPendingCampaigns.mockResolvedValue({
			success: true,
			data: { successfulClaimIds: ['Ab12Cd34'], campaignSlug: 'my-campaign' },
		});

		const result = await claimPendingCampaignsAction(['Ab12Cd34', 42]);

		expect(result).toEqual({
			success: true,
			data: { successfulClaimIds: ['Ab12Cd34'], campaignSlug: 'my-campaign' },
		});
		expect(mockClaimPendingCampaigns).toHaveBeenCalledWith('contributor-1', ['Ab12Cd34']);
	});

	test('returns an empty success list when claim ids are empty', async () => {
		mockGetSessionByType.mockResolvedValue({
			success: true,
			data: { type: 'contributor', id: 'contributor-1' },
		});

		const result = await claimPendingCampaignsAction([]);

		expect(result).toEqual({ success: true, data: { successfulClaimIds: [] } });
		expect(mockClaimPendingCampaigns).not.toHaveBeenCalled();
	});

	test('fails when claiming fails', async () => {
		mockGetSessionByType.mockResolvedValue({
			success: true,
			data: { type: 'contributor', id: 'contributor-1' },
		});
		mockClaimPendingCampaigns.mockResolvedValue({
			success: false,
			error: 'db-down',
		});

		const result = await claimPendingCampaignsAction(['Ab12Cd34']);

		expect(result).toEqual({ success: false, error: 'submission-failed', status: 503 });
	});
});
