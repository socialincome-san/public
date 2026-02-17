import { Suspense } from 'react';
import OverviewProgramScopedDataLoader from './overview-data-loader';

type Props = { params: Promise<{ programId: string }> };

export default function OverviewPageProgramScoped({ params }: Props) {
	return (
		<Suspense>
			<OverviewProgramScopedDataLoader params={params} />
		</Suspense>
	);
}
