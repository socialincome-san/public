import { Currency } from '@/generated/prisma/enums';
import { formatCurrencyLocale } from '@/lib/utils/string-utils';
import type { ProgramDashboardStats } from '@/modules/programs/program.types';
import { BreakdownList, BreakdownRow } from '@socialincome/design-system/data-display/breakdown-list/breakdown-list';
import { Card } from '@socialincome/design-system/data-display/card/card';
import { StatProgress } from '@socialincome/design-system/data-display/stat-progress/stat-progress';
import { Stat } from '@socialincome/design-system/data-display/stat/stat';

const formatAmount = (amount: number) =>
	formatCurrencyLocale(amount, Currency.CHF, 'de-CH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export const ProgramFinanceSummaryCards = ({ stats }: { stats: ProgramDashboardStats }) => {
	const projectedRemaining = stats.totalProgramCostsChf - stats.paidOutSoFarChf;
	const payoutProgressPercent =
		stats.totalProgramCostsChf > 0 ? (stats.paidOutSoFarChf / stats.totalProgramCostsChf) * 100 : 0;

	return (
		<div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
			<Card padding="compact" elevation="flat" fullHeight>
				<div className="flex flex-col gap-6">
					<Stat
						label="Total income"
						size="lg"
						value={formatAmount(stats.contributedToProgramSoFarChf)}
						info="Total succeeded contributions linked to this program."
					/>

					<BreakdownList ariaLabel="Income sources">
						<BreakdownRow
							label="Stripe"
							value={formatAmount(stats.contributedViaStripeChf)}
							description="Contributions paid through Stripe."
						/>
						<BreakdownRow
							label="Bank transfers"
							value={formatAmount(stats.contributedViaWireTransferChf)}
							description="Contributions paid by bank transfer."
						/>
						<BreakdownRow
							label="Other"
							value={formatAmount(stats.contributedViaOthersChf)}
							description="Contributions from other or unclassified payment methods."
						/>
					</BreakdownList>

					<div className="border-border border-t pt-4">
						<Stat
							label="Available credits"
							value={formatAmount(stats.availableCreditsChf)}
							info="Succeeded contributions minus paid and confirmed payouts."
						/>
					</div>
				</div>
			</Card>

			<Card padding="compact" elevation="flat" fullHeight>
				<div className="flex flex-col gap-8">
					<Stat
						label="Total program costs"
						size="lg"
						value={formatAmount(stats.totalProgramCostsChf)}
						info="Paid out so far plus projected remaining payouts for active and future recipients."
					/>

					<StatProgress
						title="Payout progress"
						start={{ label: 'Paid out', value: formatAmount(stats.paidOutSoFarChf) }}
						end={{ label: 'Projected total', value: formatAmount(stats.totalProgramCostsChf) }}
						percent={payoutProgressPercent}
					/>

					<Stat label="Projected remaining" value={formatAmount(projectedRemaining)} />
				</div>
			</Card>
		</div>
	);
};
