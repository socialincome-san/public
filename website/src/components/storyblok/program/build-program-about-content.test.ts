import type { TranslateFunction } from '../../../lib/i18n/translator';
import { buildProgramAboutContent } from './build-program-about-content';
import type { ProgramDetailData } from './load-program-detail-data';

const translator = {
	t: ((key: string) => key) as TranslateFunction,
};

const baseProgramDetailData: ProgramDetailData = {
	title: 'Test Program',
	fullSlug: 'programs/test-program',
	description: 'A program description.',
	programDetails: {
		programId: 'program-1',
		programName: 'Test Program',
		countryIsoCode: 'SL',
		ownerOrganizationName: 'Migros',
		localPartnerName: 'Jamil Foundation',
		localPartnerSlug: 'jamil-foundation',
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
	test('builds card rows and grouped overlay sections from available data', () => {
		const content = buildProgramAboutContent({
			programDetailData: baseProgramDetailData,
			translator,
			lang: 'en',
			region: 'ch',
			countryName: 'Sierra Leone',
		});

		expect(content.description).toBe('A program description.');
		expect(content.cardRows).toHaveLength(5);
		expect(content.overlaySections).toHaveLength(3);
		expect(content.overlaySections.map((section) => section.id)).toEqual(['parties', 'program-design', 'delivery']);
		expect(content.overlaySections[0]?.rows).toHaveLength(3);
		expect(content.overlaySections[1]?.rows).toHaveLength(3);
		expect(content.overlaySections[2]?.rows[0]?.value).toBe('Sierra Leone');
	});

	test('omits overlay sections when related data is unavailable', () => {
		const content = buildProgramAboutContent({
			programDetailData: {
				title: 'Sparse Program',
				fullSlug: 'programs/sparse-program',
				description: 'Only intro text is available.',
			},
			translator,
			lang: 'en',
			region: 'ch',
		});

		expect(content.cardRows).toHaveLength(0);
		expect(content.overlaySections).toHaveLength(0);
	});

	test('omits delivery section when country name is unavailable', () => {
		const content = buildProgramAboutContent({
			programDetailData: {
				...baseProgramDetailData,
				programDetails: {
					...baseProgramDetailData.programDetails!,
					countryIsoCode: '-',
				},
			},
			translator,
			lang: 'en',
			region: 'ch',
		});

		expect(content.overlaySections.map((section) => section.id)).toEqual(['parties', 'program-design']);
	});

	test('orders card party rows with local partner before operator', () => {
		const content = buildProgramAboutContent({
			programDetailData: baseProgramDetailData,
			translator,
			lang: 'en',
			region: 'ch',
			countryName: 'Sierra Leone',
		});

		const cardPartyValues = content.cardRows.slice(0, 3).map((row) => row.value);
		const overlayPartyValues = content.overlaySections[0]?.rows.map((row) => row.value);

		expect(cardPartyValues).toEqual(['Migros', 'Jamil Foundation', 'Social Income SL']);
		expect(overlayPartyValues).toEqual(['Migros', 'Social Income SL', 'Jamil Foundation']);
	});

	test('includes local partner link when slug is available', () => {
		const content = buildProgramAboutContent({
			programDetailData: baseProgramDetailData,
			translator,
			lang: 'en',
			region: 'ch',
			countryName: 'Sierra Leone',
		});

		const localPartnerCardRow = content.cardRows.find((row) => row.value === 'Jamil Foundation');
		const localPartnerOverlayRow = content.overlaySections[0]?.rows.find((row) => row.value === 'Jamil Foundation');

		expect(localPartnerCardRow?.href).toBe('/en/ch/local-partners/jamil-foundation');
		expect(localPartnerOverlayRow?.href).toBe('/en/ch/local-partners/jamil-foundation');
	});
});
