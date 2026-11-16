import { loadMessages } from '@/lib/i18n/messages';
import { TIME_ZONE } from '@/lib/i18n/utils';
import { createTranslator } from 'next-intl';
import { buildProgramAboutContent } from './build-program-about-content';
import type { ProgramDetailData } from './load-program-detail-data';

const createCommonTranslator = async () =>
	createTranslator({ locale: 'en', messages: await loadMessages('en'), namespace: 'website-common', timeZone: TIME_ZONE });

const baseProgramDetailData: ProgramDetailData = {
	title: 'Test Program',
	fullSlug: 'programs/test-program',
	description: 'A program description.',
	programDetails: {
		programId: 'program-1',
		programName: 'Test Program',
		countryIsoCode: 'SL',
		ownerOrganizationName: 'Migros',
		localPartners: [{ name: 'Jamil Foundation', slug: 'jamil-foundation' }],
		mobileMoneyProviders: ['Orange Money', 'Africell Money'],
		operatorOrganizationName: 'Social Income SL',
		targetFocuses: [],
		amountOfRecipientsForStart: 100,
		programDurationInMonths: 36,
		payoutPerInterval: 800,
		payoutCurrency: 'SLE',
		payoutInterval: 'monthly',
		recipientsCount: 10,
		totalPayoutsCount: 5,
		totalPayoutsSum: 4000,
		completedSurveysCount: 2,
		startedAt: new Date('2025-11-15T00:00:00.000Z'),
	},
};

describe('buildProgramAboutContent', () => {
	let t: Awaited<ReturnType<typeof createCommonTranslator>>;

	beforeAll(async () => {
		t = await createCommonTranslator();
	});

	test('builds card rows and grouped overlay sections from available data', () => {
		const content = buildProgramAboutContent({
			programDetailData: baseProgramDetailData,
			t,
			lang: 'en',
			currency: 'CHF',
			country: { text: 'Sierra Leone', href: '/en/chf/countries/sierra-leone' },
		});

		expect(content.description).toBe('A program description.');
		expect(content.cardRows).toHaveLength(5);
		expect(content.overlaySections).toHaveLength(3);
		expect(content.overlaySections.map((section) => section.id)).toEqual(['program-design', 'parties', 'delivery']);
		expect(content.overlaySections[1]?.rows).toHaveLength(3);
		expect(content.overlaySections[0]?.rows).toHaveLength(4);
		expect(content.overlaySections[0]?.rows.at(-1)?.values[0]).toMatchObject({
			text: 'Unconditional',
			info: { label: 'What does unconditional mean?' },
		});
		expect(content.overlaySections[2]?.rows[0]?.values).toEqual([
			{ text: 'Sierra Leone', href: '/en/chf/countries/sierra-leone' },
		]);
		expect(content.overlaySections[2]?.rows[1]).toEqual({
			label: 'Mobile money providers',
			values: [{ text: 'Orange Money' }, { text: 'Africell Money' }],
		});
		expect(content.overlaySections[2]?.rows[2]).toEqual({ label: 'Payments made', values: [{ text: '5' }] });
		expect(content.overlaySections[1]?.responsibleCircle).toEqual({
			label: 'Operation Circle',
			href: '/en/chf/circle/operation',
		});
		expect(content.overlaySections[2]?.responsibleCircle).toEqual({
			label: 'Finance Circle',
			href: '/en/chf/circle/finance',
		});
	});

	test('omits overlay sections when related data is unavailable', () => {
		const content = buildProgramAboutContent({
			programDetailData: {
				title: 'Sparse Program',
				fullSlug: 'programs/sparse-program',
				description: 'Only intro text is available.',
			},
			t,
			lang: 'en',
			currency: 'CHF',
		});

		expect(content.cardRows).toHaveLength(0);
		expect(content.overlaySections).toHaveLength(0);
	});

	test('shows only the payments count under delivery when country and providers are unknown', () => {
		const content = buildProgramAboutContent({
			programDetailData: {
				...baseProgramDetailData,
				programDetails: {
					...baseProgramDetailData.programDetails!,
					countryIsoCode: '-',
					mobileMoneyProviders: [],
				},
			},
			t,
			lang: 'en',
			currency: 'CHF',
		});

		expect(content.overlaySections[2]?.rows.map((row) => row.label)).toEqual(['Payments made']);
	});

	test('orders card party rows with local partner before operator', () => {
		const content = buildProgramAboutContent({
			programDetailData: baseProgramDetailData,
			t,
			lang: 'en',
			currency: 'CHF',
			country: { text: 'Sierra Leone', href: '/en/chf/countries/sierra-leone' },
		});

		const cardPartyValues = content.cardRows.slice(0, 3).map((row) => row.values[0]?.text);
		const overlayPartyValues = content.overlaySections[1]?.rows.map((row) => row.values[0]?.text);

		expect(cardPartyValues).toEqual(['Migros', 'Jamil Foundation', 'Social Income SL']);
		expect(overlayPartyValues).toEqual(['Migros', 'Social Income SL', 'Jamil Foundation']);
	});

	test.each([
		[true, 'Concluded'],
		[false, 'Active'],
	])('shows the program status after the start date when concluded is %s', (isConcluded, status) => {
		const content = buildProgramAboutContent({
			programDetailData: {
				...baseProgramDetailData,
				stats: {
					campaignsCount: 1,
					recipientsCount: 10,
					countryIsoCode: 'SL',
					payoutCurrency: 'SLE',
					totalPayoutsSum: 4000,
					totalPayoutsSumChf: 160,
					isConcluded,
				},
			},
			t,
			lang: 'en',
			currency: 'CHF',
		});

		expect(content.cardRows.slice(-2).map((row) => row.label)).toEqual(['Start date', 'Program status']);
		expect(content.cardRows.at(-1)?.values).toEqual([{ text: status }]);
		expect(content.overlaySections[0]?.rows.map((row) => row.label)).toEqual([
			'Duration',
			'Start date',
			'Program status',
			'Payment amount',
			'Conditionality',
		]);
	});

	test('lists every local partner with its own link', () => {
		const content = buildProgramAboutContent({
			programDetailData: {
				...baseProgramDetailData,
				programDetails: {
					...baseProgramDetailData.programDetails!,
					localPartners: [
						{ name: 'Jamil Foundation', slug: 'jamil-foundation' },
						{ name: 'Reachout Salone', slug: 'reachout-salone' },
					],
				},
			},
			t,
			lang: 'en',
			currency: 'CHF',
			country: { text: 'Sierra Leone', href: '/en/chf/countries/sierra-leone' },
		});

		const expectedValues = [
			{ text: 'Jamil Foundation', href: '/en/chf/local-partners/jamil-foundation' },
			{ text: 'Reachout Salone', href: '/en/chf/local-partners/reachout-salone' },
		];
		const localPartnerLabel = 'Local Program Partner';

		expect(content.cardRows.find((row) => row.label === localPartnerLabel)?.values).toEqual(expectedValues);
		expect(content.overlaySections[1]?.rows.find((row) => row.label === localPartnerLabel)?.values).toEqual(expectedValues);
	});

	test('shows payouts to date and future payouts in the finances display currency', () => {
		const content = buildProgramAboutContent({
			programDetailData: baseProgramDetailData,
			t,
			lang: 'en',
			currency: 'EUR',
			financesDisplayAmounts: { currency: 'EUR', paidOutSoFar: 400, totalProgramCosts: 1000, availableCredits: 0 },
		});

		expect(content.overlaySections[2]?.rows.slice(-2)).toEqual([
			{ label: 'Payouts to date', values: [{ text: 'EUR 400' }] },
			{ label: 'Future payouts', values: [{ text: 'EUR 600' }] },
		]);
	});
});
