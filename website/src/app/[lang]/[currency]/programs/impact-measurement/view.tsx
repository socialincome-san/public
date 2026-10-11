import { BlockWrapper } from '@socialincome/design-system/layout/block-wrapper/block-wrapper';
import { ParsedUrlQueryInput } from 'querystring';
import { Suspense } from 'react';
import { ImpactMeasurementFilterSection } from './filter-section';
import { ImpactMeasurementResults } from './results';
import { ImpactMeasurementResultsSkeleton } from './results-skeleton';
import { ImpactMeasurementStudyDetailsSkeleton } from './study-details-skeleton';
import { ImpactMeasurementStudyDetails } from './summary';

type ImpactMeasurementViewProps = {
	lang: string;
	searchParams: ParsedUrlQueryInput;
	showStudyDetails?: boolean;
	variant?: 'standalone' | 'embedded';
};

export const ImpactMeasurementView = ({
	lang,
	searchParams,
	showStudyDetails = true,
	variant = 'standalone',
}: ImpactMeasurementViewProps) => {
	const normalizedSearchParams = Object.fromEntries(
		Object.entries(searchParams).filter(([, value]) => typeof value === 'string'),
	) as Record<string, string | undefined>;
	const suspenseKey = Object.entries(normalizedSearchParams)
		.filter(([, value]) => typeof value === 'string' && value.length > 0)
		.sort(([leftKey], [rightKey]) => leftKey.localeCompare(rightKey))
		.map(([key, value]) => `${key}=${value}`)
		.join('&');

	return (
		<div className="space-y-3 pb-16">
			{variant === 'standalone' ? (
				<BlockWrapper disableMarginTop={true} disableMarginBottom={true}>
					<div className="space-y-5 pb-6">
						<div className="flex w-full justify-end">
							<div className="w-full sm:w-auto">
								<ImpactMeasurementFilterSection lang={lang} searchParams={normalizedSearchParams} />
							</div>
						</div>

						<Suspense key={`summary-${suspenseKey}`} fallback={<ImpactMeasurementStudyDetailsSkeleton />}>
							<ImpactMeasurementStudyDetails lang={lang} searchParams={normalizedSearchParams} />
						</Suspense>
					</div>
				</BlockWrapper>
			) : null}
			{variant === 'embedded' && showStudyDetails ? (
				<BlockWrapper disableMarginTop={true} disableMarginBottom={true}>
					<div className="pb-6">
						<Suspense key={`summary-${suspenseKey}`} fallback={<ImpactMeasurementStudyDetailsSkeleton />}>
							<ImpactMeasurementStudyDetails lang={lang} searchParams={normalizedSearchParams} />
						</Suspense>
					</div>
				</BlockWrapper>
			) : null}
			<Suspense key={suspenseKey} fallback={<ImpactMeasurementResultsSkeleton />}>
				<ImpactMeasurementResults searchParams={normalizedSearchParams} />
			</Suspense>
		</div>
	);
};
