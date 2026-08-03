import {
	parseCampaignSubmissionFields,
	validateCampaignSubmissionEndDate,
	validateCampaignSubmissionImageBuffer,
} from './campaign-submission-input';

describe('campaign-submission-input', () => {
	test('parseCampaignSubmissionFields validates required fields', () => {
		const endDate = new Date();
		endDate.setDate(endDate.getDate() + 30);

		const formData = new FormData();
		formData.set('title', '  My Campaign  ');
		formData.set('description', 'A description');
		formData.set('goal', '1000');
		formData.set('currency', 'chf');
		formData.set('endDate', endDate.toISOString().slice(0, 10));
		formData.set('programId', 'program-1');

		const result = parseCampaignSubmissionFields(formData);
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.title).toBe('My Campaign');
			expect(result.data.currency).toBe('CHF');
			expect(result.data.goal).toBe(1000);
		}
	});

	test('parseCampaignSubmissionFields rejects unsupported currency', () => {
		const endDate = new Date();
		endDate.setDate(endDate.getDate() + 30);

		const formData = new FormData();
		formData.set('title', 'Campaign');
		formData.set('description', 'Description');
		formData.set('goal', '100');
		formData.set('currency', 'JPY');
		formData.set('endDate', endDate.toISOString().slice(0, 10));
		formData.set('programId', 'program-1');

		const result = parseCampaignSubmissionFields(formData);
		expect(result.success).toBe(false);
	});

	test('parseCampaignSubmissionFields rejects titles that cannot be slugified', () => {
		const endDate = new Date();
		endDate.setDate(endDate.getDate() + 30);

		const formData = new FormData();
		formData.set('title', '!!! 🎉');
		formData.set('description', 'Description');
		formData.set('goal', '100');
		formData.set('currency', 'CHF');
		formData.set('endDate', endDate.toISOString().slice(0, 10));
		formData.set('programId', 'program-1');

		const result = parseCampaignSubmissionFields(formData);
		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error).toBe('Title must contain letters or numbers.');
		}
	});

	test('validateCampaignSubmissionEndDate enforces minimum duration', () => {
		const tomorrow = new Date();
		tomorrow.setDate(tomorrow.getDate() + 1);

		expect(validateCampaignSubmissionEndDate(tomorrow)).toMatch(/at least/);
	});

	test('validateCampaignSubmissionImageBuffer detects png contents', () => {
		const pngHeader = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00]);
		const result = validateCampaignSubmissionImageBuffer(pngHeader, 'image/png', 'cover.png');

		expect(result.success).toBe(true);
	});
});
