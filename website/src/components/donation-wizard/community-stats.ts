import type { ContributorCommunityStats } from '@/lib/services/contributor/contributor.types';
import type { LanguageCode } from '@/lib/types/language';
import { formatNumberLocale } from '@/lib/utils/string-utils';

const localeForLanguage = (language: LanguageCode): string => (language === 'de' ? 'de-CH' : language);

const formatCommunityCount = (value: number, language: LanguageCode): string =>
	formatNumberLocale(value, localeForLanguage(language));

type Translate = (key: string, context?: Record<string, unknown>) => string;

export const getSupportersImpactLabel = (
	t: Translate,
	language: LanguageCode,
	stats: ContributorCommunityStats | null,
): string | null => {
	if (!stats || stats.supporterCount <= 0) {
		return null;
	}

	const supporterCount = formatCommunityCount(stats.supporterCount, language);

	if (stats.countryCount > 0) {
		return t('impact.supporters', {
			supporterCount,
			countryCount: formatCommunityCount(stats.countryCount, language),
		});
	}

	return t('impact.supporters-no-countries', { supporterCount });
};

export const getCommunityBenefit = (t: Translate, language: LanguageCode, stats: ContributorCommunityStats | null) => {
	if (!stats || stats.supporterCount <= 0) {
		return null;
	}

	return {
		id: 'community' as const,
		label: t('step2.benefit-community', {
			count: formatCommunityCount(stats.supporterCount, language),
		}),
		icon: 'heart' as const,
		emphasis: true,
	};
};
