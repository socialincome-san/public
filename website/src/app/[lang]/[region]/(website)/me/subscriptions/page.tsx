import { DefaultPageProps } from '@/app/[lang]/[region]';
import { BillingPortalButton } from '@/app/[lang]/[region]/(website)/me/subscriptions/billing-portal-button';
import { SubscriptionsTable } from '@/app/[lang]/[region]/(website)/me/subscriptions/subscriptions-table';
import { Translator } from '@socialincome/shared/src/utils/i18n';

export default async function Page({ params }: DefaultPageProps) {
	const translator = await Translator.getInstance({ language: params.lang, namespaces: ['website-me'] });
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
			<BillingPortalButton
				translations={{
					manageSubscriptions: translator.t('subscriptions.manage-subscriptions'),
				}}
			/>
		</div>
	);
}
