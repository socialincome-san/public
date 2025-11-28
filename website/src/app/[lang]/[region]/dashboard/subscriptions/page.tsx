import { Suspense } from 'react';
import { DefaultPageProps } from '../..';
import { SubscriptionsTable } from './subscriptions-table';

export default async function Page({ params }: DefaultPageProps) {
	const { lang } = await params;
	return (
		<Suspense fallback={<>Loading subscriptions...</>}>
			<SubscriptionsTable lang={lang} />
		</Suspense>
	);
}
