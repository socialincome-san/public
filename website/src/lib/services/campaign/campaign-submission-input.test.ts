import { campaignSubmissionConfig } from '@/lib/config/campaign-submission.config';
import { addDays, format, startOfDay } from 'date-fns';
import {
	appendCampaignSubmissionFormData,
	createCampaignSubmissionFormSchema,
	endDateFromDurationPreset,
	parseCampaignSubmissionDefaultImageId,
	parseCampaignSubmissionFields,
	toCampaignSubmissionWirePayload,
	validateCampaignSubmissionEndDate,
	validateCampaignSubmissionImageBuffer,
	validateCampaignSubmissionImageMeta,
	type CampaignSubmissionFormValues,
} from './campaign-submission-input';

const validEndDateString = () => format(addDays(startOfDay(new Date()), 30), 'yyyy-MM-dd');

const withAboutFields = (formData: FormData) => {
	formData.set('creatorName', 'Alex Creator');
	formData.set('quote', 'Thank you for your support!');
	formData.set('hasAdditionalInformation', 'false');

	return formData;
};

const validFormValues = (overrides: Partial<CampaignSubmissionFormValues> = {}): CampaignSubmissionFormValues => ({
	title: 'My Campaign',
	description: 'A description',
	hasGoal: true,
	goal: '1000',
	currency: 'CHF',
	durationPreset: '30',
	endDate: validEndDateString(),
	isPublic: true,
	programId: 'program-1',
	creatorName: 'Alex Creator',
	quote: 'Thank you for your support!',
	hasAdditionalInformation: false,
	sectionDescription: '',
	instagramHandle: '',
	xHandle: '',
	linkWebsite: '',
	tiktokHandle: '',
	...overrides,
});

describe('campaign-submission-input', () => {
	test('parseCampaignSubmissionFields validates required fields', () => {
		const formData = withAboutFields(new FormData());
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
			expect(result.data.creatorName).toBe('Alex Creator');
			expect(result.data.quote).toBe('Thank you for your support!');
			expect(result.data.hasAdditionalInformation).toBe(false);
			expect(result.data.sectionDescription).toBeNull();
		}
	});

	test('parseCampaignSubmissionFields accepts empty goal as null', () => {
		const formData = withAboutFields(new FormData());
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
		const formData = withAboutFields(new FormData());
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
		const formData = withAboutFields(new FormData());
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
		const formData = withAboutFields(new FormData());
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
		const formData = withAboutFields(new FormData());
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
		const formData = withAboutFields(new FormData());
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

	test('parseCampaignSubmissionFields requires creator name and quote', () => {
		const formData = new FormData();
		formData.set('title', 'Campaign');
		formData.set('description', 'Description');
		formData.set('goal', '100');
		formData.set('currency', 'CHF');
		formData.set('endDate', validEndDateString());
		formData.set('programId', 'program-1');
		formData.set('creatorName', '');
		formData.set('quote', '');
		formData.set('hasAdditionalInformation', 'false');

		const result = parseCampaignSubmissionFields(formData);
		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error).toBe('creator-name-required');
		}
	});

	test('parseCampaignSubmissionFields keeps additional information only when enabled', () => {
		const formData = withAboutFields(new FormData());
		formData.set('title', 'Campaign');
		formData.set('description', 'Description');
		formData.set('goal', '100');
		formData.set('currency', 'CHF');
		formData.set('endDate', validEndDateString());
		formData.set('programId', 'program-1');
		formData.set('hasAdditionalInformation', 'true');
		formData.set('sectionDescription', '  Extra details  ');
		formData.set('instagramHandle', '@example');
		formData.set('xHandle', '');
		formData.set('linkWebsite', 'https://example.com');
		formData.set('tiktokHandle', 'example.user');

		const result = parseCampaignSubmissionFields(formData);
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.hasAdditionalInformation).toBe(true);
			expect(result.data.sectionDescription).toBe('Extra details');
			expect(result.data.instagramHandle).toBe('example');
			expect(result.data.xHandle).toBeNull();
			expect(result.data.linkWebsite).toBe('https://example.com');
			expect(result.data.tiktokHandle).toBe('example.user');
		}
	});

	test('parseCampaignSubmissionFields rejects full social URLs and unsafe website schemes', () => {
		const base = () => {
			const formData = withAboutFields(new FormData());
			formData.set('title', 'Campaign');
			formData.set('description', 'Description');
			formData.set('goal', '100');
			formData.set('currency', 'CHF');
			formData.set('endDate', validEndDateString());
			formData.set('programId', 'program-1');
			formData.set('hasAdditionalInformation', 'true');

			return formData;
		};

		const withInstagramUrl = base();
		withInstagramUrl.set('instagramHandle', 'https://instagram.com/example');
		const instagramResult = parseCampaignSubmissionFields(withInstagramUrl);
		expect(instagramResult.success).toBe(false);
		if (!instagramResult.success) {
			expect(instagramResult.error).toBe('handle-invalid');
		}

		const withJavascriptWebsite = base();
		withJavascriptWebsite.set('instagramHandle', 'example');
		withJavascriptWebsite.set('linkWebsite', 'javascript:alert(1)');
		const websiteResult = parseCampaignSubmissionFields(withJavascriptWebsite);
		expect(websiteResult.success).toBe(false);
		if (!websiteResult.success) {
			expect(websiteResult.error).toBe('link-unsafe');
		}

		const withUnsafeX = base();
		withUnsafeX.set('xHandle', 'javascript:alert(1)');
		const xResult = parseCampaignSubmissionFields(withUnsafeX);
		expect(xResult.success).toBe(false);
		if (!xResult.success) {
			expect(xResult.error).toBe('handle-invalid');
		}

		const withProtocolRelativeTiktok = base();
		withProtocolRelativeTiktok.set('tiktokHandle', '//evil.com');
		const tiktokResult = parseCampaignSubmissionFields(withProtocolRelativeTiktok);
		expect(tiktokResult.success).toBe(false);
		if (!tiktokResult.success) {
			expect(tiktokResult.error).toBe('handle-invalid');
		}

		const withDataWebsite = base();
		withDataWebsite.set('linkWebsite', 'data:text/html,xss');
		const dataResult = parseCampaignSubmissionFields(withDataWebsite);
		expect(dataResult.success).toBe(false);
		if (!dataResult.success) {
			expect(dataResult.error).toBe('link-unsafe');
		}
	});

	test('createCampaignSubmissionFormSchema rejects social URLs and unsafe website schemes', () => {
		const schema = createCampaignSubmissionFormSchema((code) => code);
		const baseValues = {
			title: 'Campaign',
			description: 'Description',
			hasGoal: false,
			goal: '',
			currency: 'CHF' as const,
			durationPreset: '30' as const,
			endDate: validEndDateString(),
			isPublic: true,
			programId: 'program-1',
			creatorName: 'Alex',
			quote: 'Thanks',
			hasAdditionalInformation: true,
			sectionDescription: '',
			instagramHandle: '',
			xHandle: '',
			linkWebsite: '',
			tiktokHandle: '',
		};

		const urlHandle = schema.safeParse({ ...baseValues, instagramHandle: 'https://instagram.com/foo' });
		expect(urlHandle.success).toBe(false);
		if (!urlHandle.success) {
			expect(urlHandle.error.issues.some((issue) => issue.message === 'handle-invalid')).toBe(true);
		}

		const unsafeWebsite = schema.safeParse({ ...baseValues, linkWebsite: 'javascript:alert(1)' });
		expect(unsafeWebsite.success).toBe(false);
		if (!unsafeWebsite.success) {
			expect(unsafeWebsite.error.issues.some((issue) => issue.message === 'link-unsafe')).toBe(true);
		}

		const valid = schema.safeParse({
			...baseValues,
			instagramHandle: '@valid_user',
			xHandle: 'valid_user',
			tiktokHandle: 'valid.user',
			linkWebsite: 'https://example.com',
		});
		expect(valid.success).toBe(true);
	});

	test('parseCampaignSubmissionFields clears additional information when disabled', () => {
		const formData = withAboutFields(new FormData());
		formData.set('title', 'Campaign');
		formData.set('description', 'Description');
		formData.set('goal', '100');
		formData.set('currency', 'CHF');
		formData.set('endDate', validEndDateString());
		formData.set('programId', 'program-1');
		formData.set('hasAdditionalInformation', 'false');
		formData.set('sectionDescription', 'Should be ignored');
		formData.set('instagramHandle', 'example');

		const result = parseCampaignSubmissionFields(formData);
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.sectionDescription).toBeNull();
			expect(result.data.instagramHandle).toBeNull();
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
			creatorName: 'Alex',
			quote: 'Thanks',
			hasAdditionalInformation: false,
			sectionDescription: '',
			instagramHandle: '',
			xHandle: '',
			linkWebsite: '',
			tiktokHandle: '',
		});

		expect(result.success).toBe(false);
		if (!result.success) {
			const messages = result.error.issues.map((issue) => issue.message);
			expect(messages).toContain('program-required');
			expect(messages).toContain('goal-positive');
		}
	});

	test('createCampaignSubmissionFormSchema requires creator name and quote', () => {
		const schema = createCampaignSubmissionFormSchema((code) => code);
		const result = schema.safeParse({
			title: 'Campaign',
			description: 'Description',
			hasGoal: false,
			goal: '',
			currency: 'CHF',
			durationPreset: '30',
			endDate: validEndDateString(),
			isPublic: true,
			programId: 'program-1',
			creatorName: '',
			quote: '',
			hasAdditionalInformation: false,
		});

		expect(result.success).toBe(false);
		if (!result.success) {
			const messages = result.error.issues.map((issue) => issue.message);
			expect(messages).toContain('creator-name-required');
			expect(messages).toContain('quote-required');
		}
	});

	test('append + parse round-trips client form values through FormData', () => {
		const values = validFormValues({
			hasGoal: true,
			goal: 2500,
			isPublic: false,
			hasAdditionalInformation: true,
			sectionDescription: 'Extra details',
			instagramHandle: '@example',
			xHandle: '',
			linkWebsite: 'https://example.com',
			tiktokHandle: 'example.user',
		});

		const formData = appendCampaignSubmissionFormData(new FormData(), toCampaignSubmissionWirePayload(values), {
			defaultImageId: 42,
		});

		expect(formData.get('public')).toBe('false');
		expect(formData.get('goal')).toBe('2500');
		expect(formData.get('defaultImageId')).toBe('42');
		expect(formData.get('instagramHandle')).toBe('@example');

		const result = parseCampaignSubmissionFields(formData);
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.title).toBe('My Campaign');
			expect(result.data.goal).toBe(2500);
			expect(result.data.public).toBe(false);
			expect(result.data.hasAdditionalInformation).toBe(true);
			expect(result.data.sectionDescription).toBe('Extra details');
			expect(result.data.instagramHandle).toBe('example');
			expect(result.data.xHandle).toBeNull();
			expect(result.data.linkWebsite).toBe('https://example.com');
			expect(result.data.tiktokHandle).toBe('example.user');
		}
	});

	test('toCampaignSubmissionWirePayload clears optional about fields when disabled', () => {
		const payload = toCampaignSubmissionWirePayload(
			validFormValues({
				hasAdditionalInformation: false,
				sectionDescription: 'Should be ignored',
				instagramHandle: 'example',
				hasGoal: false,
				goal: '',
			}),
		);

		expect(payload.goal).toBeNull();
		expect(payload.public).toBe(true);
		expect(payload.hasAdditionalInformation).toBe(false);
		expect(payload.sectionDescription).toBeNull();
		expect(payload.instagramHandle).toBeNull();
	});
});
