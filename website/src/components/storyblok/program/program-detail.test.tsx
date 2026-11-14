/** @jest-environment jsdom */

import { Currency, PayoutInterval } from '@/generated/prisma/enums';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { ProgramDetail } from './program-detail';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

jest.mock('next-intl/server', () => ({
	getTranslations: jest.fn().mockResolvedValue((key: string) => key),
}));

jest.mock('@/components/breadcrumb/build-breadcrumb-links', () => ({
	buildBreadcrumbLinks: jest.fn().mockResolvedValue([]),
}));

jest.mock('@/components/storyblok/country/resolve-country-name', () => ({
	resolveProgramCountry: jest.fn().mockResolvedValue(null),
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
	Community: () => <div />,
}));

jest.mock('@/components/content-blocks/faq-selection-content', () => ({
	FaqSelectionContent: () => <div />,
}));

jest.mock('@/components/storyblok/program/program-about', () => ({
	ProgramAbout: () => <div />,
}));

jest.mock('@/components/storyblok/program/program-country', () => ({
	ProgramCountry: () => <div />,
}));

jest.mock('@/components/storyblok/program/program-detail-related-grid', () => ({
	ProgramDetailRelatedGrid: () => <div />,
}));

jest.mock('@/components/storyblok/program/program-finances', () => ({
	ProgramFinances: () => <div />,
}));

jest.mock('@/components/storyblok/program/program-payouts-total', () => ({
	ProgramPayoutsTotal: () => <div />,
}));

jest.mock('@/components/storyblok/program/program-recipients', () => ({
	ProgramRecipients: () => <div data-testid="program-recipients" />,
}));

jest.mock('@/components/storyblok/program/program-surveys', () => ({
	ProgramSurveys: () => <div data-testid="program-surveys" />,
}));

const renderProgramDetail = async (completedSurveysCount: number) => {
	const container = document.createElement('div');
	const root = createRoot(container);

	const element = await ProgramDetail({
		programDetailData: {
			title: 'Sierra Leone Program',
			fullSlug: 'programs/sierra-leone',
			programId: 'program-1',
			programDetails: {
				programId: 'program-1',
				programName: 'Sierra Leone Program',
				countryIsoCode: '-',
				ownerOrganizationName: null,
				localPartnerName: null,
				localPartnerSlug: null,
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
				completedSurveysCount,
				startedAt: null,
			},
		},
		lang: 'en',
		currency: 'CHF',
		community: null,
	});

	act(() => root.render(element));

	return { container, root };
};

describe('ProgramDetail', () => {
	test('hides the surveys tile and lets the recipients tile span the row when no survey is completed', async () => {
		const { container, root } = await renderProgramDetail(0);

		expect(container.querySelector('[data-testid="program-surveys"]')).toBeNull();
		const recipients = container.querySelector('[data-testid="program-recipients"]');
		expect(recipients).not.toBeNull();
		expect(recipients?.parentElement?.classList.contains('sm:grid-cols-2')).toBe(false);

		act(() => root.unmount());
	});

	test('shows the surveys tile next to the recipients tile when surveys are completed', async () => {
		const { container, root } = await renderProgramDetail(3);

		expect(container.querySelector('[data-testid="program-surveys"]')).not.toBeNull();
		const recipients = container.querySelector('[data-testid="program-recipients"]');
		expect(recipients?.parentElement?.classList.contains('sm:grid-cols-2')).toBe(true);

		act(() => root.unmount());
	});
});
