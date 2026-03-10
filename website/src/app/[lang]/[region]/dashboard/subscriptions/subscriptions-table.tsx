import { ConfiguredDataTableClient } from '@/components/data-table/clients/configured-data-table-client';
import { getYourSubscriptionsTableConfig } from '@/components/data-table/configs/your-subscriptions-table.config';
import { tableQueryFromSearchParams } from '@/components/data-table/query-state';
import { getAuthenticatedContributorOrRedirect } from '@/lib/firebase/current-contributor';
import { Translator } from '@/lib/i18n/translator';
import { WebsiteLanguage } from '@/lib/i18n/utils';
import { services } from '@/lib/services/services';

import { StripeSubscriptionRow } from '@/lib/services/stripe/stripe.types';
import { CreditCardIcon, PlusIcon } from 'lucide-react';

export const SubscriptionsTable = async ({
	lang,
	searchParams,
}: {
	lang: WebsiteLanguage;
	searchParams: Promise<Record<string, string>>;
}) => {
	const contributor = await getAuthenticatedContributorOrRedirect();
	const resolvedSearchParams = await searchParams;
	const tableQuery = tableQueryFromSearchParams(resolvedSearchParams);

	const translator = await Translator.getInstance({ language: lang as WebsiteLanguage, namespaces: ['website-me'] });
	const config = getYourSubscriptionsTableConfig({
		title: translator.t('sections.contributions.subscriptions'),
		emptyMessage: translator.t('subscriptions.no-subscriptions'),
	});

	const subscriptionsResult = await services.stripe.getPaginatedSubscriptionsTableView(
		contributor.stripeCustomerId,
		tableQuery,
	);

	const rows: StripeSubscriptionRow[] = subscriptionsResult.success ? subscriptionsResult.data.rows : [];
	const totalRows = subscriptionsResult.success ? subscriptionsResult.data.totalCount : 0;

	const billingPortal = await services.stripe.createManageSubscriptionsSession(
		contributor.stripeCustomerId,
		contributor.language,
	);

	const billingPortalUrl = billingPortal.success ? billingPortal.data : null;

	return (
		<ConfiguredDataTableClient
			config={config}
			rows={rows}
			error={subscriptionsResult.success ? null : subscriptionsResult.error}
			query={{ ...tableQuery, totalRows }}
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
