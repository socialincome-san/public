import { getWebsiteBasePath, type WebsiteCurrency, type WebsiteLanguage } from '@/lib/i18n/utils';
import { getDashboardView } from '@/modules/subscriptions/subscription.service';
import { requireSession } from '@/server/session';
import { Button } from '@socialincome/design-system/actions/button/button';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { ActiveSubscriptionsList } from './active-subscriptions-list';
import { SubscriptionSummaryCards } from './subscription-summary-cards';
import { SubscriptionsEmptyState } from './subscriptions-empty-state';
import { UpcomingPaymentsList } from './upcoming-payments-list';

type Props = {
	lang: WebsiteLanguage;
	currency: WebsiteCurrency;
};

export const SubscriptionsView = async ({ lang, currency }: Props) => {
	const contributor = await requireSession('contributor');
	const t = await getTranslations('website-me');

	const dashboardResult = await getDashboardView(contributor.id);
	if (!dashboardResult.success) {
		return (
			<div className="border-destructive/30 text-destructive rounded-xl border p-6 text-sm" role="alert">
				<p>{t('subscriptions.load-error')}</p>
				<div className="pt-4">
					<Button asChild variant="outline">
						<a href={`${getWebsiteBasePath(lang, currency)}/dashboard/subscriptions`}>{t('subscriptions.retry')}</a>
					</Button>
				</div>
			</div>
		);
	}

	const { activeSubscriptions, upcomingPayments, monthlyContribution, contributionSummary } = dashboardResult.data;

	const labels = {
		title: t('sections.contributions.subscriptions'),
		donateNow: t('donate-now'),
		monthlyContribution: t('subscriptions.summary.monthly-contribution'),
		totalContributions: t('subscriptions.summary.total-contributions'),
		noActiveSubscriptions: t('subscriptions.summary.no-active-subscriptions'),
		noContributionsYet: t('subscriptions.summary.no-contributions-yet'),
		activeSubscriptions: t('subscriptions.active-subscriptions'),
		perMonth: t('subscriptions.per-month'),
		since: t('subscriptions.since'),
		wireTransfer: t('contributions.sources.wire-transfer'),
		cardFallback: t('subscriptions.card-fallback'),
		edit: t('subscriptions.edit'),
		viewQr: t('subscriptions.view-qr'),
		qrDialogTitle: t('subscriptions.qr-dialog.title'),
		qrUnavailable: t('subscriptions.qr-dialog.unavailable'),
		close: t('subscriptions.qr-dialog.close'),
		upcomingPayments: t('subscriptions.upcoming-payments'),
		scheduled: t('subscriptions.scheduled'),
		emptyDescriptionNoContributions: t('subscriptions.empty.description-no-contributions'),
	};

	return (
		<div className="flex flex-col gap-6" data-testid="subscriptions-dashboard">
			<div className="flex items-center justify-between gap-6">
				<h2 className="text-3xl font-medium">{labels.title}</h2>
				<Button asChild>
					<Link href={getWebsiteBasePath(lang, currency)}>{labels.donateNow}</Link>
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
					{upcomingPayments.length > 0 && <UpcomingPaymentsList lang={lang} payments={upcomingPayments} labels={labels} />}
				</>
			) : (
				<div className="pt-6">
					<SubscriptionsEmptyState
						lang={lang}
						currency={currency}
						contributionSummary={contributionSummary}
						labels={labels}
					/>
				</div>
			)}
		</div>
	);
};
