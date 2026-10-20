import { getPortalOperationsTranslations } from '@/app/portal/portal-operations-server-translations';
import { formatCurrencyLocale } from '@/lib/utils/string-utils';
import type { ProgramDashboardStats } from '@/modules/programs/program.types';
import { Card } from '@socialincome/design-system/data-display/card/card';
import { StatPanel } from '@socialincome/design-system/data-display/stat-panel/stat-panel';
import { StatProgress } from '@socialincome/design-system/data-display/stat-progress/stat-progress';
import { DonationForm } from './donation-form';
import { SectionTitle } from './section-title';

type FirstIntervalFundingSectionProps = {
	programId: string;
	stats: ProgramDashboardStats;
};

export const FirstIntervalFundingSection = async ({ programId, stats }: FirstIntervalFundingSectionProps) => {
	const t = await getPortalOperationsTranslations();
	const percent =
		stats.costPerIntervalChf > 0 ? Math.min(100, (stats.contributedToProgramSoFarChf / stats.costPerIntervalChf) * 100) : 0;

	return (
		<div className="space-y-4">
			<SectionTitle>{t('program.funding.title')}</SectionTitle>
			<Card>
				<div className="space-y-6">
					<StatPanel>
						<StatProgress
							title={t('program.funding.progress_title')}
							start={{
								label: t('program.funding.current_contributions'),
								value: formatCurrencyLocale(stats.contributedToProgramSoFarChf, 'CHF', 'de-CH', {
									compactThreshold: 1_000_000,
								}),
							}}
							end={{
								label: t('program.funding.minimum_required'),
								value: formatCurrencyLocale(stats.costPerIntervalChf, 'CHF', 'de-CH', { compactThreshold: 1_000_000 }),
							}}
							percent={percent}
						/>
					</StatPanel>

					<StatPanel>
						<DonationForm costPerIntervalChf={stats.costPerIntervalChf} programId={programId} />
					</StatPanel>
				</div>
			</Card>
		</div>
	);
};
