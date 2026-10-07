import { AppLoadingSkeleton } from '@socialincome/design-system/feedback/app-loading-skeleton/app-loading-skeleton';
import { BlockWrapper } from '@socialincome/design-system/layout/block-wrapper/block-wrapper';
import { Suspense } from 'react';
import { DonationSuccessDialog } from './components/donation-success-dialog';
import OverviewProgramScopedDataLoader from './overview-data-loader';

type Props = {
	params: Promise<{ programId: string }>;
};

export default function OverviewPageProgramScoped({ params }: Props) {
	return (
		<BlockWrapper marginTop="none" marginBottom="none">
			<Suspense fallback={<AppLoadingSkeleton />}>
				<OverviewProgramScopedDataLoader params={params} />
				<DonationSuccessDialog />
			</Suspense>
		</BlockWrapper>
	);
}
