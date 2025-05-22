import { DefaultPageProps } from '@/app/[lang]/[region]';
import { SubscriptionsClient } from '@/app/[lang]/[region]/(website)/me/subscriptions/subscriptions-client';
import { Translator } from '@socialincome/shared/src/utils/i18n';

export default async function Page(props: DefaultPageProps) {
	const params = await props.params;

	const { lang, region } = params;

	const translator = await Translator.getInstance({ language: lang, namespaces: ['website-me'] });

	return (
		<SubscriptionsClient
			translations={{
				from: 'From',
				until: 'Until',
				status: 'Status',
				interval: 'Interval',
				amount: 'Amount',
				newSubscription: translator.t('subscriptions.new-subscription'),
				manageSubscriptions: translator.t('subscriptions.manage-subscriptions'),
			}}
			lang={lang}
			region={region}
		/>
	);
}
