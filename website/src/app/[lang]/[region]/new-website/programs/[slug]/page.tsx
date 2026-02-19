import { DefaultLayoutPropsWithSlug, DefaultPageProps } from '@/app/[lang]/[region]';
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

	const isPreview = query.preview === 'true';
	if (!isPreview) {
		const programService = new ProgramService();
		const idResult = await programService.getProgramIdBySlug(slug);
		if (!idResult.success) {
			return notFound();
		}
		const readyResult = await programService.isReadyForFirstPayoutInterval(idResult.data);
		if (!readyResult.success || !readyResult.data) {
			return notFound();
		}
	}

	return (
		<div className="mx-auto max-w-2xl p-6">
			<h1 className="mb-6 text-2xl font-semibold tracking-tight">Program</h1>

			<ul className="divide-y rounded-lg border text-sm">
				<li className="flex justify-between gap-4 p-3">
					<span className="text-muted-foreground">Program duration (months)</span>
					<span className="font-medium">{stats.programDurationInMonths}</span>
				</li>

				<li className="flex justify-between gap-4 p-3">
					<span className="text-muted-foreground">Payout interval</span>
					<span className="font-medium">{stats.payoutInterval}</span>
				</li>

				<li className="flex justify-between gap-4 p-3">
					<span className="text-muted-foreground">Payout per interval</span>
					<span className="font-medium">
						{stats.payoutPerInterval} {stats.payoutCurrency}
					</span>
				</li>

				<li className="flex justify-between gap-4 p-3">
					<span className="text-muted-foreground">Recipients</span>
					<span className="font-semibold">{stats.recipientsCount}</span>
				</li>

				<li className="flex justify-between gap-4 p-3">
					<span className="text-muted-foreground">Payouts completed</span>
					<span className="font-semibold">{stats.totalPayoutsCount}</span>
				</li>

				<li className="flex justify-between gap-4 p-3">
					<span className="text-muted-foreground">Paid out so far (CHF)</span>
					<span className="font-semibold">{stats.paidOutSoFarChf}</span>
				</li>

				<li className="flex justify-between gap-4 p-3">
					<span className="text-muted-foreground">Surveys completed</span>
					<span className="font-semibold">{stats.completedSurveysCount}</span>
				</li>

				{stats.firstPayoutDate && (
					<li className="flex justify-between gap-4 p-3">
						<span className="text-muted-foreground">First payout date</span>
						<span className="font-medium">{new Date(stats.firstPayoutDate).toLocaleDateString()}</span>
					</li>
				)}
			</ul>
		</div>
	);
};
