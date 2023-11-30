import { DefaultPageProps } from '@/app/[lang]/[region]';
import { BillingPortalButton } from '@/app/[lang]/[region]/(website)/me/subscriptions/billing-portal-button';
import { SubscriptionsTable } from '@/app/[lang]/[region]/(website)/me/subscriptions/subscriptions-table';
import { PlusCircleIcon } from '@heroicons/react/24/outline';
import { Translator } from '@socialincome/shared/src/utils/i18n';
import { Button } from '@socialincome/ui';
import Link from 'next/link';

export default async function Page({ params: { lang, region } }: DefaultPageProps) {
	const translator = await Translator.getInstance({ language: lang, namespaces: ['website-me'] });
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
				lang={lang}
				region={region}
			/>
			<div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-2">
				<Link href={`/${lang}/${region}/donate/individual`}>
					<Button Icon={PlusCircleIcon} variant="ghost" size="lg" className="w-full">
						{translator.t('subscriptions.new-subscription')}
					</Button>
				</Link>
				<BillingPortalButton
					translations={{
						manageSubscriptions: translator.t('subscriptions.manage-subscriptions'),
					}}
				/>
			</div>
		</div>
	);
}
