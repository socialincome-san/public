import { Button } from '@/components/button/button';
import { getAuthenticatedContributorOrRedirect } from '@/lib/firebase/current-contributor';
import { Translator } from '@/lib/i18n/translator';
import { type WebsiteLanguage, type WebsiteRegion } from '@/lib/i18n/utils';
import { services } from '@/lib/services/services';
import Link from 'next/link';
import { ActiveSubscriptionsList } from './active-subscriptions-list';
import { SubscriptionSummaryCards } from './subscription-summary-cards';
import { SubscriptionsEmptyState } from './subscriptions-empty-state';
import { UpcomingPaymentsList } from './upcoming-payments-list';

type Props = {
	lang: WebsiteLanguage;
	region: WebsiteRegion;
};

export const SubscriptionsView = async ({ lang, region }: Props) => {
	const contributor = await getAuthenticatedContributorOrRedirect();
	const translator = await Translator.getInstance({ language: lang, namespaces: ['website-me'] });

	const dashboardResult = await services.read.subscription.getDashboardView(contributor.id);
	if (!dashboardResult.success) {
		return (
			<div className="border-destructive/30 text-destructive rounded-xl border p-6 text-sm" role="alert">
				{dashboardResult.error}
			</div>
		);
	}

	const { activeSubscriptions, upcomingPayments, monthlyContribution, contributionSummary } = dashboardResult.data;

	const labels = {
		title: translator.t('sections.contributions.subscriptions'),
		donateNow: translator.t('donate-now'),
		monthlyContribution: translator.t('subscriptions.summary.monthly-contribution'),
		totalContributions: translator.t('subscriptions.summary.total-contributions'),
		noActiveSubscriptions: translator.t('subscriptions.summary.no-active-subscriptions'),
		activeSubscriptionsCount: translator.t('subscriptions.summary.active-subscriptions-count'),
		contributionsSince: translator.t('subscriptions.summary.contributions-since'),
		noContributionsYet: translator.t('subscriptions.summary.no-contributions-yet'),
		activeSubscriptions: translator.t('subscriptions.active-subscriptions'),
		perMonth: translator.t('subscriptions.per-month'),
		since: translator.t('subscriptions.since'),
		wireTransfer: translator.t('contributions.sources.wire-transfer'),
		cardFallback: translator.t('subscriptions.card-fallback'),
		upcomingPayments: translator.t('subscriptions.upcoming-payments'),
		scheduled: translator.t('subscriptions.scheduled'),
		emptyDescription: translator.t('subscriptions.empty.description'),
		emptyDescriptionNoContributions: translator.t('subscriptions.empty.description-no-contributions'),
	};

	return (
		<div className="flex flex-col gap-6" data-testid="subscriptions-dashboard">
			<div className="flex items-center justify-between gap-6">
				<h2 className="text-3xl font-medium">{labels.title}</h2>
				<Button asChild>
					<Link href={`/${lang}/${region}`}>{labels.donateNow}</Link>
				</Button>
			</div>

			<SubscriptionSummaryCards
				lang={lang}
				monthlyContribution={monthlyContribution}
				contributionSummary={contributionSummary}
				labels={labels}
			/>

			{activeSubscriptions.length > 0 ? (
				<>
					<ActiveSubscriptionsList lang={lang} subscriptions={activeSubscriptions} labels={labels} />
					{upcomingPayments.length > 0 && (
						<UpcomingPaymentsList lang={lang} payments={upcomingPayments} labels={labels} />
					)}
				</>
			) : (
				<div className="pt-6">
					<SubscriptionsEmptyState
						lang={lang}
						region={region}
						contributionSummary={contributionSummary}
						labels={labels}
					/>
				</div>
			)}
		</div>
	);
};
