import { DefaultLayoutPropsWithSlug, DefaultPageProps } from '@/app/[lang]/[region]';
import { StatsSection } from '@/app/portal/programs/[programId]/overview/components/stats-section';
import { services } from '@/lib/services/services';

import { notFound } from 'next/navigation';
import { Suspense } from 'react';

export default function ProgramsPage({ params, searchParams }: DefaultLayoutPropsWithSlug & DefaultPageProps) {
	return (
		<Suspense>
			<ProgramsPageDataLoader params={params} searchParams={searchParams} />
		</Suspense>
	);
}

const ProgramsPageDataLoader = async ({ params, searchParams }: DefaultLayoutPropsWithSlug & DefaultPageProps) => {
	const { slug } = await params;
	const query = await searchParams;

	const statsResult = await services.programStats.getProgramDashboardStatsBySlug(slug);

	if (!statsResult.success || !statsResult.data) {
		return notFound();
	}

	const stats = statsResult.data;

	const idResult = await services.read.program.getProgramIdBySlug(slug);
	if (!idResult.success) {
		return notFound();
	}
	const programId = idResult.data;

	const isPreview = query.preview === 'true';
	if (!isPreview) {
		const readyResult = await services.programStats.isReadyForFirstPayoutInterval(programId);
		if (!readyResult.success || !readyResult.data) {
			return notFound();
		}
	}

	return (
		<div className="mx-auto max-w-6xl p-6">
			<StatsSection programId={programId} stats={stats} />
		</div>
	);
};
