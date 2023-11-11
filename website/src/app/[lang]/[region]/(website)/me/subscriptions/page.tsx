import { DefaultPageProps } from '@/app/[lang]/[region]';
import { BillingPortalButton } from '@/app/[lang]/[region]/(website)/me/subscriptions/billing-portal-button';
import { SubscriptionsTable } from '@/app/[lang]/[region]/(website)/me/subscriptions/subscriptions-table';

export default function Page({ params }: DefaultPageProps) {
	// TODO: i18n
	return (
		<div className="flex flex-col">
			<SubscriptionsTable
				translations={{
					from: 'From',
					until: 'Until',
					status: 'Status',
					interval: 'Interval',
					amount: 'Amount',
				}}
				lang={params.lang}
				region={params.region}
			/>
			<BillingPortalButton />
		</div>
	);
}
