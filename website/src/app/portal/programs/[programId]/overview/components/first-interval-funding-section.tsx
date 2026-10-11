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

export const FirstIntervalFundingSection = ({ programId, stats }: FirstIntervalFundingSectionProps) => {
	const percent =
		stats.costPerIntervalChf > 0 ? Math.min(100, (stats.contributedToProgramSoFarChf / stats.costPerIntervalChf) * 100) : 0;

	return (
		<div className="space-y-4">
			<SectionTitle>First Interval Funding</SectionTitle>
			<Card>
				<div className="space-y-6">
					<StatPanel>
						<StatProgress
							title="You need to cover the first interval to start the program"
							start={{
								label: 'Current Contributions',
								value: formatCurrencyLocale(stats.contributedToProgramSoFarChf, 'CHF', 'de-CH', {
									compactThreshold: 1_000_000,
								}),
							}}
							end={{
								label: 'Minimum Required',
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
