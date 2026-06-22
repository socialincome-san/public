import { cn } from '@/lib/utils/cn';

const SkeletonBar = ({ className }: { className: string }) => (
	<div className={cn('animate-pulse rounded-full bg-slate-200', className)} />
);

export const ImpactMeasurementStudyDetailsSkeleton = () => {
	return (
		<div className="w-full overflow-hidden rounded-3xl border border-slate-200 bg-white">
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
