import { Card } from '@/components/card';
import type { ProgramDashboardStats } from '@/lib/services/program-stats/program-stats.types';
import { formatCurrency } from '@/lib/utils/string-utils';
import { CardContent } from './card-content';
import { DonationForm } from './donation-form';
import { SectionBox } from './section-box';
import { SectionTitle } from './section-title';

type FirstIntervalFundingSectionProps = { programId: string; stats: ProgramDashboardStats };

export function FirstIntervalFundingSection({ programId, stats }: FirstIntervalFundingSectionProps) {
	const percent =
		stats.costPerIntervalChf > 0
			? Math.min(100, (stats.contributedToProgramSoFarChf / stats.costPerIntervalChf) * 100)
			: 0;

	return (
		<div className="space-y-4">
			<SectionTitle>First Interval Funding</SectionTitle>
			<Card>
				<div className="space-y-6">
					<SectionBox>
						<CardContent
							title="You need to cover the first interval to start the program"
							leftLabel="Current Contributions"
							rightLabel="Minimum Required"
							leftValue={formatCurrency(stats.contributedToProgramSoFarChf)}
							rightValue={formatCurrency(stats.costPerIntervalChf)}
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
}
