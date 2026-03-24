import { ParsedUrlQueryInput } from 'querystring';
import { Suspense } from 'react';
import { ImpactMeasurementFilterSection } from './filter-section';
import { ImpactMeasurementResults } from './results';
import { ImpactMeasurementResultsSkeleton } from './results-skeleton';
import { ImpactMeasurementStudyDetailsSkeleton } from './study-details-skeleton';
import { ImpactMeasurementStudyDetails } from './summary';
import { getImpactTranslator } from './translator';

type ImpactMeasurementViewProps = {
	lang: string;
	searchParams: ParsedUrlQueryInput;
};

export const ImpactMeasurementView = async ({
	lang,
	searchParams,
}: ImpactMeasurementViewProps) => {
	const normalizedSearchParams = Object.fromEntries(
		Object.entries(searchParams).filter(([, value]) => typeof value === 'string'),
	) as Record<string, string | undefined>;
	const suspenseKey = Object.entries(normalizedSearchParams)
		.filter(([, value]) => typeof value === 'string' && value.length > 0)
		.sort(([leftKey], [rightKey]) => leftKey.localeCompare(rightKey))
		.map(([key, value]) => `${key}=${value}`)
		.join('&');
	const translator = await getImpactTranslator(lang);

	return (
		<div className="w-site-width max-w-content mx-auto space-y-3 px-4 py-6 sm:px-0 sm:py-10">
			<div className="space-y-5">
				<h1 className="text-4xl leading-tight font-bold text-cyan-900 sm:text-5xl">
					{translator.t('survey.impactMeasurement.title')}
				</h1>
				<p className="text-base leading-6 text-cyan-950 sm:text-lg sm:leading-7">
					{translator.t('survey.impactMeasurement.description')}
				</p>
				<div className="flex w-full justify-end">
					<div className="w-full sm:w-auto">
						<ImpactMeasurementFilterSection lang={lang} searchParams={normalizedSearchParams} />
					</div>
				</div>
				<Suspense key={`summary-${suspenseKey}`} fallback={<ImpactMeasurementStudyDetailsSkeleton />}>
					<ImpactMeasurementStudyDetails lang={lang} searchParams={normalizedSearchParams} />
				</Suspense>
			</div>
			<Suspense key={suspenseKey} fallback={<ImpactMeasurementResultsSkeleton />}>
				<ImpactMeasurementResults lang={lang} searchParams={normalizedSearchParams} />
			</Suspense>
		</div>
	);
};
