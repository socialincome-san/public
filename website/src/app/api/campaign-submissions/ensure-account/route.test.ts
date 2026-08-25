import { NextRequest } from 'next/server';

const mockGetOrCreateFromEmailAndName = jest.fn();

jest.mock('@/lib/services/services', () => ({
	services: {
		write: {
			contributor: {
				getOrCreateFromEmailAndName: mockGetOrCreateFromEmailAndName,
			},
		},
	},
}));

import { POST } from './route';

describe('POST /api/campaign-submissions/ensure-account', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	test('returns 400 for invalid JSON', async () => {
		const response = await POST(
			new NextRequest('http://localhost/api/campaign-submissions/ensure-account', {
				method: 'POST',
				body: 'not-json',
				headers: { 'Content-Type': 'application/json' },
			}),
		);
		const body: unknown = await response.json();

		expect(response.status).toBe(400);
		expect(body).toEqual({ errorCode: 'invalid-submission' });
		expect(mockGetOrCreateFromEmailAndName).not.toHaveBeenCalled();
	});

	test('returns 400 for invalid personal fields', async () => {
		const response = await POST(
			new NextRequest('http://localhost/api/campaign-submissions/ensure-account', {
				method: 'POST',
				body: JSON.stringify({ email: 'not-an-email', firstName: '', lastName: 'Lovelace' }),
				headers: { 'Content-Type': 'application/json' },
			}),
		);
		const body: unknown = await response.json();

		expect(response.status).toBe(400);
		expect(body).toEqual(
			expect.objectContaining({
				errorCode: expect.stringMatching(/^(email-invalid|first-name-required)$/),
			}),
		);
		expect(mockGetOrCreateFromEmailAndName).not.toHaveBeenCalled();
	});

	test('returns 200 when get-or-create succeeds', async () => {
		mockGetOrCreateFromEmailAndName.mockResolvedValue({
			success: true,
			data: { contributor: { id: 'contributor-1' }, isNewContributor: true },
		});

		const response = await POST(
			new NextRequest('http://localhost/api/campaign-submissions/ensure-account', {
				method: 'POST',
				body: JSON.stringify({ email: 'ada@example.com', firstName: 'Ada', lastName: 'Lovelace' }),
				headers: { 'Content-Type': 'application/json' },
			}),
		);
		const body: unknown = await response.json();

		expect(response.status).toBe(200);
		expect(body).toEqual({ ok: true });
		expect(mockGetOrCreateFromEmailAndName).toHaveBeenCalledWith({
			email: 'ada@example.com',
			firstName: 'Ada',
			lastName: 'Lovelace',
		});
	});

	test('returns 503 when get-or-create fails', async () => {
		mockGetOrCreateFromEmailAndName.mockResolvedValue({
			success: false,
			error: 'database-down',
		});

		const response = await POST(
			new NextRequest('http://localhost/api/campaign-submissions/ensure-account', {
				method: 'POST',
				body: JSON.stringify({ email: 'ada@example.com', firstName: 'Ada', lastName: 'Lovelace' }),
				headers: { 'Content-Type': 'application/json' },
			}),
		);
		const body: unknown = await response.json();

		expect(response.status).toBe(503);
		expect(body).toEqual({ errorCode: 'submission-failed' });
	});
});
