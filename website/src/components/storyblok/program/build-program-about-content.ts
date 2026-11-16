import type { ProgramDetailData } from '@/components/storyblok/program/load-program-detail-data';
import type { PayoutInterval } from '@/generated/prisma/client';
import type { WebsiteCurrency, WebsiteLanguage } from '@/lib/i18n/utils';
import { getSafeNumberFormatLocale, getWebsiteBasePath } from '@/lib/i18n/utils';
import { createWebsiteCirclePath } from '@/lib/storyblok/storyblok-utils';
import { formatCompactNumberLocale, formatNumberLocale } from '@/lib/utils/string-utils';
import type { ProgramFinancesDisplayAmounts } from '@/modules/programs/program.types';
import { type useTranslations } from 'next-intl';

export type ProgramAboutDetailValue = {
	text: string;
	href?: string;
	info?: { label: string; text: string };
};

export type ProgramAboutDetailRow = {
	label: string;
	values: ProgramAboutDetailValue[];
};

export type ProgramAboutOverlaySection = {
	id: 'parties' | 'program-design' | 'delivery';
	title: string;
	rows: ProgramAboutDetailRow[];
	responsibleCircle?: { label: string; href: string };
};

export type ProgramAboutContent = {
	description?: string;
	cardRows: ProgramAboutDetailRow[];
	overlaySections: ProgramAboutOverlaySection[];
};

type ProgramAboutTranslator = ReturnType<typeof useTranslations<'website-common'>>;

type BuildProgramAboutContentInput = {
	programDetailData: ProgramDetailData;
	t: ProgramAboutTranslator;
	lang: WebsiteLanguage;
	currency: WebsiteCurrency;
	country?: ProgramAboutDetailValue;
	financesDisplayAmounts?: ProgramFinancesDisplayAmounts;
};

const formatDuration = (durationMonths: number, t: ProgramAboutTranslator): string => {
	const monthLabel = durationMonths === 1 ? t('program-detail-page.month-singular') : t('program-detail-page.month-plural');

	return `${durationMonths} ${monthLabel}`;
};

const formatStartDate = (startedAt: Date, lang: WebsiteLanguage): string =>
	new Intl.DateTimeFormat(lang, { month: 'long', day: 'numeric', year: 'numeric' }).format(startedAt);

const formatPaymentAmount = (
	payoutPerInterval: number,
	payoutCurrency: string,
	payoutInterval: PayoutInterval,
	locale: string,
	t: ProgramAboutTranslator,
): string => {
	const formattedAmount = formatNumberLocale(payoutPerInterval, locale, {
		minimumFractionDigits: 0,
		maximumFractionDigits: 0,
	});
	const intervalLabel = t(`program-detail-page.payout-interval-${payoutInterval}`);

	return `${payoutCurrency} ${formattedAmount} (${intervalLabel})`;
};

type PartyRole = 'owner' | 'operator' | 'localPartner';
type PartyRowsByRole = Partial<Record<PartyRole, ProgramAboutDetailRow>>;
type ProgramDesignRows = {
	duration?: ProgramAboutDetailRow;
	startDate?: ProgramAboutDetailRow;
	status?: ProgramAboutDetailRow;
	paymentAmount?: ProgramAboutDetailRow;
};

const OVERLAY_PARTY_ORDER: PartyRole[] = ['owner', 'operator', 'localPartner'];
const CARD_PARTY_ORDER: PartyRole[] = ['owner', 'localPartner', 'operator'];

const partyRowsToOrderedArray = (partyRowsByRole: PartyRowsByRole, order: PartyRole[]): ProgramAboutDetailRow[] =>
	order.flatMap((role) => (partyRowsByRole[role] ? [partyRowsByRole[role]] : []));

const buildPartyRowsByRole = (
	programDetails: NonNullable<ProgramDetailData['programDetails']>,
	localPartnersBasePath: string,
	t: ProgramAboutTranslator,
): PartyRowsByRole => {
	const partyRowsByRole: PartyRowsByRole = {};

	if (programDetails.ownerOrganizationName) {
		partyRowsByRole.owner = {
			label: t('program-detail-page.program-owner'),
			values: [{ text: programDetails.ownerOrganizationName }],
		};
	}

	if (programDetails.operatorOrganizationName) {
		partyRowsByRole.operator = {
			label: t('program-detail-page.program-operator'),
			values: [{ text: programDetails.operatorOrganizationName }],
		};
	}

	if (programDetails.localPartners.length > 0) {
		partyRowsByRole.localPartner = {
			label: t('program-detail-page.local-program-partner'),
			values: programDetails.localPartners.map(({ name, slug }) => ({
				text: name,
				href: `${localPartnersBasePath}/${slug}`,
			})),
		};
	}

	return partyRowsByRole;
};

const buildProgramDesignRows = (
	programDetails: NonNullable<ProgramDetailData['programDetails']>,
	durationMonths: number | undefined,
	isConcluded: boolean | undefined,
	lang: WebsiteLanguage,
	locale: string,
	t: ProgramAboutTranslator,
): ProgramDesignRows => {
	const programDesignRows: ProgramDesignRows = {};

	if (durationMonths !== undefined) {
		programDesignRows.duration = {
			label: t('program-detail-page.duration'),
			values: [{ text: formatDuration(durationMonths, t) }],
		};
	}

	if (programDetails.startedAt) {
		programDesignRows.startDate = {
			label: t('program-detail-page.start-date'),
			values: [{ text: formatStartDate(programDetails.startedAt, lang) }],
		};
	}

	if (isConcluded !== undefined) {
		programDesignRows.status = {
			label: t('program-detail-page.program-status'),
			values: [{ text: isConcluded ? t('status-filter.concluded') : t('status-filter.active') }],
		};
	}

	if (programDetails.payoutPerInterval !== undefined && programDetails.payoutCurrency && programDetails.payoutInterval) {
		programDesignRows.paymentAmount = {
			label: t('program-detail-page.payment-amount'),
			values: [
				{
					text: formatPaymentAmount(
						programDetails.payoutPerInterval,
						programDetails.payoutCurrency,
						programDetails.payoutInterval,
						locale,
						t,
					),
				},
			],
		};
	}

	return programDesignRows;
};

const programDesignRowsToOverlayArray = (programDesignRows: ProgramDesignRows): ProgramAboutDetailRow[] =>
	[
		programDesignRows.duration,
		programDesignRows.startDate,
		programDesignRows.status,
		programDesignRows.paymentAmount,
	].filter((row): row is ProgramAboutDetailRow => row !== undefined);

const deriveCardRows = (partyRowsByRole: PartyRowsByRole, programDesignRows: ProgramDesignRows): ProgramAboutDetailRow[] => [
	...partyRowsToOrderedArray(partyRowsByRole, CARD_PARTY_ORDER),
	...[programDesignRows.duration, programDesignRows.startDate, programDesignRows.status].filter(
		(row): row is ProgramAboutDetailRow => row !== undefined,
	),
];

export const buildProgramAboutContent = ({
	programDetailData,
	t,
	lang,
	currency,
	country,
	financesDisplayAmounts,
}: BuildProgramAboutContentInput): ProgramAboutContent => {
	const { description, programDetails, dashboardStats, stats } = programDetailData;
	const locale = getSafeNumberFormatLocale(lang);
	const durationMonths = dashboardStats?.programDurationInMonths ?? programDetails?.programDurationInMonths;
	const localPartnersBasePath = `${getWebsiteBasePath(lang, currency)}/local-partners`;

	const overlaySections: ProgramAboutOverlaySection[] = [];
	let cardRows: ProgramAboutDetailRow[] = [];

	if (programDetails) {
		const partyRowsByRole = buildPartyRowsByRole(programDetails, localPartnersBasePath, t);
		const programDesignRows = buildProgramDesignRows(programDetails, durationMonths, stats?.isConcluded, lang, locale, t);

		overlaySections.push({
			id: 'program-design',
			title: t('program-detail-page.program-design'),
			rows: [
				...programDesignRowsToOverlayArray(programDesignRows),
				{
					label: t('program-detail-page.conditionality'),
					values: [
						{
							text: t('program-detail-page.conditionality-unconditional'),
							info: {
								label: t('program-detail-page.conditionality-info-label'),
								text: t('program-detail-page.conditionality-info'),
							},
						},
					],
				},
			],
		});

		const partiesRows = partyRowsToOrderedArray(partyRowsByRole, OVERLAY_PARTY_ORDER);
		if (partiesRows.length > 0) {
			overlaySections.push({
				id: 'parties',
				title: t('program-detail-page.parties-involved'),
				rows: partiesRows,
				responsibleCircle: {
					label: t('program-detail-page.operation-circle'),
					href: createWebsiteCirclePath('operation', lang, currency),
				},
			});
		}

		const deliveryRows: ProgramAboutDetailRow[] = [];
		if (country) {
			deliveryRows.push({ label: t('program-detail-page.country'), values: [country] });
		}
		if (programDetails.mobileMoneyProviders.length > 0) {
			deliveryRows.push({
				label: t('program-detail-page.mobile-money-providers'),
				values: programDetails.mobileMoneyProviders.map((name) => ({ text: name })),
			});
		}
		deliveryRows.push({
			label: t('program-detail-page.payments-made'),
			values: [{ text: formatNumberLocale(programDetails.totalPayoutsCount, locale) }],
		});
		if (financesDisplayAmounts) {
			// Same amounts and compact format as the finances card, so both panels show identical figures.
			const { currency: amountCurrency, paidOutSoFar, totalProgramCosts } = financesDisplayAmounts;
			deliveryRows.push(
				{
					label: t('program-detail-page.payouts-to-date'),
					values: [{ text: `${amountCurrency} ${formatCompactNumberLocale(paidOutSoFar, locale)}` }],
				},
				{
					label: t('program-detail-page.future-payouts'),
					values: [
						{
							text: `${amountCurrency} ${formatCompactNumberLocale(Math.max(0, totalProgramCosts - paidOutSoFar), locale)}`,
						},
					],
				},
			);
		}
		overlaySections.push({
			id: 'delivery',
			title: t('program-detail-page.delivery'),
			rows: deliveryRows,
			responsibleCircle: {
				label: t('program-detail-page.finance-circle'),
				href: createWebsiteCirclePath('finance', lang, currency),
			},
		});

		cardRows = deriveCardRows(partyRowsByRole, programDesignRows);
	}

	return {
		description: description?.trim() ?? undefined,
		cardRows,
		overlaySections,
	};
};
