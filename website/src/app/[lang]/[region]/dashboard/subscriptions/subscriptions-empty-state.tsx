import { Button } from '@/components/button/button';
import { type WebsiteLanguage, type WebsiteRegion } from '@/lib/i18n/utils';
import { type ContributorContributionSummary } from '@/lib/services/contribution/contribution.types';
import { formatCurrencyLocale, wholeCurrencyFormatOptions } from '@/lib/utils/string-utils';
import Link from 'next/link';

type Props = {
	lang: WebsiteLanguage;
	region: WebsiteRegion;
	contributionSummary: ContributorContributionSummary;
	labels: {
		noActiveSubscriptions: string;
		emptyDescription: string;
		emptyDescriptionNoContributions: string;
		donateNow: string;
	};
};

export const SubscriptionsEmptyState = ({ lang, region, contributionSummary, labels }: Props) => {
	const hasContributions = contributionSummary.count > 0;
	const description = hasContributions
		? labels.emptyDescription
				.replace(
					'{{amount}}',
					formatCurrencyLocale(contributionSummary.totalAmountChf, 'CHF', lang, wholeCurrencyFormatOptions),
				)
				.replace('{{count}}', String(contributionSummary.count))
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
