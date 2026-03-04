import { DefaultLayoutPropsWithSlug, DefaultPageProps } from '@/app/[lang]/[region]';
import { StatsSection } from '@/app/portal/programs/[programId]/overview/components/stats-section';
import { ProgramStatsService } from '@/lib/services/program-stats/program-stats.service';
import { ProgramService } from '@/lib/services/program/program.service';
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

	const statsService = new ProgramStatsService();
	const statsResult = await statsService.getProgramDashboardStatsBySlug(slug);

	if (!statsResult.success || !statsResult.data) {
		return notFound();
	}

	const stats = statsResult.data;
	const programService = new ProgramService();
	const idResult = await programService.getProgramIdBySlug(slug);
	if (!idResult.success) {
		return notFound();
	}
	const programId = idResult.data;

	const isPreview = query.preview === 'true';
	if (!isPreview) {
		const readyResult = await statsService.isReadyForFirstPayoutInterval(programId);
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
