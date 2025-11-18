import { Suspense } from 'react';
import { DefaultPageProps } from '../..';
import { SubscriptionsTable } from './subscriptions-table';

export default async function Page({ params }: DefaultPageProps) {
	return (
		<Suspense fallback={<>Loading subscriptions...</>}>
			<SubscriptionsTable />
		</Suspense>
	);
}
