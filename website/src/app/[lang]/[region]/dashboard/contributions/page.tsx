import { SpinnerIcon } from '@socialincome/ui';
import { Suspense } from 'react';
import { DefaultPageProps } from '../..';
import { ContributionsTable } from './contributions-table';

export default async function Page({ params }: DefaultPageProps) {
	const { lang } = await params;
	return (
		<Suspense fallback={<SpinnerIcon />}>
			<ContributionsTable lang={lang} />
		</Suspense>
	);
}
