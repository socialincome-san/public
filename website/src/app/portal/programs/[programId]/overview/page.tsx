import { Suspense } from 'react';
import { DonationSuccessDialog } from './components/donation-success-dialog';
import OverviewProgramScopedDataLoader from './overview-data-loader';

type Props = { params: Promise<{ programId: string }> };

export default function OverviewPageProgramScoped({ params }: Props) {
	return (
		<>
			<Suspense>
				<OverviewProgramScopedDataLoader params={params} />
				<DonationSuccessDialog />
			</Suspense>
		</>
	);
}
