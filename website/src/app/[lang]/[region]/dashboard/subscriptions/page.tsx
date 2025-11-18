// app/[lang]/[region]/(website)/subscriptions/page.tsx
import { DefaultLayoutProps } from '@/app/[lang]/[region]/index';
import { Suspense } from 'react';
import { SubscriptionsTable } from './subscriptions-table';

export default async function SubscriptionsPage({ params }: DefaultLayoutProps) {
	return (
		<Suspense fallback={<>Loading subscriptions...</>}>
			<SubscriptionsTable />
		</Suspense>
	);
}
