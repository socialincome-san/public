const SkeletonBar = ({ className }: { className: string }) => (
	<div className={`animate-pulse rounded-full bg-slate-200 ${className}`} />
);

const SkeletonCard = () => (
	<div className="overflow-hidden rounded-3xl border border-slate-200 bg-slate-100 shadow-sm">
		<div className="rounded-none border-b border-slate-200 bg-white p-0 shadow-none">
			<div className="grid gap-6 px-4 pt-6 pb-8 sm:px-6 sm:pt-8 sm:pb-12 lg:grid-cols-2">
				<div className="space-y-5">
					<SkeletonBar className="h-4 w-40" />
					<SkeletonBar className="h-8 w-4/5" />
					<SkeletonBar className="h-4 w-52" />
				</div>
				<div className="space-y-4">
					<SkeletonBar className="h-5 w-3/4" />
					<SkeletonBar className="h-2 w-full" />
					<SkeletonBar className="h-5 w-2/3" />
					<SkeletonBar className="h-2 w-full" />
					<SkeletonBar className="h-5 w-1/2" />
					<SkeletonBar className="h-2 w-full" />
				</div>
			</div>
		</div>
	</div>
);

export const ImpactMeasurementResultsSkeleton = () => (
	<div className="space-y-10">
		{Array.from({ length: 20 }, (_, index) => (
			<SkeletonCard key={`impact-measurement-skeleton-${index}`} />
		))}
	</div>
);
