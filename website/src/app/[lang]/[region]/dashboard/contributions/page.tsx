import { DefaultLayoutProps } from '@/app/[lang]/[region]/index';
import { PropsWithChildren, Suspense } from 'react';
import { ContributionsTable } from './contributions-table';

export default function ContributionsPage({ children, params }: PropsWithChildren<DefaultLayoutProps>) {
	return (
		<Suspense fallback={<div>Loading contributions…</div>}>
			<ContributionsTable />
		</Suspense>
	);
}
