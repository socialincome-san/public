import { Button } from '@/components/button';
import DataTable from '@/components/data-table/data-table';
import Link from 'next/link';

import { makeYourStripeSubscriptionsColumns } from '@/components/data-table/columns/your-stripe-subscriptions';
import { getAuthenticatedContributorOrRedirect } from '@/lib/firebase/current-contributor';
import { StripeService } from '@socialincome/shared/src/database/services/stripe/stripe.service';
import { StripeSubscriptionRow } from '@socialincome/shared/src/database/services/stripe/stripe.types';

export async function SubscriptionsTable() {
	const contributor = await getAuthenticatedContributorOrRedirect();

	const stripeService = new StripeService();

	const subscriptionsResult = await stripeService.getSubscriptionsTableView(contributor.stripeCustomerId);

	const rows: StripeSubscriptionRow[] = subscriptionsResult.success ? subscriptionsResult.data.rows : [];

	const billingPortal = await stripeService.createManageSubscriptionsSession(contributor.stripeCustomerId);

	const billingPortalUrl = billingPortal.success ? billingPortal.data : null;

	return (
		<DataTable
			title="Your Subscriptions"
			error={subscriptionsResult.success ? null : subscriptionsResult.error}
			emptyMessage="No subscriptions found"
			data={rows}
			makeColumns={makeYourStripeSubscriptionsColumns}
			actions={
				<div className="flex gap-4">
					<Link href="/donate/individual">
						<Button>Start a Subscription</Button>
					</Link>

					{billingPortalUrl && (
						<Link href={billingPortalUrl}>
							<Button variant="outline">Manage Subscriptions</Button>
						</Link>
					)}
				</div>
			}
		/>
	);
}
