import type { ProgramDetailData } from '@/components/storyblok/program/load-program-detail-data';
import type { PayoutInterval } from '@/generated/prisma/client';
import type { TranslateFunction } from '@/lib/i18n/translator';
import type { WebsiteLanguage, WebsiteRegion } from '@/lib/i18n/utils';
import { getSafeNumberFormatLocale } from '@/lib/i18n/utils';
import { formatNumberLocale } from '@/lib/utils/string-utils';

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

type BuildProgramAboutContentInput = {
	programDetailData: ProgramDetailData;
	translator: { t: TranslateFunction };
	lang: WebsiteLanguage;
	region: WebsiteRegion;
	countryName?: string;
};

const payoutIntervalTranslationKey: Record<PayoutInterval, string> = {
	monthly: 'program-detail-page.payout-interval-monthly',
	quarterly: 'program-detail-page.payout-interval-quarterly',
	yearly: 'program-detail-page.payout-interval-yearly',
};

const formatDuration = (durationMonths: number, translator: { t: TranslateFunction }): string => {
	const monthLabel =
		durationMonths === 1
			? translator.t('program-detail-page.month-singular')
			: translator.t('program-detail-page.month-plural');

	return `${durationMonths} ${monthLabel}`;
};

const formatStartDate = (startedAt: Date, lang: WebsiteLanguage): string =>
	new Intl.DateTimeFormat(lang, { month: 'long', day: 'numeric', year: 'numeric' }).format(startedAt);

const formatPaymentAmount = (
	payoutPerInterval: number,
	payoutCurrency: string,
	payoutInterval: PayoutInterval,
	locale: string,
	translator: { t: TranslateFunction },
): string => {
	const formattedAmount = formatNumberLocale(payoutPerInterval, locale, {
		minimumFractionDigits: 0,
		maximumFractionDigits: 0,
	});
	const intervalLabel = translator.t(payoutIntervalTranslationKey[payoutInterval]);

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
	translator: { t: TranslateFunction },
): PartyRowsByRole => {
	const partyRowsByRole: PartyRowsByRole = {};

	if (programDetails.ownerOrganizationName) {
		partyRowsByRole.owner = {
			label: translator.t('program-detail-page.program-owner'),
			value: programDetails.ownerOrganizationName,
		};
	}

	if (programDetails.operatorOrganizationName) {
		partyRowsByRole.operator = {
			label: translator.t('program-detail-page.program-operator'),
			value: programDetails.operatorOrganizationName,
		};
	}

	if (programDetails.localPartnerName) {
		partyRowsByRole.localPartner = {
			label: translator.t('program-detail-page.local-program-owner'),
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
	translator: { t: TranslateFunction },
): ProgramDesignRows => {
	const programDesignRows: ProgramDesignRows = {};

	if (durationMonths !== undefined) {
		programDesignRows.duration = {
			label: translator.t('program-detail-page.duration'),
			value: formatDuration(durationMonths, translator),
		};
	}

	if (programDetails.startedAt) {
		programDesignRows.startDate = {
			label: translator.t('program-detail-page.start-date'),
			value: formatStartDate(programDetails.startedAt, lang),
		};
	}

	if (programDetails.payoutPerInterval !== undefined && programDetails.payoutCurrency && programDetails.payoutInterval) {
		programDesignRows.paymentAmount = {
			label: translator.t('program-detail-page.payment-amount'),
			value: formatPaymentAmount(
				programDetails.payoutPerInterval,
				programDetails.payoutCurrency,
				programDetails.payoutInterval,
				locale,
				translator,
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
	...[programDesignRows.duration, programDesignRows.startDate].filter((row): row is ProgramAboutDetailRow => row !== undefined),
];

export const buildProgramAboutContent = ({
	programDetailData,
	translator,
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
		const partyRowsByRole = buildPartyRowsByRole(programDetails, localPartnerHref, translator);
		const programDesignRows = buildProgramDesignRows(programDetails, durationMonths, lang, locale, translator);

		const partiesRows = partyRowsToOrderedArray(partyRowsByRole, OVERLAY_PARTY_ORDER);
		if (partiesRows.length > 0) {
			overlaySections.push({
				id: 'parties',
				title: translator.t('program-detail-page.parties-involved'),
				rows: partiesRows,
			});
		}

		const programDesignOverlayRows = programDesignRowsToOverlayArray(programDesignRows);
		if (programDesignOverlayRows.length > 0) {
			overlaySections.push({
				id: 'program-design',
				title: translator.t('program-detail-page.program-design'),
				rows: programDesignOverlayRows,
			});
		}

		if (countryName) {
			overlaySections.push({
				id: 'delivery',
				title: translator.t('program-detail-page.delivery'),
				rows: [
					{
						label: translator.t('program-detail-page.country'),
						value: countryName,
					},
				],
			});
		}

		cardRows = deriveCardRows(partyRowsByRole, programDesignRows);
	}

	return {
		description: description?.trim() || undefined,
		cardRows,
		overlaySections,
	};
};
