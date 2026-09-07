import { type WebsiteLanguage } from '@/lib/i18n/utils';
import { type ContributorContributionSummary } from '@/lib/services/contribution/contribution.types';
import { type MonthlyContributionSummary } from '@/lib/services/subscription/subscription.types';
import {
	formatCurrencyLocale,
	formatDateLocale,
	fractionalCurrencyFormatOptions,
	wholeCurrencyFormatOptions,
} from '@/lib/utils/string-utils';

type Props = {
	lang: WebsiteLanguage;
	monthlyContribution: MonthlyContributionSummary;
	contributionSummary: ContributorContributionSummary;
	labels: {
		monthlyContribution: string;
		totalContributions: string;
		noActiveSubscriptions: string;
		activeSubscriptionsCount: string;
		contributionsSince: string;
		noContributionsYet: string;
	};
};

const formatMonthlyAmount = (monthlyContribution: MonthlyContributionSummary, lang: WebsiteLanguage): string | null => {
	if (monthlyContribution.activeCount === 0 || monthlyContribution.totalAmount === null || !monthlyContribution.currency) {
		return null;
	}

	return formatCurrencyLocale(
		monthlyContribution.totalAmount,
		monthlyContribution.currency,
		lang,
		fractionalCurrencyFormatOptions,
	);
};

export const SubscriptionSummaryCards = ({ lang, monthlyContribution, contributionSummary, labels }: Props) => {
	const monthlyAmount = formatMonthlyAmount(monthlyContribution, lang);
	const monthlySubtitle =
		monthlyContribution.activeCount === 0
			? labels.noActiveSubscriptions
			: labels.activeSubscriptionsCount.replace('{{count}}', String(monthlyContribution.activeCount));

	const totalAmount = formatCurrencyLocale(contributionSummary.totalAmountChf, 'CHF', lang, wholeCurrencyFormatOptions);

	const totalSubtitle =
		contributionSummary.count === 0 || !contributionSummary.firstContributionAt
			? labels.noContributionsYet
			: labels.contributionsSince
					.replace('{{count}}', String(contributionSummary.count))
					.replace('{{date}}', formatDateLocale(contributionSummary.firstContributionAt, lang));

	return (
		<div className="grid gap-4 md:grid-cols-2">
			<div className="border-border bg-muted flex flex-col gap-4 rounded-xl border p-6">
				<p className="text-base font-medium">{labels.monthlyContribution}</p>
				<p className="text-5xl font-medium">{monthlyAmount ?? '—'}</p>
				<p className="text-sm">{monthlySubtitle}</p>
			</div>
			<div className="border-border bg-muted flex flex-col gap-4 rounded-xl border p-6">
				<p className="text-base font-medium">{labels.totalContributions}</p>
				<p className="text-5xl font-medium">{totalAmount}</p>
				<p className="text-sm">{totalSubtitle}</p>
			</div>
		</div>
	);
};
