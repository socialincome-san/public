import type { DonationFlow, DonationGlobeStats } from '@/components/donation-globe/types';
import { CountryCode } from '@/generated/prisma/enums';
import { getCountryCoordinate } from '@/lib/countries/country-coordinates';
import { prisma } from '@/lib/database/prisma';
import { WebsiteLanguage } from '@/lib/i18n/utils';
import { getCountryNameByCode } from '@/lib/types/country';
import { getDonationGlobePeriod } from '@/lib/donations/donation-globe-period';
import { formatCurrencyLocale } from '@/lib/utils/string-utils';

const MAX_CONTRIBUTIONS = 500;
// Later: aggregate by day/fromCountry/toCountry/currency when volume grows.

type DonationFlowsResult = {
	flows: DonationFlow[];
	stats: DonationGlobeStats;
};

const localeForLang = (lang: WebsiteLanguage): string => (lang === 'de' ? 'de-CH' : 'en-US');

const buildFlowLabel = (fromCountryName: string, amount: number, currency: string, lang: WebsiteLanguage): string => {
	const formattedAmount = formatCurrencyLocale(amount, currency, localeForLang(lang));

	return `${fromCountryName}<br/>${formattedAmount}`;
};

const mapContributionToFlow = (
	contribution: {
		id: string;
		amount: { toNumber(): number } | number;
		currency: string;
		amountChf: { toNumber(): number } | number;
		createdAt: Date;
		contributor: {
			contact: {
				address: { country: CountryCode | null } | null;
			} | null;
		};
		campaign: {
			program: {
				country: { isoCode: CountryCode };
			};
		};
	},
	lang: WebsiteLanguage,
): DonationFlow | null => {
	const fromCountryCode = contribution.contributor.contact?.address?.country;
	const toCountryCode = contribution.campaign.program.country.isoCode;

	// Skip when start or destination country is missing — no fallback to CH.
	if (!fromCountryCode || !toCountryCode) {
		return null;
	}

	if (fromCountryCode === toCountryCode) {
		return null;
	}

	const fromCoord = getCountryCoordinate(fromCountryCode);
	const toCoord = getCountryCoordinate(toCountryCode);

	// Skip when coordinates are not in the central map.
	if (!fromCoord || !toCoord) {
		return null;
	}

	const fromCountryName = getCountryNameByCode(fromCountryCode) ?? fromCoord.name;
	const toCountryName = getCountryNameByCode(toCountryCode) ?? toCoord.name;
	const amount = Number(contribution.amount);
	const amountChf = Number(contribution.amountChf);

	return {
		id: contribution.id,
		amount,
		amountChf,
		currency: contribution.currency,
		createdAt: contribution.createdAt.toISOString(),
		fromCountryCode,
		fromCountryName,
		fromLat: fromCoord.lat,
		fromLng: fromCoord.lng,
		toCountryCode,
		toCountryName,
		toLat: toCoord.lat,
		toLng: toCoord.lng,
		label: buildFlowLabel(fromCountryName, amount, contribution.currency, lang),
	};
};

export const getDonationFlows = async (lang: WebsiteLanguage = 'en'): Promise<DonationFlowsResult> => {
	const { periodStart, periodEnd } = getDonationGlobePeriod();

	const contributions = await prisma.contribution.findMany({
		where: {
			status: 'succeeded',
			createdAt: { gte: periodStart },
		},
		orderBy: { createdAt: 'asc' },
		take: MAX_CONTRIBUTIONS,
		select: {
			id: true,
			amount: true,
			currency: true,
			amountChf: true,
			createdAt: true,
			contributor: {
				select: {
					contact: {
						select: {
							address: { select: { country: true } },
						},
					},
				},
			},
			campaign: {
				select: {
					program: {
						select: {
							country: { select: { isoCode: true } },
						},
					},
				},
			},
		},
	});

	const flows = contributions
		.map((contribution) => mapContributionToFlow(contribution, lang))
		.filter((flow): flow is DonationFlow => flow !== null);

	const totalAmountChf = flows.reduce((sum, flow) => sum + flow.amountChf, 0);

	return {
		flows,
		stats: {
			count: flows.length,
			totalAmountChf,
			periodStart: periodStart.toISOString(),
			periodEnd: periodEnd.toISOString(),
		},
	};
};
