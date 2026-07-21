import { BlockWrapper } from '@/components/block-wrapper';
import { AppLoadingSkeleton } from '@/components/skeletons/app-loading-skeleton';
import { Suspense } from 'react';
import { DonationSuccessDialog } from './components/donation-success-dialog';
import OverviewProgramScopedDataLoader from './overview-data-loader';

type Props = {
	params: Promise<{ programId: string }>;
};

export default function OverviewPageProgramScoped({ params }: Props) {
	return (
		<BlockWrapper disableMarginTop={true} disableMarginBottom={true}>
			<Suspense fallback={<AppLoadingSkeleton />}>
				<OverviewProgramScopedDataLoader params={params} />
				<DonationSuccessDialog />
			</Suspense>
		</BlockWrapper>
	);
}
