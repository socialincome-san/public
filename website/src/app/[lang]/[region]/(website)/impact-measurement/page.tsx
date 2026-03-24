import { DefaultPageProps } from '@/app/[lang]/[region]';
import { ImpactMeasurementView } from '@/app/[lang]/[region]/new-website/programs/impact-measurement/view';

export const revalidate = 900;

export default async function Page({ params, searchParams }: DefaultPageProps) {
	const { lang } = await params;
	const resolvedSearchParams = await searchParams;

	return (
		<ImpactMeasurementView
			lang={lang}
			searchParams={resolvedSearchParams}
		/>
	);
}
