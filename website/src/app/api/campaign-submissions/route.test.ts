import { addDays, format, startOfDay } from 'date-fns';
import { NextRequest } from 'next/server';

import type {
	CampaignSubmissionFields,
	CampaignSubmissionImageSource,
	CampaignSubmissionOptionalImages,
} from '@/lib/services/campaign/campaign-submission-input';
import type { CampaignSubmissionResult } from '@/lib/services/campaign/campaign-submission.service';
import type { ServiceResult } from '@/lib/services/core/base.types';

const mockSubmit = jest.fn() as jest.MockedFunction<
	(
		fields: CampaignSubmissionFields,
		imageSource: CampaignSubmissionImageSource,
		optionalImages?: CampaignSubmissionOptionalImages,
	) => Promise<ServiceResult<CampaignSubmissionResult>>
>;
const mockParseMultipartFormDataWithLimit = jest.fn();

jest.mock('@/lib/services/services', () => ({
	services: {
		campaignSubmission: {
			submit: mockSubmit,
		},
	},
}));

jest.mock('@/lib/utils/request-body', () => ({
	RequestBodyTooLargeError: class RequestBodyTooLargeError extends Error {
		constructor() {
			super('Request body exceeds the maximum allowed size.');
			this.name = 'RequestBodyTooLargeError';
		}
	},
	parseMultipartFormDataWithLimit: mockParseMultipartFormDataWithLimit,
}));

import { POST } from './route';

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

describe('POST /api/campaign-submissions', () => {
	beforeEach(() => {
		jest.clearAllMocks();
		mockParseMultipartFormDataWithLimit.mockResolvedValue(createValidFormData());
	});

	test('returns submission-failed with service status when eligibility orchestration fails', async () => {
		mockSubmit.mockResolvedValue({
			success: false,
			error: 'submission-failed',
			status: 503,
		});

		const response = await POST(new NextRequest('http://localhost/api/campaign-submissions', { method: 'POST' }));
		const body: unknown = await response.json();

		expect(response.status).toBe(503);
		expect(body).toEqual({ errorCode: 'submission-failed' });
		expect(mockSubmit).toHaveBeenCalledWith(
			expect.objectContaining({ programId: 'program-1', public: true, creatorName: 'Alex Creator' }),
			expect.objectContaining({ kind: 'upload' }),
			expect.objectContaining({ profilePicture: null, sectionImage: null }),
		);
		expect(mockSubmit.mock.calls[0]?.[1]).toMatchObject({
			kind: 'upload',
			image: { mimeType: 'image/png', filename: 'cover.png' },
		});
	});

	test('passes validated fields and image to submit without assembling portal slugs', async () => {
		mockSubmit.mockResolvedValue({ success: true, data: { slug: 'my-campaign' } });

		const response = await POST(new NextRequest('http://localhost/api/campaign-submissions', { method: 'POST' }));
		const body: unknown = await response.json();

		expect(response.status).toBe(201);
		expect(body).toEqual({ slug: 'my-campaign' });
		expect(mockSubmit).toHaveBeenCalledWith(
			expect.objectContaining({ programId: 'program-1' }),
			expect.objectContaining({ kind: 'upload' }),
			expect.objectContaining({ profilePicture: null, sectionImage: null }),
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
		mockParseMultipartFormDataWithLimit.mockResolvedValue(formData);
		mockSubmit.mockResolvedValue({ success: true, data: { slug: 'my-campaign' } });

		const response = await POST(new NextRequest('http://localhost/api/campaign-submissions', { method: 'POST' }));

		expect(response.status).toBe(201);
		expect(mockSubmit).toHaveBeenCalledWith(
			expect.objectContaining({ goal: null, public: false }),
			{
				kind: 'default',
				defaultImageId: 99,
			},
			expect.objectContaining({ profilePicture: null, sectionImage: null }),
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
		mockParseMultipartFormDataWithLimit.mockResolvedValue(formData);
		mockSubmit.mockResolvedValue({ success: true, data: { slug: 'my-campaign' } });

		const response = await POST(new NextRequest('http://localhost/api/campaign-submissions', { method: 'POST' }));

		expect(response.status).toBe(201);
		expect(mockSubmit).toHaveBeenCalledWith(
			expect.objectContaining({ hasAdditionalInformation: true, sectionDescription: 'Extra' }),
			expect.objectContaining({ kind: 'upload' }),
			expect.anything(),
		);
		expect(mockSubmit.mock.calls[0]?.[2]).toMatchObject({
			profilePicture: { filename: 'profile.png' },
			sectionImage: { filename: 'section.png' },
		});
	});

	test('rejects both primaryImage and defaultImageId', async () => {
		const formData = createValidFormData();
		formData.set('defaultImageId', '99');
		mockParseMultipartFormDataWithLimit.mockResolvedValue(formData);

		const response = await POST(new NextRequest('http://localhost/api/campaign-submissions', { method: 'POST' }));
		const body: unknown = await response.json();

		expect(response.status).toBe(400);
		expect(body).toEqual({ errorCode: 'invalid-submission' });
		expect(mockSubmit).not.toHaveBeenCalled();
	});
});
