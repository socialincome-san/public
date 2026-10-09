import { type WebsiteLanguage } from '@/lib/i18n/utils';
import {
	formatCurrencyLocale,
	formatDateLocale,
	fractionalCurrencyFormatOptions,
	wholeCurrencyFormatOptions,
} from '@/lib/utils/string-utils';
import { type ContributorContributionSummary } from '@/modules/contributions/contribution.types';
import { type MonthlyContributionSummary } from '@/modules/subscriptions/subscription.types';
import { getTranslations } from 'next-intl/server';

type Props = {
	lang: WebsiteLanguage;
	monthlyContribution: MonthlyContributionSummary;
	contributionSummary: ContributorContributionSummary;
	labels: {
		monthlyContribution: string;
		totalContributions: string;
		noActiveSubscriptions: string;
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

export const SubscriptionSummaryCards = async ({ lang, monthlyContribution, contributionSummary, labels }: Props) => {
	const t = await getTranslations('website-me');
	const monthlyAmount = formatMonthlyAmount(monthlyContribution, lang);
	const monthlySubtitle =
		monthlyContribution.activeCount === 0
			? labels.noActiveSubscriptions
			: t('subscriptions.summary.active-subscriptions-count', { count: monthlyContribution.activeCount });

	const totalAmount = formatCurrencyLocale(contributionSummary.totalAmountChf, 'CHF', lang, wholeCurrencyFormatOptions);

	const totalSubtitle =
		contributionSummary.count === 0 || !contributionSummary.firstContributionAt
			? labels.noContributionsYet
			: t('subscriptions.summary.contributions-since', {
					count: contributionSummary.count,
					date: formatDateLocale(contributionSummary.firstContributionAt, lang),
				});

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
