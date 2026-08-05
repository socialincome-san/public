import { addDays, format, startOfDay } from 'date-fns';
import { NextRequest } from 'next/server';

const mockSubmit = jest.fn();
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
		const body = await response.json();

		expect(response.status).toBe(503);
		expect(body).toEqual({ errorCode: 'submission-failed' });
		expect(mockSubmit).toHaveBeenCalledWith(
			expect.objectContaining({ programId: 'program-1' }),
			expect.objectContaining({ mimeType: 'image/png', filename: 'cover.png' }),
		);
	});

	test('passes validated fields and image to submit without assembling portal slugs', async () => {
		mockSubmit.mockResolvedValue({ success: true, data: { slug: 'my-campaign' } });

		const response = await POST(new NextRequest('http://localhost/api/campaign-submissions', { method: 'POST' }));
		const body = await response.json();

		expect(response.status).toBe(201);
		expect(body).toEqual({ slug: 'my-campaign' });
		expect(mockSubmit).toHaveBeenCalledWith(
			expect.objectContaining({ programId: 'program-1' }),
			expect.objectContaining({ mimeType: 'image/png', filename: 'cover.png' }),
		);
	});
});
