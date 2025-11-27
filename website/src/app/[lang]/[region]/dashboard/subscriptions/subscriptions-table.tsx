import { Button } from '@/components/button';
import { makeYourStripeSubscriptionsColumns } from '@/components/data-table/columns/your-stripe-subscriptions';
import DataTable from '@/components/data-table/data-table';
import { getAuthenticatedContributorOrRedirect } from '@/lib/firebase/current-contributor';
import { StripeService } from '@/lib/services/stripe/stripe.service';
import { StripeSubscriptionRow } from '@/lib/services/stripe/stripe.types';
import Link from 'next/link';

export async function SubscriptionsTable() {
	const contributor = await getAuthenticatedContributorOrRedirect();

	const stripeService = new StripeService();

	const subscriptionsResult = await stripeService.getSubscriptionsTableView(contributor.stripeCustomerId);

	const rows: StripeSubscriptionRow[] = subscriptionsResult.success ? subscriptionsResult.data.rows : [];

	const billingPortal = await stripeService.createManageSubscriptionsSession(
		contributor.stripeCustomerId,
		contributor.language,
	);

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
