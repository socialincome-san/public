/** @jest-environment jsdom */

import { Breadcrumb } from '@/components/breadcrumb/breadcrumb';
import { Community } from '@/components/community/community';
import { resolveProgramCountry, type ResolvedProgramCountry } from '@/components/storyblok/country/resolve-country-name';
import type { ProgramDetailData } from '@/components/storyblok/program/load-program-detail-data';
import { ProgramAbout } from '@/components/storyblok/program/program-about';
import { ProgramCountry } from '@/components/storyblok/program/program-country';
import { ProgramFinances } from '@/components/storyblok/program/program-finances';
import { ProgramPayoutsTotal } from '@/components/storyblok/program/program-payouts-total';
import { ProgramRecipients } from '@/components/storyblok/program/program-recipients';
import { ProgramSurveys } from '@/components/storyblok/program/program-surveys';
import { Currency, PayoutInterval } from '@/generated/prisma/enums';
import type { CommunityPanelData } from '@/modules/community/community.types';
import { resolveProgramFinancesDisplayAmountsAction } from '@/modules/programs/program.actions';
import type {
	ProgramDashboardStats,
	ProgramFinancesDisplayAmounts,
	PublicProgramDetails,
} from '@/modules/programs/program.types';
import { act, type ComponentProps } from 'react';
import { createRoot } from 'react-dom/client';
import { ProgramDetail } from './program-detail';

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

jest.mock('next-intl/server', () => ({
	getTranslations: jest.fn().mockResolvedValue((key: string) => key),
}));

jest.mock('@/components/breadcrumb/build-breadcrumb-links', () => ({
	buildBreadcrumbLinks: jest.fn().mockResolvedValue([]),
}));

jest.mock('@/components/breadcrumb/breadcrumb', () => ({
	Breadcrumb: ({ aside }: ComponentProps<typeof Breadcrumb>) => <nav data-testid="breadcrumb">{aside}</nav>,
}));

jest.mock('@/components/storyblok/country/resolve-country-name', () => ({
	resolveProgramCountry: jest.fn(),
}));

jest.mock('@/modules/programs/program.actions', () => ({
	resolveProgramFinancesDisplayAmountsAction: jest.fn(),
}));

jest.mock('@/components/storyblok/shared/hero-header', () => ({
	HeroHeader: () => <div />,
}));

jest.mock('@/components/donation-wizard/donation-form', () => ({
	DonationForm: () => <div />,
}));

jest.mock('@/components/campaign/campaign-journal-teaser', () => ({
	CampaignJournalTeaser: () => <div />,
}));

jest.mock('@/components/community/community', () => ({
	Community: jest.fn(() => <div data-testid="community" />),
}));

jest.mock('@/components/content-blocks/faq-selection-content', () => ({
	FaqSelectionContent: () => <div />,
}));

jest.mock('@/components/storyblok/program/program-about', () => ({
	ProgramAbout: jest.fn(() => <div />),
}));

jest.mock('@/components/storyblok/program/program-country', () => ({
	ProgramCountry: jest.fn(() => <div data-testid="program-country" />),
}));

jest.mock('@/components/storyblok/program/program-detail-related-grid', () => ({
	ProgramDetailRelatedGrid: () => <div />,
}));

jest.mock('@/components/storyblok/program/program-finances', () => ({
	ProgramFinances: jest.fn(() => <div data-testid="program-finances" />),
}));

jest.mock('@/components/storyblok/program/program-payouts-total', () => ({
	ProgramPayoutsTotal: jest.fn(() => <div data-testid="program-payouts-total" />),
}));

jest.mock('@/components/storyblok/program/program-recipients', () => ({
	ProgramRecipients: jest.fn(() => <div data-testid="program-recipients" />),
}));

jest.mock('@/components/storyblok/program/program-surveys', () => ({
	ProgramSurveys: jest.fn(() => <div data-testid="program-surveys" />),
}));

const programDetailData: ProgramDetailData = {
	title: 'Sierra Leone Program',
	fullSlug: 'programs/sierra-leone',
	programId: 'program-1',
};

const programDetails: PublicProgramDetails = {
	programId: 'program-1',
	programName: 'Sierra Leone Program',
	countryIsoCode: 'SL',
	ownerOrganizationName: null,
	localPartners: [],
	mobileMoneyProviders: [],
	operatorOrganizationName: null,
	targetFocuses: [],
	amountOfRecipientsForStart: null,
	programDurationInMonths: 36,
	payoutPerInterval: 20,
	payoutCurrency: Currency.SLE,
	payoutInterval: PayoutInterval.monthly,
	recipientsCount: 12,
	totalPayoutsCount: 0,
	totalPayoutsSum: 0,
	completedSurveysCount: 0,
	startedAt: null,
};

const dashboardStats: ProgramDashboardStats = {
	contributedToProgramSoFarChf: 1000,
	contributedViaStripeChf: 1000,
	contributedViaWireTransferChf: 0,
	contributedViaOthersChf: 0,
	totalProgramCostsChf: 2000,
	contributionsCount: 10,
	contributorsCount: 10,
	averageContributionChf: 100,
	fundingProgressPercent: 50,
	paidOutSoFarChf: 200,
	paidOutSoFarProgramCurrency: 4000,
	totalPayoutsCount: 10,
	payoutsDoneCount: 10,
	remainingPayoutsCount: 90,
	remainingIntervalsCount: 30,
	payoutPerInterval: 20,
	payoutInterval: PayoutInterval.monthly,
	payoutCurrency: Currency.SLE,
	costPerIntervalChf: 100,
	costPerIntervalProgramCurrency: 2000,
	payoutProgressPercent: 10,
	totalProgramCostsProgramCurrency: 40000,
	availableCreditsChf: 800,
	availableCreditsProgramCurrency: 16000,
	availableCreditsInIntervals: 8,
	totalExpectedIntervals: 36,
	completedSurveysCount: 0,
	totalSurveysCount: 10,
	surveyCompletionPercent: 0,
	futureRecipientsCount: 0,
	activeRecipientsCount: 24,
	suspendedRecipientsCount: 0,
	completedRecipientsCount: 0,
	programDurationInMonths: 36,
	recipientsCount: 24,
};

const financesDisplayAmounts: ProgramFinancesDisplayAmounts = {
	currency: Currency.CHF,
	paidOutSoFar: 200,
	totalProgramCosts: 2000,
	availableCredits: 800,
};

const resolvedCountry: ResolvedProgramCountry = {
	isoCode: 'SL',
	name: 'Sierra Leone',
	href: '/en/chf/countries/sierra-leone',
};

const community: CommunityPanelData = {
	volunteerCount: 12,
	countryCount: 3,
	roleCount: 2,
	headline: 'Our community',
	tickerItems: [],
	maintainers: [],
	worlds: [],
	roles: [],
	waysIn: [],
	articles: [],
};

const renderProgramDetail = async (programDetailData: ProgramDetailData) => {
	const element = await ProgramDetail({
		programDetailData,
		lang: 'en',
		currency: 'CHF',
		community,
	});
	const container = document.createElement('div');
	const root = createRoot(container);

	act(() => root.render(element));

	return { container, root };
};

describe('ProgramDetail', () => {
	beforeEach(() => {
		jest.clearAllMocks();
		jest.mocked(resolveProgramCountry).mockResolvedValue(resolvedCountry);
		jest.mocked(resolveProgramFinancesDisplayAmountsAction).mockResolvedValue({
			success: true,
			data: financesDisplayAmounts,
		});
	});

	test.each<{
		name: string;
		data: ProgramDetailData;
		completedSurveysCount: number;
		recipientsCount: number;
	}>([
		{
			name: 'hides surveys and uses one column when the details count is zero',
			data: { ...programDetailData, programDetails },
			completedSurveysCount: 0,
			recipientsCount: 12,
		},
		{
			name: 'shows surveys in two columns when the details count is positive',
			data: { ...programDetailData, programDetails: { ...programDetails, completedSurveysCount: 3 } },
			completedSurveysCount: 3,
			recipientsCount: 12,
		},
		{
			name: 'hides surveys and uses one column when dashboard and details are absent',
			data: programDetailData,
			completedSurveysCount: 0,
			recipientsCount: 0,
		},
		{
			name: 'hides surveys when dashboard zero overrides positive details',
			data: {
				...programDetailData,
				programDetails: { ...programDetails, completedSurveysCount: 3 },
				dashboardStats,
			},
			completedSurveysCount: 0,
			recipientsCount: 24,
		},
		{
			name: 'shows surveys when a positive dashboard count overrides zero details',
			data: { ...programDetailData, programDetails, dashboardStats: { ...dashboardStats, completedSurveysCount: 3 } },
			completedSurveysCount: 3,
			recipientsCount: 24,
		},
	])('$name', async ({ data, completedSurveysCount, recipientsCount }) => {
		const { container, root } = await renderProgramDetail(data);

		try {
			const recipients = container.querySelector('[data-testid="program-recipients"]');
			expect(recipients).not.toBeNull();
			expect(ProgramRecipients).toHaveBeenCalledWith(
				{ count: recipientsCount, programId: 'program-1', lang: 'en' },
				undefined,
			);

			if (data.dashboardStats) {
				expect(resolveProgramCountry).toHaveBeenCalledWith('SL', 'en', 'CHF');
				expect(container.querySelector('[data-testid="program-country"]')).not.toBeNull();
				expect(ProgramCountry).toHaveBeenCalledWith({ resolvedCountry }, undefined);
				expect(resolveProgramFinancesDisplayAmountsAction).toHaveBeenCalledWith(data.dashboardStats, 'CHF');
				expect(container.querySelector('[data-testid="program-finances"]')).not.toBeNull();
				expect(ProgramFinances).toHaveBeenCalledWith(
					{ displayAmounts: financesDisplayAmounts, programId: 'program-1', lang: 'en', currency: 'CHF' },
					undefined,
				);
				expect(ProgramAbout).toHaveBeenCalledWith(
					{ programDetailData: data, lang: 'en', currency: 'CHF', resolvedCountry, financesDisplayAmounts },
					undefined,
				);
				expect(container.querySelector('[data-testid="program-payouts-total"]')).not.toBeNull();
				expect(ProgramPayoutsTotal).toHaveBeenCalledWith(
					{ programDetailData: data, lang: 'en', currency: 'CHF' },
					undefined,
				);
				expect(container.querySelector('[data-testid="breadcrumb"] [data-testid="community"]')).not.toBeNull();
				expect(Community).toHaveBeenCalledWith({ data: community }, undefined);
			}

			if (completedSurveysCount > 0) {
				expect(container.querySelector('[data-testid="program-surveys"]')).not.toBeNull();
				expect(ProgramSurveys).toHaveBeenCalledWith(
					{ completedCount: completedSurveysCount, lang: 'en', currency: 'CHF', programId: 'program-1' },
					undefined,
				);
			} else {
				expect(container.querySelector('[data-testid="program-surveys"]')).toBeNull();
				expect(ProgramSurveys).not.toHaveBeenCalled();
			}
			expect(recipients?.parentElement?.classList.contains('sm:grid-cols-2')).toBe(completedSurveysCount > 0);
		} finally {
			act(() => root.unmount());
		}
	});
});
