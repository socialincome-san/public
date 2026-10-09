import { ImpactMeasurementView } from '@/app/[lang]/[currency]/programs/impact-measurement/view';
import type { SearchParamsPageProps } from '@/app/page-props';
import { defaultLanguage } from '@/lib/i18n/utils';

type Props = SearchParamsPageProps & { params: Promise<{ programId: string }> };

export default async function ProgramSurveysPage({ params, searchParams }: Props) {
	const { programId } = await params;
	const resolvedSearchParams = await searchParams;

	return (
		<ImpactMeasurementView
			lang={defaultLanguage}
			variant="embedded"
			searchParams={{
				...resolvedSearchParams,
				program: programId,
			}}
		/>
	);
}
