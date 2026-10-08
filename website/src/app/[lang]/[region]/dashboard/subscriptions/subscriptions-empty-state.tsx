import { type WebsiteLanguage, type WebsiteRegion } from '@/lib/i18n/utils';
import { formatCurrencyLocale, wholeCurrencyFormatOptions } from '@/lib/utils/string-utils';
import { type ContributorContributionSummary } from '@/modules/contributions/contribution.types';
import { Button } from '@socialincome/design-system/actions/button/button';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';

type Props = {
	lang: WebsiteLanguage;
	region: WebsiteRegion;
	contributionSummary: ContributorContributionSummary;
	labels: {
		noActiveSubscriptions: string;
		emptyDescriptionNoContributions: string;
		donateNow: string;
	};
};

export const SubscriptionsEmptyState = async ({ lang, region, contributionSummary, labels }: Props) => {
	const t = await getTranslations('website-me');
	const hasContributions = contributionSummary.count > 0;
	const description = hasContributions
		? t('subscriptions.empty.description', {
				amount: formatCurrencyLocale(contributionSummary.totalAmountChf, 'CHF', lang, wholeCurrencyFormatOptions),
				count: contributionSummary.count,
			})
		: labels.emptyDescriptionNoContributions;

	return (
		<div className="border-border flex flex-col items-center gap-6 rounded-xl border px-6 py-8 text-center shadow-md">
			<h2 className="text-2xl font-medium">{labels.noActiveSubscriptions}</h2>
			<p className="max-w-xl text-base whitespace-pre-line">{description}</p>
			<Button asChild>
				<Link href={`/${lang}/${region}`}>{labels.donateNow}</Link>
			</Button>
		</div>
	);
};
