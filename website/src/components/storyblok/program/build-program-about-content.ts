import type { ProgramDetailData } from '@/components/storyblok/program/load-program-detail-data';
import type { PayoutInterval } from '@/generated/prisma/client';
import type { WebsiteLanguage, WebsiteRegion } from '@/lib/i18n/utils';
import { getSafeNumberFormatLocale } from '@/lib/i18n/utils';
import { formatNumberLocale } from '@/lib/utils/string-utils';
import { type useTranslations } from 'next-intl';

export type ProgramAboutDetailRow = {
	label: string;
	value: string;
	href?: string;
};

export type ProgramAboutOverlaySection = {
	id: 'parties' | 'program-design' | 'delivery';
	title: string;
	rows: ProgramAboutDetailRow[];
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
	region: WebsiteRegion;
	countryName?: string;
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
	paymentAmount?: ProgramAboutDetailRow;
};

const OVERLAY_PARTY_ORDER: PartyRole[] = ['owner', 'operator', 'localPartner'];
const CARD_PARTY_ORDER: PartyRole[] = ['owner', 'localPartner', 'operator'];

const partyRowsToOrderedArray = (partyRowsByRole: PartyRowsByRole, order: PartyRole[]): ProgramAboutDetailRow[] =>
	order.flatMap((role) => (partyRowsByRole[role] ? [partyRowsByRole[role]] : []));

const buildPartyRowsByRole = (
	programDetails: NonNullable<ProgramDetailData['programDetails']>,
	localPartnerHref: string | undefined,
	t: ProgramAboutTranslator,
): PartyRowsByRole => {
	const partyRowsByRole: PartyRowsByRole = {};

	if (programDetails.ownerOrganizationName) {
		partyRowsByRole.owner = {
			label: t('program-detail-page.program-owner'),
			value: programDetails.ownerOrganizationName,
		};
	}

	if (programDetails.operatorOrganizationName) {
		partyRowsByRole.operator = {
			label: t('program-detail-page.program-operator'),
			value: programDetails.operatorOrganizationName,
		};
	}

	if (programDetails.localPartnerName) {
		partyRowsByRole.localPartner = {
			label: t('program-detail-page.local-program-partner'),
			value: programDetails.localPartnerName,
			href: localPartnerHref,
		};
	}

	return partyRowsByRole;
};

const buildProgramDesignRows = (
	programDetails: NonNullable<ProgramDetailData['programDetails']>,
	durationMonths: number | undefined,
	lang: WebsiteLanguage,
	locale: string,
	t: ProgramAboutTranslator,
): ProgramDesignRows => {
	const programDesignRows: ProgramDesignRows = {};

	if (durationMonths !== undefined) {
		programDesignRows.duration = {
			label: t('program-detail-page.duration'),
			value: formatDuration(durationMonths, t),
		};
	}

	if (programDetails.startedAt) {
		programDesignRows.startDate = {
			label: t('program-detail-page.start-date'),
			value: formatStartDate(programDetails.startedAt, lang),
		};
	}

	if (programDetails.payoutPerInterval !== undefined && programDetails.payoutCurrency && programDetails.payoutInterval) {
		programDesignRows.paymentAmount = {
			label: t('program-detail-page.payment-amount'),
			value: formatPaymentAmount(
				programDetails.payoutPerInterval,
				programDetails.payoutCurrency,
				programDetails.payoutInterval,
				locale,
				t,
			),
		};
	}

	return programDesignRows;
};

const programDesignRowsToOverlayArray = (programDesignRows: ProgramDesignRows): ProgramAboutDetailRow[] =>
	[programDesignRows.duration, programDesignRows.startDate, programDesignRows.paymentAmount].filter(
		(row): row is ProgramAboutDetailRow => row !== undefined,
	);

const deriveCardRows = (partyRowsByRole: PartyRowsByRole, programDesignRows: ProgramDesignRows): ProgramAboutDetailRow[] => [
	...partyRowsToOrderedArray(partyRowsByRole, CARD_PARTY_ORDER),
	...[programDesignRows.duration, programDesignRows.startDate].filter(
		(row): row is ProgramAboutDetailRow => row !== undefined,
	),
];

export const buildProgramAboutContent = ({
	programDetailData,
	t,
	lang,
	region,
	countryName,
}: BuildProgramAboutContentInput): ProgramAboutContent => {
	const { description, programDetails, dashboardStats } = programDetailData;
	const locale = getSafeNumberFormatLocale(lang);
	const durationMonths = dashboardStats?.programDurationInMonths ?? programDetails?.programDurationInMonths;
	const localPartnerHref = programDetails?.localPartnerSlug
		? `/${lang}/${region}/local-partners/${programDetails.localPartnerSlug}`
		: undefined;

	const overlaySections: ProgramAboutOverlaySection[] = [];
	let cardRows: ProgramAboutDetailRow[] = [];

	if (programDetails) {
		const partyRowsByRole = buildPartyRowsByRole(programDetails, localPartnerHref, t);
		const programDesignRows = buildProgramDesignRows(programDetails, durationMonths, lang, locale, t);

		const partiesRows = partyRowsToOrderedArray(partyRowsByRole, OVERLAY_PARTY_ORDER);
		if (partiesRows.length > 0) {
			overlaySections.push({
				id: 'parties',
				title: t('program-detail-page.parties-involved'),
				rows: partiesRows,
			});
		}

		const programDesignOverlayRows = programDesignRowsToOverlayArray(programDesignRows);
		if (programDesignOverlayRows.length > 0) {
			overlaySections.push({
				id: 'program-design',
				title: t('program-detail-page.program-design'),
				rows: programDesignOverlayRows,
			});
		}

		if (countryName) {
			overlaySections.push({
				id: 'delivery',
				title: t('program-detail-page.delivery'),
				rows: [
					{
						label: t('program-detail-page.country'),
						value: countryName,
					},
				],
			});
		}

		cardRows = deriveCardRows(partyRowsByRole, programDesignRows);
	}

	return {
		description: description?.trim() ?? undefined,
		cardRows,
		overlaySections,
	};
};
