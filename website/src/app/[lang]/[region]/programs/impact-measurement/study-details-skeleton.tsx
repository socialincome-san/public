import { cn } from '@socialincome/design-system/cn';

const skeletonBar = 'bg-border animate-pulse rounded-full';

export const ImpactMeasurementStudyDetailsSkeleton = () => {
	return (
		<div className="border-border bg-card w-full overflow-hidden rounded-3xl border">
			<div className="flex items-center justify-between gap-3 px-5 py-4">
				<div className="flex min-w-0 flex-wrap items-center gap-2">
					<div className={cn(skeletonBar, 'h-9 w-24')} />
					<div className={cn(skeletonBar, 'h-5 w-44')} />
					<div className={cn(skeletonBar, 'h-8 w-28')} />
				</div>
				<div className={cn(skeletonBar, 'h-5 w-5 rounded-md')} />
			</div>
		</div>
	);
};
