import { addDays, format, startOfDay } from 'date-fns';
import { NextRequest } from 'next/server';

const mockGetPrograms = jest.fn();
const mockSubmit = jest.fn();
const mockParseMultipartFormDataWithLimit = jest.fn();

jest.mock('@/lib/services/services', () => ({
	services: {
		storyblok: {
			getPrograms: mockGetPrograms,
		},
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

	test('returns submission-failed with 503 when Storyblok program listing fails', async () => {
		mockGetPrograms.mockResolvedValue({
			success: false,
			error: 'Failed to fetch programs: {"message":"down"}',
			status: 503,
		});

		const response = await POST(new NextRequest('http://localhost/api/campaign-submissions', { method: 'POST' }));
		const body = await response.json();

		expect(response.status).toBe(503);
		expect(body).toEqual({ errorCode: 'submission-failed' });
		expect(mockSubmit).not.toHaveBeenCalled();
	});

	test('passes published portal slugs through to submit when Storyblok succeeds', async () => {
		mockGetPrograms.mockResolvedValue({
			success: true,
			data: [
				{ content: { portalSlug: ' si-core-sl ' } },
				{ content: { portalSlug: 'si-core-sl' } },
				{ content: { portalSlug: '' } },
			],
		});
		mockSubmit.mockResolvedValue({ success: true, data: { slug: 'my-campaign' } });

		const response = await POST(new NextRequest('http://localhost/api/campaign-submissions', { method: 'POST' }));
		const body = await response.json();

		expect(response.status).toBe(201);
		expect(body).toEqual({ slug: 'my-campaign' });
		expect(mockSubmit).toHaveBeenCalledWith(
			expect.objectContaining({ programId: 'program-1' }),
			expect.objectContaining({ mimeType: 'image/png', filename: 'cover.png' }),
			['si-core-sl'],
		);
	});
});
