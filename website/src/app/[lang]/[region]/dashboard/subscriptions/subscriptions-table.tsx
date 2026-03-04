import { makeYourStripeSubscriptionsColumns } from '@/components/data-table/columns/your-stripe-subscriptions';
import DataTable from '@/components/data-table/data-table';
import { getAuthenticatedContributorOrRedirect } from '@/lib/firebase/current-contributor';
import { Translator } from '@/lib/i18n/translator';
import { WebsiteLanguage } from '@/lib/i18n/utils';
import { StripeService } from '@/lib/services/stripe/stripe.service';
import { StripeSubscriptionRow } from '@/lib/services/stripe/stripe.types';
import { CreditCardIcon, PlusIcon } from 'lucide-react';

export const SubscriptionsTable = async ({ lang }: { lang: WebsiteLanguage }) => {
	const contributor = await getAuthenticatedContributorOrRedirect();

	const translator = await Translator.getInstance({ language: lang as WebsiteLanguage, namespaces: ['website-me'] });

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
			title={translator.t('sections.contributions.subscriptions')}
			error={subscriptionsResult.success ? null : subscriptionsResult.error}
			emptyMessage={translator.t('subscriptions.no-subscriptions')}
			data={rows}
			makeColumns={makeYourStripeSubscriptionsColumns}
			lang={lang}
			actionMenuItems={[
				{
					label: translator.t('subscriptions.new-subscription'),
					icon: <PlusIcon />,
					href: '/donate/individual',
				},

				...(billingPortalUrl
					? [
							{
								label: translator.t('subscriptions.manage-subscriptions'),
								icon: <CreditCardIcon />,
								href: billingPortalUrl,
							},
						]
					: []),
			]}
		/>
	);
};
