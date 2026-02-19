import { ProgramStatsService } from '@/lib/services/program-stats/program-stats.service';
import { ProgramService } from '@/lib/services/program/program.service';
import { NEW_WEBSITE_SLUG } from '@/lib/utils/const';
import { slugify } from '@/lib/utils/string-utils';
import { ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { FirstIntervalFundingSection } from './components/first-interval-funding-section';
import { ProgramSetupSection } from './components/program-setup-section';
import { SectionTitle } from './components/section-title';
import { StatsSection } from './components/stats-section';

type Props = { params: Promise<{ programId: string }> };

export default async function OverviewProgramScopedDataLoader({ params }: Props) {
  const { programId } = await params;

  const programService = new ProgramService();
  const statsService = new ProgramStatsService();

  const programNameResult = await programService.getProgramNameById(programId);

  if (!programNameResult.success || !programNameResult.data) {
    return <div className="p-4">Error loading the program overview</div>;
  }

  const statsResult = await statsService.getProgramDashboardStats(programId);

  if (!statsResult.success) {
    return <div className="p-4">Error loading financial statistics</div>;
  }

  const stats = statsResult.data;

  const readyForFirstPayoutResult = await programService.isReadyForFirstPayoutInterval(programId);
  const readyForFirstPayout = readyForFirstPayoutResult.success ? readyForFirstPayoutResult.data : false;

  const programSlug = slugify(programNameResult.data);
  const publicUrl = `/${NEW_WEBSITE_SLUG}/programs/${programSlug}`;
  const publicPreviewUrl = `${publicUrl}?preview=true`;

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
          <SectionTitle>{readyForFirstPayout ? 'Your public page' : 'Your preview page'}</SectionTitle>
          <Link
            href={readyForFirstPayout ? publicUrl : publicPreviewUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground transition-colors hover:text-foreground"
            aria-label="Open public page in new tab"
          >
            <ExternalLink className="size-4" />
          </Link>
        </div>

        <iframe
          className="rounded-3xl border-8 border-background shadow-lg"
          title="Program Overview"
          width="100%"
          height="418px"
          src={readyForFirstPayout ? publicUrl : publicPreviewUrl}
        />
      </div>
    </div>
  );
}
