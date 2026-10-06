import { skeletonBarClassName } from '@/components/skeletons/skeleton-bar';
import { Translator } from '@/lib/i18n/translator';
import { type WebsiteLanguage } from '@/lib/i18n/utils';
import { cn } from '@socialincome/design-system/cn';
import { BlockWrapper } from '@socialincome/design-system/layout/block-wrapper/block-wrapper';

const SKELETON_ROW_COUNT = 5;

type Props = {
	lang: WebsiteLanguage;
};

export const CountryStatisticsSkeleton = async ({ lang }: Props) => {
	const translator = await Translator.getInstance({ language: lang, namespaces: ['website-common'] });

	return (
		<BlockWrapper>
			<section className="mx-auto max-w-4xl">
				<div className="flex flex-col items-center gap-6">
					<h2 className="text-primary text-center text-3xl leading-tight font-bold md:text-4xl">
						{translator.t('countries-page.statistics.title')}
					</h2>
					<div className="border-border bg-background shadow-card w-full overflow-hidden rounded-xl border">
						<div className="lg:hidden">
							<div className="bg-accent relative overflow-hidden">
								<div className="bg-border absolute inset-y-0 left-1/2 z-10 w-px -translate-x-1/2" />
								<div className="grid grid-cols-2 items-stretch">
									<div className="bg-background rounded-l-xl px-6 py-6">
										<div className={cn(skeletonBarClassName, 'h-7 w-7 rounded-full')} />
										<div className={cn(skeletonBarClassName, 'mt-3 h-5 w-28 rounded-md')} />
										<div className="mt-8 flex flex-col gap-7">
											{Array.from({ length: SKELETON_ROW_COUNT }, (_, index) => (
												<div key={`country-statistics-skeleton-mobile-left-${index}`} className="flex flex-col gap-0">
													<div className={cn(skeletonBarClassName, 'h-5 w-20 rounded-md')} />
													<div className={cn(skeletonBarClassName, 'mt-0.5 h-5 w-16 rounded-md')} />
												</div>
											))}
										</div>
									</div>
									<div className="bg-background px-6 py-6">
										<div className={cn(skeletonBarClassName, 'h-7 w-7 rounded-full')} />
										<div className={cn(skeletonBarClassName, 'mt-3 h-5 w-28 rounded-md')} />
										<div className="mt-8 flex flex-col gap-7">
											{Array.from({ length: SKELETON_ROW_COUNT }, (_, index) => (
												<div key={`country-statistics-skeleton-mobile-right-${index}`} className="flex flex-col gap-0">
													<div className={cn(skeletonBarClassName, 'pointer-events-none invisible h-5 w-20 rounded-md')} />
													<div className={cn(skeletonBarClassName, 'mt-0.5 h-5 w-16 rounded-md')} />
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
											<div className={cn(skeletonBarClassName, 'h-7 w-7 rounded-full')} />
											<div className={cn(skeletonBarClassName, 'mt-3 h-8 w-40 rounded-md')} />
										</div>
										<div className="mt-8 flex flex-col gap-4">
											{Array.from({ length: SKELETON_ROW_COUNT }, (_, index) => (
												<div
													key={`country-statistics-skeleton-label-${index}`}
													className={cn(skeletonBarClassName, 'h-6 w-32 rounded-md')}
												/>
											))}
										</div>
									</div>
									<div className="border-border bg-background rounded-l-xl border-l p-12">
										<div className={cn(skeletonBarClassName, 'h-7 w-7 rounded-full')} />
										<div className={cn(skeletonBarClassName, 'mt-3 h-8 w-40 rounded-md')} />
										<div className="mt-8 flex flex-col gap-4">
											{Array.from({ length: SKELETON_ROW_COUNT }, (_, index) => (
												<div
													key={`country-statistics-skeleton-country-${index}`}
													className={cn(skeletonBarClassName, 'h-6 w-24 rounded-md')}
												/>
											))}
										</div>
									</div>
									<div className="bg-background p-12">
										<div className={cn(skeletonBarClassName, 'h-7 w-7 rounded-full')} />
										<div className={cn(skeletonBarClassName, 'mt-3 h-8 w-40 rounded-md')} />
										<div className="mt-8 flex flex-col gap-4">
											{Array.from({ length: SKELETON_ROW_COUNT }, (_, index) => (
												<div
													key={`country-statistics-skeleton-visitor-${index}`}
													className={cn(skeletonBarClassName, 'h-6 w-24 rounded-md')}
												/>
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
		</BlockWrapper>
	);
};
