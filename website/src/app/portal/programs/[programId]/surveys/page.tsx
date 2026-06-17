import { ImpactMeasurementView } from '@/app/[lang]/[region]/programs/impact-measurement/view';
import { Card } from '@/components/card';
import { defaultLanguage } from '@/lib/i18n/utils';
import type { SearchParamsPageProps } from '@/lib/types/page-props';

type Props = SearchParamsPageProps & { params: Promise<{ programId: string }> };

export default async function ProgramSurveysPage({ params, searchParams }: Props) {
	const { programId } = await params;
	const resolvedSearchParams = await searchParams;

	return (
		<Card>
			<ImpactMeasurementView
				lang={defaultLanguage}
				variant="embedded"
				searchParams={{
					...resolvedSearchParams,
					program: programId,
				}}
			/>
		</Card>
	);
}
