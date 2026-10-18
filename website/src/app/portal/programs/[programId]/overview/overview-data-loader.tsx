import { getPortalOperationsTranslations } from '@/app/portal/portal-operations-server-translations';
import { getProgramNameById } from '@/modules/programs/program-reference.service';
import { getProgramDashboardStats, isReadyForFirstPayoutInterval } from '@/modules/programs/program-stats.service';
import { getProgramSlugById } from '@/modules/programs/program.service';
import { ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { FirstIntervalFundingSection } from './components/first-interval-funding-section';
import { ProgramSetupSection } from './components/program-setup-section';
import { SectionTitle } from './components/section-title';
import { StatsSection } from './components/stats-section';

type Props = {
	params: Promise<{ programId: string }>;
};

export default async function OverviewProgramScopedDataLoader({ params }: Props) {
	const { programId } = await params;
	const t = await getPortalOperationsTranslations();

	const programNameResult = await getProgramNameById(programId);
	const programSlugResult = await getProgramSlugById(programId);
	if (!programSlugResult.success || !programSlugResult.data) {
		return <div className="p-4">{t('program.error_loading_overview')}</div>;
	}
	const programSlug = programSlugResult.success ? programSlugResult.data : undefined;

	if (!programNameResult.success || !programNameResult.data) {
		return <div className="p-4">{t('program.error_loading_overview')}</div>;
	}

	const statsResult = await getProgramDashboardStats(programId);

	if (!statsResult.success) {
		return <div className="p-4">{t('program.error_loading_statistics')}</div>;
	}

	const stats = statsResult.data;

	const readyForFirstPayoutResult = await isReadyForFirstPayoutInterval(programId);
	const readyForFirstPayout = readyForFirstPayoutResult.success ? readyForFirstPayoutResult.data : false;
	const publicUrl = `/programs/${programSlug}`;

	return (
		<div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
			<div className="space-y-6 lg:col-span-9">
				{!readyForFirstPayout && (
					<>
						<ProgramSetupSection programId={programId} publicUrl={publicUrl} />
						<FirstIntervalFundingSection programId={programId} stats={stats} />
					</>
				)}

				<StatsSection programId={programId} stats={stats} />
			</div>

			<div className="space-y-4 lg:col-span-3">
				<div className="flex items-center gap-2">
					<SectionTitle>{t('program.public_page')}</SectionTitle>
					<Link
						href={publicUrl}
						target="_blank"
						rel="noopener noreferrer"
						className="text-muted-foreground hover:text-foreground transition-colors"
						aria-label={t('program.open_public_page')}
					>
						<ExternalLink className="size-4" />
					</Link>
				</div>

				<iframe
					className="border-background rounded-3xl border-8 shadow-lg"
					title={t('program.overview_title')}
					width="100%"
					height="418px"
					src={publicUrl}
				/>
			</div>
		</div>
	);
}
