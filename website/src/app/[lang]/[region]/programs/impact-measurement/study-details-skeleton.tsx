import { cn } from '@/lib/utils/cn';

const SkeletonBar = ({ className }: { className: string }) => (
	<div className={cn('bg-border animate-pulse rounded-full', className)} />
);

export const ImpactMeasurementStudyDetailsSkeleton = () => {
	return (
		<div className="border-border bg-card w-full overflow-hidden rounded-3xl border">
			<div className="flex items-center justify-between gap-3 px-5 py-4">
				<div className="flex min-w-0 flex-wrap items-center gap-2">
					<SkeletonBar className="h-9 w-24" />
					<SkeletonBar className="h-5 w-44" />
					<SkeletonBar className="h-8 w-28" />
				</div>
				<SkeletonBar className="h-5 w-5 rounded-md" />
			</div>
		</div>
	);
};
