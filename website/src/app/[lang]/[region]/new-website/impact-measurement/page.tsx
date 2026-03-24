import { DefaultPageProps } from '@/app/[lang]/[region]';
import { Breadcrumb } from '@/components/breadcrumb/breadcrumb';
import { Suspense } from 'react';
import { ImpactMeasurementFilterSection } from './filter-section';
import { ImpactMeasurementResults } from './results';
import { ImpactMeasurementResultsSkeleton } from './results-skeleton';
import { ImpactMeasurementSummary } from './summary';
import { getImpactTranslator } from './translator';

export const revalidate = 900;

export default async function Page({ params, searchParams }: DefaultPageProps) {
	const { lang, region } = await params;
	const resolvedSearchParams = await searchParams;
	const suspenseKey = Object.entries(resolvedSearchParams)
		.filter(([, value]) => typeof value === 'string' && value.length > 0)
		.sort(([leftKey], [rightKey]) => leftKey.localeCompare(rightKey))
		.map(([key, value]) => `${key}=${value}`)
		.join('&');
	const translator = await getImpactTranslator(lang);

	return (
		<div className="w-site-width max-w-content mx-auto space-y-3 px-4 py-6 sm:px-0 sm:py-10">
			<div className="space-y-5">
				<Breadcrumb
					links={[
						{ label: translator.t('survey.impactMeasurement.breadcrumb.home'), href: `/${lang}/${region}/new-website` },
						{
							label: translator.t('survey.impactMeasurement.breadcrumb.programs'),
							href: `/${lang}/${region}/new-website/programs`,
						},
						{
							label: translator.t('survey.impactMeasurement.breadcrumb.impactMeasurement'),
							href: `/${lang}/${region}/new-website/impact-measurement`,
						},
					]}
				/>
				<h1 className="text-4xl leading-tight font-bold text-cyan-900 sm:text-5xl">
					{translator.t('survey.impactMeasurement.title')}
				</h1>
				<p className="text-base leading-6 text-cyan-950 sm:text-lg sm:leading-7">
					{translator.t('survey.impactMeasurement.description')}
				</p>
				<div className="flex flex-wrap items-center justify-between gap-4 pt-3 pb-0">
					<Suspense
						key={`summary-${suspenseKey}`}
						fallback={<div className="h-5 w-72 animate-pulse rounded-full bg-slate-200" />}
					>
						<ImpactMeasurementSummary lang={lang} searchParams={resolvedSearchParams} />
					</Suspense>
					<ImpactMeasurementFilterSection lang={lang} searchParams={resolvedSearchParams} />
				</div>
			</div>
			<Suspense key={suspenseKey} fallback={<ImpactMeasurementResultsSkeleton />}>
				<ImpactMeasurementResults lang={lang} searchParams={resolvedSearchParams} />
			</Suspense>
		</div>
	);
}
