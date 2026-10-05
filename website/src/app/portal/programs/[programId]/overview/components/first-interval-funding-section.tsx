import { Card } from '@/components/card/card';
import { formatCurrencyLocale } from '@/lib/utils/string-utils';
import type { ProgramDashboardStats } from '@/modules/programs/program.types';
import { DonationForm } from './donation-form';
import { SectionBox } from './section-box';
import { SectionTitle } from './section-title';
import { StatProgressCard } from './stat-progress-card';

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
					<SectionBox>
						<StatProgressCard
							title="You need to cover the first interval to start the program"
							leftLabel="Current Contributions"
							rightLabel="Minimum Required"
							leftValue={formatCurrencyLocale(stats.contributedToProgramSoFarChf, 'CHF', 'de-CH', {
								compactThreshold: 1_000_000,
							})}
							rightValue={formatCurrencyLocale(stats.costPerIntervalChf, 'CHF', 'de-CH', {
								compactThreshold: 1_000_000,
							})}
							percent={percent}
						/>
					</SectionBox>

					<SectionBox>
						<DonationForm costPerIntervalChf={stats.costPerIntervalChf} programId={programId} />
					</SectionBox>
				</div>
			</Card>
		</div>
	);
};
