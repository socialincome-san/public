import { addDays, format, startOfDay } from 'date-fns';

import type {
	CampaignSubmissionFields,
	CampaignSubmissionImageSource,
	CampaignSubmissionOptionalImages,
} from '@/lib/services/campaign/campaign-submission-input';
import type { CampaignSubmissionResult } from '@/lib/services/campaign/campaign-submission.service';
import type { TurnstileVerificationResult } from '@/lib/services/campaign/verify-turnstile-token';
import type { ServiceResult } from '@/lib/services/core/base.types';

const mockSubmit = jest.fn() as jest.MockedFunction<
	(
		fields: CampaignSubmissionFields,
		imageSource: CampaignSubmissionImageSource,
		optionalImages?: CampaignSubmissionOptionalImages,
		contributorId?: string | null,
	) => Promise<ServiceResult<CampaignSubmissionResult>>
>;
const mockVerifyTurnstileToken = jest.fn() as jest.MockedFunction<
	(token: string | null) => Promise<TurnstileVerificationResult>
>;
const mockGetOrCreateFromEmailAndName = jest.fn();
const mockGetSessionByType = jest.fn();
const mockClaimPendingCampaigns = jest.fn();
const mockGetOptionalContributor = jest.fn();

jest.mock('@/lib/firebase/current-account', () => ({
	getSessionByType: mockGetSessionByType,
}));

jest.mock('@/lib/firebase/current-contributor', () => ({
	getOptionalContributor: mockGetOptionalContributor,
}));

jest.mock('@/lib/services/services', () => ({
	services: {
		campaignSubmission: {
			submit: mockSubmit,
		},
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

jest.mock('@/lib/services/campaign/verify-turnstile-token', () => {
	const actual: typeof import('@/lib/services/campaign/verify-turnstile-token') = jest.requireActual(
		'@/lib/services/campaign/verify-turnstile-token',
	);

	return {
		...actual,
		verifyTurnstileToken: mockVerifyTurnstileToken,
	};
});

import { claimPendingCampaignsAction, submitCampaignAction } from './campaign-submission-actions';

const validEndDateString = () => format(addDays(startOfDay(new Date()), 30), 'yyyy-MM-dd');

const createValidFormData = () => {
	const formData = new FormData();
	formData.set('title', 'My Campaign');
	formData.set('description', 'A description');
	formData.set('goal', '1000');
	formData.set('currency', 'CHF');
	formData.set('endDate', validEndDateString());
	formData.set('programId', 'program-1');
	formData.set('public', 'true');
	formData.set('creatorName', 'Alex Creator');
	formData.set('quote', 'Thank you for your support!');
	formData.set('hasAdditionalInformation', 'false');
	formData.set(
		'primaryImage',
		new File([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00])], 'cover.png', {
			type: 'image/png',
		}),
	);

	return formData;
};

describe('submitCampaignAction', () => {
	beforeEach(() => {
		jest.clearAllMocks();
		mockVerifyTurnstileToken.mockResolvedValue({ success: true });
		mockGetOptionalContributor.mockResolvedValue(null);
	});

	test('returns submission-failed with service status when eligibility orchestration fails', async () => {
		mockSubmit.mockResolvedValue({
			success: false,
			error: 'submission-failed',
			status: 503,
		});

		const result = await submitCampaignAction(createValidFormData());

		expect(result).toEqual({ success: false, error: 'submission-failed', status: 503 });
		expect(mockSubmit).toHaveBeenCalledWith(
			expect.objectContaining({ programId: 'program-1', public: true, creatorName: 'Alex Creator' }),
			expect.objectContaining({ kind: 'upload' }),
			expect.objectContaining({ profilePicture: null, sectionImage: null }),
			null,
		);
		expect(mockSubmit.mock.calls[0]?.[1]).toMatchObject({
			kind: 'upload',
			image: { mimeType: 'image/png', filename: 'cover.png' },
		});
	});

	test('passes validated fields and image to submit without assembling portal slugs', async () => {
		mockSubmit.mockResolvedValue({ success: true, data: { slug: 'my-campaign', claimId: 'Ab12Cd34' } });

		const result = await submitCampaignAction(createValidFormData());

		expect(result).toEqual({ success: true, data: { slug: 'my-campaign', claimId: 'Ab12Cd34' } });
		expect(mockSubmit).toHaveBeenCalledWith(
			expect.objectContaining({ programId: 'program-1' }),
			expect.objectContaining({ kind: 'upload' }),
			expect.objectContaining({ profilePicture: null, sectionImage: null }),
			null,
		);
		expect(mockGetOrCreateFromEmailAndName).not.toHaveBeenCalled();
	});

	test('creates a guest contributor account after a successful guest submission', async () => {
		mockSubmit.mockResolvedValue({ success: true, data: { slug: 'my-campaign', claimId: 'Ab12Cd34' } });
		mockGetOrCreateFromEmailAndName.mockResolvedValue({
			success: true,
			data: { contributor: { id: 'contributor-1' }, isNewContributor: true },
		});

		const formData = createValidFormData();
		formData.set('firstName', 'Ada');
		formData.set('lastName', 'Lovelace');
		formData.set('email', 'ada@example.com');

		const result = await submitCampaignAction(formData);

		expect(result).toEqual({ success: true, data: { slug: 'my-campaign', claimId: 'Ab12Cd34' } });
		expect(mockGetOrCreateFromEmailAndName).toHaveBeenCalledWith({
			email: 'ada@example.com',
			firstName: 'Ada',
			lastName: 'Lovelace',
		});
	});

	test('still succeeds when guest account creation fails after submission', async () => {
		mockSubmit.mockResolvedValue({ success: true, data: { slug: 'my-campaign', claimId: 'Ab12Cd34' } });
		mockGetOrCreateFromEmailAndName.mockResolvedValue({
			success: false,
			error: 'database-down',
		});

		const formData = createValidFormData();
		formData.set('firstName', 'Ada');
		formData.set('lastName', 'Lovelace');
		formData.set('email', 'ada@example.com');

		const result = await submitCampaignAction(formData);

		expect(result).toEqual({ success: true, data: { slug: 'my-campaign', claimId: 'Ab12Cd34' } });
		expect(mockGetOrCreateFromEmailAndName).toHaveBeenCalled();
	});

	test('does not create a guest account when a contributor is already logged in', async () => {
		mockGetOptionalContributor.mockResolvedValue({ type: 'contributor', id: 'contributor-1' });
		mockSubmit.mockResolvedValue({ success: true, data: { slug: 'my-campaign' } });

		const formData = createValidFormData();
		formData.set('firstName', 'Ada');
		formData.set('lastName', 'Lovelace');
		formData.set('email', 'ada@example.com');

		const result = await submitCampaignAction(formData);

		expect(result).toEqual({ success: true, data: { slug: 'my-campaign' } });
		expect(mockGetOrCreateFromEmailAndName).not.toHaveBeenCalled();
	});

	test('omits claimId from the result when the service does not return one', async () => {
		mockGetOptionalContributor.mockResolvedValue({ type: 'contributor', id: 'contributor-1' });
		mockSubmit.mockResolvedValue({ success: true, data: { slug: 'my-campaign' } });

		const result = await submitCampaignAction(createValidFormData());

		expect(result).toEqual({ success: true, data: { slug: 'my-campaign' } });
	});

	test('passes contributorId from the contributor session when logged in', async () => {
		mockGetOptionalContributor.mockResolvedValue({ type: 'contributor', id: 'contributor-1' });
		mockSubmit.mockResolvedValue({ success: true, data: { slug: 'my-campaign' } });

		const result = await submitCampaignAction(createValidFormData());

		expect(result.success).toBe(true);
		expect(mockGetOptionalContributor).toHaveBeenCalled();
		expect(mockSubmit).toHaveBeenCalledWith(
			expect.objectContaining({ programId: 'program-1' }),
			expect.objectContaining({ kind: 'upload' }),
			expect.objectContaining({ profilePicture: null, sectionImage: null }),
			'contributor-1',
		);
	});

	test('accepts defaultImageId without an upload file', async () => {
		const formData = new FormData();
		formData.set('title', 'My Campaign');
		formData.set('description', 'A description');
		formData.set('goal', '');
		formData.set('currency', 'CHF');
		formData.set('endDate', validEndDateString());
		formData.set('programId', 'program-1');
		formData.set('public', 'false');
		formData.set('creatorName', 'Alex Creator');
		formData.set('quote', 'Thank you for your support!');
		formData.set('hasAdditionalInformation', 'false');
		formData.set('defaultImageId', '99');
		mockSubmit.mockResolvedValue({ success: true, data: { slug: 'my-campaign' } });

		const result = await submitCampaignAction(formData);

		expect(result.success).toBe(true);
		expect(mockSubmit).toHaveBeenCalledWith(
			expect.objectContaining({ goal: null, public: false }),
			{
				kind: 'default',
				defaultImageId: 99,
			},
			expect.objectContaining({ profilePicture: null, sectionImage: null }),
			null,
		);
	});

	test('passes optional profile and section images when additional information is enabled', async () => {
		const formData = createValidFormData();
		formData.set('hasAdditionalInformation', 'true');
		formData.set('sectionDescription', 'Extra');
		formData.set(
			'profilePicture',
			new File([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00])], 'profile.png', {
				type: 'image/png',
			}),
		);
		formData.set(
			'sectionImage',
			new File([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00])], 'section.png', {
				type: 'image/png',
			}),
		);
		mockSubmit.mockResolvedValue({ success: true, data: { slug: 'my-campaign' } });

		const result = await submitCampaignAction(formData);

		expect(result.success).toBe(true);
		expect(mockSubmit).toHaveBeenCalledWith(
			expect.objectContaining({ hasAdditionalInformation: true, sectionDescription: 'Extra' }),
			expect.objectContaining({ kind: 'upload' }),
			expect.anything(),
			null,
		);
		expect(mockSubmit.mock.calls[0]?.[2]).toMatchObject({
			profilePicture: { filename: 'profile.png' },
			sectionImage: { filename: 'section.png' },
		});
	});

	test('verifies the Turnstile token before creating the campaign', async () => {
		const formData = createValidFormData();
		formData.set('cf-turnstile-response', 'turnstile-token');
		mockSubmit.mockResolvedValue({ success: true, data: { slug: 'my-campaign' } });

		const result = await submitCampaignAction(formData);

		expect(result.success).toBe(true);
		expect(mockVerifyTurnstileToken).toHaveBeenCalledWith('turnstile-token');
		expect(mockSubmit).toHaveBeenCalled();
	});

	test('rejects both primaryImage and defaultImageId', async () => {
		const formData = createValidFormData();
		formData.set('defaultImageId', '99');

		const result = await submitCampaignAction(formData);

		expect(result).toEqual({ success: false, error: 'invalid-submission', status: 400 });
		expect(mockSubmit).not.toHaveBeenCalled();
	});

	test('returns image field for primaryImage validation failures', async () => {
		const formData = createValidFormData();
		formData.set('primaryImage', new File([Buffer.alloc(6 * 1024 * 1024)], 'huge.png', { type: 'image/png' }));

		const result = await submitCampaignAction(formData);

		expect(result).toEqual({ success: false, error: 'image-too-large', status: 400, field: 'primaryImage' });
		expect(mockSubmit).not.toHaveBeenCalled();
	});

	test('returns image field for profilePicture validation failures', async () => {
		const formData = createValidFormData();
		formData.set(
			'profilePicture',
			new File([Buffer.from('not-an-image')], 'profile.txt', {
				type: 'text/plain',
			}),
		);

		const result = await submitCampaignAction(formData);

		expect(result).toEqual({
			success: false,
			error: 'image-format-unsupported',
			status: 400,
			field: 'profilePicture',
		});
		expect(mockSubmit).not.toHaveBeenCalled();
	});

	test('returns image field for sectionImage validation failures', async () => {
		const formData = createValidFormData();
		formData.set('hasAdditionalInformation', 'true');
		formData.set('sectionDescription', 'Extra');
		formData.set(
			'sectionImage',
			new File([Buffer.from('not-an-image')], 'section.txt', {
				type: 'text/plain',
			}),
		);

		const result = await submitCampaignAction(formData);

		expect(result).toEqual({
			success: false,
			error: 'image-format-unsupported',
			status: 400,
			field: 'sectionImage',
		});
		expect(mockSubmit).not.toHaveBeenCalled();
	});

	test('rejects submissions when Turnstile verification fails', async () => {
		mockVerifyTurnstileToken.mockResolvedValue({ success: false, error: 'turnstile-invalid' });

		const result = await submitCampaignAction(createValidFormData());

		expect(result).toEqual({ success: false, error: 'turnstile-invalid', status: 400 });
		expect(mockSubmit).not.toHaveBeenCalled();
	});

	test('rejects submissions when the Turnstile token is missing', async () => {
		mockVerifyTurnstileToken.mockResolvedValue({ success: false, error: 'turnstile-required' });

		const result = await submitCampaignAction(createValidFormData());

		expect(result).toEqual({ success: false, error: 'turnstile-required', status: 400 });
		expect(mockSubmit).not.toHaveBeenCalled();
	});

	test('returns submission-failed when Turnstile verification is unavailable', async () => {
		mockVerifyTurnstileToken.mockResolvedValue({ success: false, error: 'submission-failed' });

		const result = await submitCampaignAction(createValidFormData());

		expect(result).toEqual({ success: false, error: 'submission-failed', status: 503 });
		expect(mockSubmit).not.toHaveBeenCalled();
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
