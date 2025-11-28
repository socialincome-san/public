import { Suspense } from 'react';
import { DefaultPageProps } from '../..';
import { ContributionsTable } from './contributions-table';

export default async function Page({ params }: DefaultPageProps) {
	const { lang } = await params;
	return (
		<Suspense fallback={<div>Loading contributions…</div>}>
			<ContributionsTable lang={lang} />
		</Suspense>
	);
}
