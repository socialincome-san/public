import { Translator } from '@/lib/i18n/translator';
import { type WebsiteLanguage } from '@/lib/i18n/utils';
import { cn } from '@/lib/utils/cn';

const SkeletonBar = ({ className }: { className: string }) => (
	<div className={cn('bg-border animate-pulse rounded-full', className)} />
);

const SKELETON_ROW_COUNT = 5;

type Props = {
	lang: WebsiteLanguage;
};

export const CountryStatisticsSkeleton = async ({ lang }: Props) => {
	const translator = await Translator.getInstance({ language: lang, namespaces: ['website-common'] });

	return (
		<section className="w-site-width max-w-content mx-auto px-6 py-8 lg:py-12">
			<div className="flex flex-col items-center gap-6">
				<h2 className="text-primary text-center text-4xl leading-tight font-bold md:text-5xl">
					{translator.t('countries-page.statistics.title')}
				</h2>
				<div className="border-border bg-background w-full overflow-hidden rounded-[calc(var(--radius)+4px)] border shadow-[0px_4px_28px_0px_rgba(0,30,101,0.07)]">
					<div className="lg:hidden">
						<div className="bg-accent relative overflow-hidden">
							<div className="bg-border absolute inset-y-0 left-1/2 z-10 w-px -translate-x-1/2" />
							<div className="grid grid-cols-2 items-stretch">
								<div className="bg-background rounded-l-[calc(var(--radius)+4px)] px-6 py-6">
									<SkeletonBar className="h-7 w-7 rounded-full" />
									<SkeletonBar className="mt-3 h-5 w-28 rounded-md" />
									<div className="mt-8 flex flex-col gap-7">
										{Array.from({ length: SKELETON_ROW_COUNT }, (_, index) => (
											<div key={`country-statistics-skeleton-mobile-left-${index}`} className="flex flex-col gap-0">
												<SkeletonBar className="h-5 w-20 rounded-md" />
												<SkeletonBar className="mt-0.5 h-5 w-16 rounded-md" />
											</div>
										))}
									</div>
								</div>
								<div className="bg-background px-6 py-6">
									<SkeletonBar className="h-7 w-7 rounded-full" />
									<SkeletonBar className="mt-3 h-5 w-28 rounded-md" />
									<div className="mt-8 flex flex-col gap-7">
										{Array.from({ length: SKELETON_ROW_COUNT }, (_, index) => (
											<div key={`country-statistics-skeleton-mobile-right-${index}`} className="flex flex-col gap-0">
												<SkeletonBar className="pointer-events-none invisible h-5 w-20 rounded-md" />
												<SkeletonBar className="mt-0.5 h-5 w-16 rounded-md" />
											</div>
										))}
									</div>
								</div>
							</div>
							<div className="bg-muted absolute top-16 left-1/2 z-20 size-5 -translate-x-1/2 rounded-full" />
						</div>
					</div>
					<div className="hidden lg:block">
						<div className="bg-accent relative overflow-hidden">
							<div className="bg-border absolute inset-y-0 left-[calc(50%+160px)] z-10 w-px -translate-x-1/2" />
							<div className="grid grid-cols-[320px_minmax(0,1fr)_minmax(0,1fr)] items-stretch">
								<div className="bg-accent p-12">
									<div className="pointer-events-none invisible select-none">
										<SkeletonBar className="h-7 w-7 rounded-full" />
										<SkeletonBar className="mt-3 h-8 w-40 rounded-md" />
									</div>
									<div className="mt-8 flex flex-col gap-4">
										{Array.from({ length: SKELETON_ROW_COUNT }, (_, index) => (
											<SkeletonBar key={`country-statistics-skeleton-label-${index}`} className="h-6 w-32 rounded-md" />
										))}
									</div>
								</div>
								<div className="border-border bg-background rounded-l-[calc(var(--radius)+4px)] border-l p-12">
									<SkeletonBar className="h-7 w-7 rounded-full" />
									<SkeletonBar className="mt-3 h-8 w-40 rounded-md" />
									<div className="mt-8 flex flex-col gap-4">
										{Array.from({ length: SKELETON_ROW_COUNT }, (_, index) => (
											<SkeletonBar key={`country-statistics-skeleton-country-${index}`} className="h-6 w-24 rounded-md" />
										))}
									</div>
								</div>
								<div className="bg-background p-12">
									<SkeletonBar className="h-7 w-7 rounded-full" />
									<SkeletonBar className="mt-3 h-8 w-40 rounded-md" />
									<div className="mt-8 flex flex-col gap-4">
										{Array.from({ length: SKELETON_ROW_COUNT }, (_, index) => (
											<SkeletonBar key={`country-statistics-skeleton-visitor-${index}`} className="h-6 w-24 rounded-md" />
										))}
									</div>
								</div>
							</div>
							<div className="bg-muted absolute top-20 left-[calc(50%+160px)] z-20 size-10 -translate-x-1/2 rounded-full" />
						</div>
					</div>
				</div>
			</div>
		</section>
	);
};
