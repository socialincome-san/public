import { NextRequest } from 'next/server';

const mockGetSessionByType = jest.fn();
const mockClaimPendingCampaigns = jest.fn();

jest.mock('@/lib/firebase/current-account', () => ({
	getSessionByType: mockGetSessionByType,
}));

jest.mock('@/lib/services/services', () => ({
	services: {
		campaignPendingClaim: {
			claimPendingCampaigns: mockClaimPendingCampaigns,
		},
	},
}));

import { POST } from './route';

describe('POST /api/campaign-submissions/claim-pending', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	test('returns an empty success list when the session is not a contributor', async () => {
		mockGetSessionByType.mockResolvedValue({ success: false, error: 'No contributor session' });

		const response = await POST(
			new NextRequest('http://localhost/api/campaign-submissions/claim-pending', {
				method: 'POST',
				body: JSON.stringify({ claimIds: ['Ab12Cd34'] }),
				headers: { 'Content-Type': 'application/json' },
			}),
		);
		const body: unknown = await response.json();

		expect(response.status).toBe(200);
		expect(body).toEqual({ successfulClaimIds: [] });
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

		const response = await POST(
			new NextRequest('http://localhost/api/campaign-submissions/claim-pending', {
				method: 'POST',
				body: JSON.stringify({ claimIds: ['Ab12Cd34', 42] }),
				headers: { 'Content-Type': 'application/json' },
			}),
		);
		const body: unknown = await response.json();

		expect(response.status).toBe(200);
		expect(body).toEqual({ successfulClaimIds: ['Ab12Cd34'], campaignSlug: 'my-campaign' });
		expect(mockClaimPendingCampaigns).toHaveBeenCalledWith('contributor-1', ['Ab12Cd34']);
	});

	test('returns 503 when claiming fails', async () => {
		mockGetSessionByType.mockResolvedValue({
			success: true,
			data: { type: 'contributor', id: 'contributor-1' },
		});
		mockClaimPendingCampaigns.mockResolvedValue({
			success: false,
			error: 'db-down',
		});

		const response = await POST(
			new NextRequest('http://localhost/api/campaign-submissions/claim-pending', {
				method: 'POST',
				body: JSON.stringify({ claimIds: ['Ab12Cd34'] }),
				headers: { 'Content-Type': 'application/json' },
			}),
		);
		const body: unknown = await response.json();

		expect(response.status).toBe(503);
		expect(body).toEqual({ errorCode: 'submission-failed' });
	});
});
