import { resultOk } from '@/lib/result';
import { resolveChfAmountsAction } from '@/modules/currency-display/currency-display.actions';
import { getTransparencySummaryAction } from '@/modules/transparency/transparency.actions';
import type { TransparencySummaryData } from '@/modules/transparency/transparency.types';
import { getPaidOutFigure } from './public-figures';

jest.mock('@/modules/countries/country.actions', () => ({ getPublicCountryStatsByIsoCodesAction: jest.fn() }));
jest.mock('@/modules/currency-display/currency-display.actions', () => ({ resolveChfAmountsAction: jest.fn() }));
jest.mock('@/modules/storyblok-content/storyblok-content.actions', () => ({ getCountriesAction: jest.fn() }));
jest.mock('@/modules/transparency/transparency.actions', () => ({ getTransparencySummaryAction: jest.fn() }));

const summary = (outflowsChf: number): TransparencySummaryData => ({
	financialSummary: {
		inflowsChf: 0,
		inflowsBySourceChf: { individual: 0, foundation_grant: 0, corporate_partner: 0 },
		outflowsChf,
		reservesChf: 0,
	},
	reserveAccounts: [],
});

beforeEach(() => jest.clearAllMocks());

test('formats the payouts in the display currency', async () => {
	jest.mocked(getTransparencySummaryAction).mockResolvedValue(resultOk(summary(1_234_567)));
	jest.mocked(resolveChfAmountsAction).mockResolvedValue(resultOk([{ amount: 1_234_567, currency: 'CHF' }]));

	// Intl puts a non-breaking space between the currency and the amount
	expect(await getPaidOutFigure('en', 'CHF')).toMatch(/^CHF\s1\.2M$/);
});

test('leaves the figure out before anything is paid out', async () => {
	jest.mocked(getTransparencySummaryAction).mockResolvedValue(resultOk(summary(0)));

	expect(await getPaidOutFigure('en', 'CHF')).toBeUndefined();
	expect(resolveChfAmountsAction).not.toHaveBeenCalled();
});
