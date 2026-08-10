import { campaignSubmissionConfig } from '@/lib/config/campaign-submission.config';
import { addDays, format, startOfDay } from 'date-fns';
import {
	createCampaignSubmissionFormSchema,
	endDateFromDurationPreset,
	parseCampaignSubmissionDefaultImageId,
	parseCampaignSubmissionFields,
	validateCampaignSubmissionEndDate,
	validateCampaignSubmissionImageBuffer,
	validateCampaignSubmissionImageMeta,
} from './campaign-submission-input';

const validEndDateString = () => format(addDays(startOfDay(new Date()), 30), 'yyyy-MM-dd');

describe('campaign-submission-input', () => {
	test('parseCampaignSubmissionFields validates required fields', () => {
		const formData = new FormData();
		formData.set('title', '  My Campaign  ');
		formData.set('description', 'A description');
		formData.set('goal', '1000');
		formData.set('currency', 'chf');
		formData.set('endDate', validEndDateString());
		formData.set('programId', 'program-1');
		formData.set('public', 'true');

		const result = parseCampaignSubmissionFields(formData);
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.title).toBe('My Campaign');
			expect(result.data.currency).toBe('CHF');
			expect(result.data.goal).toBe(1000);
			expect(result.data.public).toBe(true);
		}
	});

	test('parseCampaignSubmissionFields accepts empty goal as null', () => {
		const formData = new FormData();
		formData.set('title', 'Campaign');
		formData.set('description', 'Description');
		formData.set('goal', '');
		formData.set('currency', 'CHF');
		formData.set('endDate', validEndDateString());
		formData.set('programId', 'program-1');
		formData.set('public', 'false');

		const result = parseCampaignSubmissionFields(formData);
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.goal).toBeNull();
			expect(result.data.public).toBe(false);
		}
	});

	test('parseCampaignSubmissionFields rejects unsupported currency', () => {
		const formData = new FormData();
		formData.set('title', 'Campaign');
		formData.set('description', 'Description');
		formData.set('goal', '100');
		formData.set('currency', 'JPY');
		formData.set('endDate', validEndDateString());
		formData.set('programId', 'program-1');

		const result = parseCampaignSubmissionFields(formData);
		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error).toBe('currency-unsupported');
		}
	});

	test('parseCampaignSubmissionFields treats non-true public strings as false', () => {
		const formData = new FormData();
		formData.set('title', 'Campaign');
		formData.set('description', 'Description');
		formData.set('goal', '100');
		formData.set('currency', 'CHF');
		formData.set('endDate', validEndDateString());
		formData.set('programId', 'program-1');
		formData.set('public', 'private');

		const result = parseCampaignSubmissionFields(formData);
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.public).toBe(false);
		}
	});

	test('parseCampaignSubmissionFields rejects titles that cannot be slugified', () => {
		const formData = new FormData();
		formData.set('title', '!!! 🎉');
		formData.set('description', 'Description');
		formData.set('goal', '100');
		formData.set('currency', 'CHF');
		formData.set('endDate', validEndDateString());
		formData.set('programId', 'program-1');

		const result = parseCampaignSubmissionFields(formData);
		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error).toBe('title-not-slugifiable');
		}
	});

	test('parseCampaignSubmissionFields rejects end dates outside the configured window', () => {
		const formData = new FormData();
		formData.set('title', 'Campaign');
		formData.set('description', 'Description');
		formData.set('goal', '100');
		formData.set('currency', 'CHF');
		formData.set('endDate', format(addDays(startOfDay(new Date()), 1), 'yyyy-MM-dd'));
		formData.set('programId', 'program-1');

		const result = parseCampaignSubmissionFields(formData);
		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error).toBe('end-date-too-soon');
		}
	});

	test('validateCampaignSubmissionEndDate enforces minimum duration', () => {
		const tomorrow = startOfDay(addDays(new Date(), 1));

		expect(validateCampaignSubmissionEndDate(tomorrow)).toBe('end-date-too-soon');
	});

	test('validateCampaignSubmissionEndDate accepts min and max calendar bounds', () => {
		const today = startOfDay(new Date());
		const minEndDate = addDays(today, 7);
		const maxEndDate = addDays(today, 365);

		expect(validateCampaignSubmissionEndDate(minEndDate)).toBeNull();
		expect(validateCampaignSubmissionEndDate(maxEndDate)).toBeNull();
	});

	test('validateCampaignSubmissionImageMeta enforces size and mime type', () => {
		expect(validateCampaignSubmissionImageMeta(campaignSubmissionConfig.maxImageBytes + 1, 'image/png')).toBe(
			'image-too-large',
		);
		expect(validateCampaignSubmissionImageMeta(100, 'image/gif')).toBe('image-format-unsupported');
		expect(validateCampaignSubmissionImageMeta(100, 'image/png')).toBeNull();
	});

	test('validateCampaignSubmissionImageBuffer detects png contents', () => {
		const pngHeader = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00]);
		const result = validateCampaignSubmissionImageBuffer(pngHeader, 'image/png', 'cover.png');

		expect(result.success).toBe(true);
	});

	test('parseCampaignSubmissionFields rejects a blank programId', () => {
		const formData = new FormData();
		formData.set('title', 'Campaign');
		formData.set('description', 'Description');
		formData.set('goal', '100');
		formData.set('currency', 'CHF');
		formData.set('endDate', validEndDateString());
		formData.set('programId', '   ');

		const result = parseCampaignSubmissionFields(formData);
		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error).toBe('program-required');
		}
	});

	test('parseCampaignSubmissionDefaultImageId validates positive integers', () => {
		expect(parseCampaignSubmissionDefaultImageId('42').success).toBe(true);
		expect(parseCampaignSubmissionDefaultImageId('abc').success).toBe(false);
		expect(parseCampaignSubmissionDefaultImageId(null).success).toBe(false);
	});

	test('endDateFromDurationPreset returns a date within campaign bounds', () => {
		const endDate = endDateFromDurationPreset('30');
		const parsed = startOfDay(new Date(endDate));
		expect(validateCampaignSubmissionEndDate(parsed)).toBeNull();
	});

	test('createCampaignSubmissionFormSchema requires a non-blank programId and goal when enabled', () => {
		const schema = createCampaignSubmissionFormSchema((code) => code);
		const result = schema.safeParse({
			title: 'Campaign',
			description: 'Description',
			hasGoal: true,
			goal: '',
			currency: 'CHF',
			durationPreset: '30',
			endDate: validEndDateString(),
			isPublic: true,
			programId: '   ',
		});

		expect(result.success).toBe(false);
		if (!result.success) {
			const messages = result.error.issues.map((issue) => issue.message);
			expect(messages).toContain('program-required');
			expect(messages).toContain('goal-positive');
		}
	});
});
