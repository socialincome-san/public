import { Button } from '@/components/button';
import { makeYourStripeSubscriptionsColumns } from '@/components/data-table/columns/your-stripe-subscriptions';
import DataTable from '@/components/data-table/data-table';
import { getAuthenticatedContributorOrRedirect } from '@/lib/firebase/current-contributor';
import { Translator } from '@/lib/i18n/translator';
import { WebsiteLanguage } from '@/lib/i18n/utils';
import { services } from '@/lib/services/services';
import { StripeSubscriptionRow } from '@/lib/services/stripe/stripe.types';
import Link from 'next/link';

export const SubscriptionsTable = async ({ lang }: { lang: WebsiteLanguage }) => {
	const contributor = await getAuthenticatedContributorOrRedirect();

	const translator = await Translator.getInstance({ language: lang as WebsiteLanguage, namespaces: ['website-me'] });

	const subscriptionsResult = await services.stripe.getSubscriptionsTableView(contributor.stripeCustomerId);

	const rows: StripeSubscriptionRow[] = subscriptionsResult.success ? subscriptionsResult.data.rows : [];

	const billingPortal = await services.stripe.createManageSubscriptionsSession(
		contributor.stripeCustomerId,
		contributor.language,
	);

	const billingPortalUrl = billingPortal.success ? billingPortal.data : null;

	return (
		<DataTable
			title={translator.t('sections.contributions.subscriptions')}
			error={subscriptionsResult.success ? null : subscriptionsResult.error}
			emptyMessage={translator.t('subscriptions.no-subscriptions')}
			data={rows}
			makeColumns={makeYourStripeSubscriptionsColumns}
			lang={lang}
			actions={
				<div className="flex flex-wrap gap-4">
					<Link href="/donate/individual">
						<Button>{translator.t('subscriptions.new-subscription')}</Button>
					</Link>

					{billingPortalUrl && (
						<Link href={billingPortalUrl}>
							<Button variant="outline">{translator.t('subscriptions.manage-subscriptions')}</Button>
						</Link>
					)}
				</div>
			}
		/>
	);
};
