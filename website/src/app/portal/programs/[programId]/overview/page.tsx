import { AppLoadingSkeleton } from '@/components/skeletons/app-loading-skeleton';
import { Suspense } from 'react';
import { DonationSuccessDialog } from './components/donation-success-dialog';
import OverviewProgramScopedDataLoader from './overview-data-loader';

type Props = {
	params: Promise<{ programId: string }>;
};

export default function OverviewPageProgramScoped({ params }: Props) {
	return (
		<Suspense fallback={<AppLoadingSkeleton />}>
			<OverviewProgramScopedDataLoader params={params} />
			<DonationSuccessDialog />
		</Suspense>
	);
}
