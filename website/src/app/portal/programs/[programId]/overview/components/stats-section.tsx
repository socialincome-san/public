import { formatCurrencyLocale, formatNumberLocale } from '@/lib/utils/string-utils';
import type { ProgramDashboardStats } from '@/modules/programs/program.types';
import { cn } from '@socialincome/design-system/cn';
import { Card } from '@socialincome/design-system/data-display/card/card';
import { StatGrid } from '@socialincome/design-system/data-display/stat-grid/stat-grid';
import { StatHeadline } from '@socialincome/design-system/data-display/stat-headline/stat-headline';
import { StatPanel } from '@socialincome/design-system/data-display/stat-panel/stat-panel';
import { StatProgress } from '@socialincome/design-system/data-display/stat-progress/stat-progress';
import { Stat } from '@socialincome/design-system/data-display/stat/stat';
import { Tooltip, TooltipContent, TooltipTrigger } from '@socialincome/design-system/overlays/tool-tip/tool-tip';
import { AlertCircle, CheckCircle, TriangleAlert } from 'lucide-react';
import { SectionTitle } from './section-title';

type StatsSectionProps = {
	programId: string;
	stats: ProgramDashboardStats;
};

export const StatsSection = ({ programId, stats }: StatsSectionProps) => {
	const getCreditStatusLabel = (creditsInIntervals: number, totalExpected: number) => {
		if (creditsInIntervals < 1) {
			return 'Not secured';
		}
		if (creditsInIntervals >= totalExpected) {
			return 'Fully funded';
		}
		if (creditsInIntervals > 3) {
			return 'Healthy credits';
		}
		if (creditsInIntervals >= 1) {
			return 'Low credits';
		}

		return '';
	};

	const getCreditStatusExplanation = (creditsInIntervals: number, totalExpected: number) => {
		if (creditsInIntervals < 1) {
			return 'Available credits are below one interval. Add funding to cover the first interval and start payouts.';
		}
		if (creditsInIntervals >= totalExpected) {
			return 'Credits cover all expected intervals for the program.';
		}
		if (creditsInIntervals > 3) {
			return 'Credits cover more than a few intervals, providing a healthy buffer.';
		}
		if (creditsInIntervals >= 1) {
			return 'Credits cover only a small number of intervals. Consider adding funding to improve the buffer.';
		}

		return '';
	};

	const getCreditIcon = (creditsInIntervals: number, totalExpected: number) => {
		if (creditsInIntervals < 1) {
			return { Icon: TriangleAlert, color: 'text-destructive' };
		}
		if (creditsInIntervals >= totalExpected) {
			return { Icon: CheckCircle, color: 'text-confirm' };
		}
		if (creditsInIntervals > 3) {
			return { Icon: CheckCircle, color: 'text-confirm' };
		}
		if (creditsInIntervals >= 1) {
			return { Icon: AlertCircle, color: 'text-warning' };
		}

		return { Icon: AlertCircle, color: 'text-muted-foreground' };
	};

	const { Icon, color } = getCreditIcon(stats.availableCreditsInIntervals, stats.totalExpectedIntervals);
	const creditStatus = getCreditStatusLabel(stats.availableCreditsInIntervals, stats.totalExpectedIntervals);
	const creditExplanation = getCreditStatusExplanation(stats.availableCreditsInIntervals, stats.totalExpectedIntervals);
	const projectedRemainingProgramCurrency = stats.totalProgramCostsProgramCurrency - stats.paidOutSoFarProgramCurrency;
	const formatMoney = (amount: number, currency: string) =>
		formatCurrencyLocale(amount, currency, 'de-CH', { compactThreshold: 1_000_000 });
	const formatNumber = (value: number, maximumFractionDigits = 0) =>
		formatNumberLocale(value, 'de-CH', { maximumFractionDigits, compactThreshold: 1_000_000 });
	const intervalsExplanation =
		'Available credits in CHF are succeeded contributions minus paid and confirmed payouts. ' +
		'Available intervals are available credits divided by cost per interval.';
	const totalContributionsExplanation =
		'Total contributions are the sum of contribution amounts in CHF where status is succeeded.';
	const totalProgramCostChfExplanation =
		'Total program cost in CHF is paid out so far plus projected remaining payouts. ' +
		'Projected remaining uses active and future recipients and current program settings for duration, interval, and payout amount.';
	const paidOutSoFarExplanation = 'Paid out so far is the sum of payout amounts where status is paid or confirmed.';
	const totalProgramCostProgramCurrencyExplanation =
		'Total program cost in program currency is paid out so far plus projected remaining payouts. ' +
		'Projected remaining uses current payout amount, interval, and expected intervals.';
	const contributorsExplanation =
		'Contributors is the distinct count of contributor identifiers across succeeded contributions.';
	const contributionsExplanation = 'Contributions is the count of contribution records with succeeded status.';
	const averageContributionExplanation =
		'Average contribution is total succeeded contributions in CHF divided by succeeded contributions count.';
	const contributedViaStripeExplanation =
		'Via Stripe is the CHF sum of succeeded contributions with payment event type stripe.';
	const contributedViaWireTransferExplanation =
		'Via wire transfer is the CHF sum of succeeded contributions with payment event type bank transfer.';
	const contributedViaOthersExplanation =
		'Others is the CHF sum of succeeded contributions with payment event types other than stripe or bank transfer, including entries without a payment event.';
	const payoutPerIntervalExplanation = 'Payout per interval is the current payout amount configured for the program.';
	const payoutIntervalExplanation = 'Interval is the current payout cadence configured for the program.';
	const programDurationExplanation = 'Program duration is the currently configured runtime in months.';
	const costPerIntervalProgramExplanation =
		'Cost per interval is active recipients multiplied by payout per interval, shown in the program currency.';
	const projectedRemainingExplanation =
		'For each active or future recipient, remaining payouts are expected payouts minus already paid or confirmed payouts, with a minimum of zero. ' +
		'Projected remaining amount is remaining payouts multiplied by payout per interval, then summed.';
	const payoutsDoneExplanation = 'Payouts done counts all payout records, independent of payout status.';
	const remainingPayoutsExplanation =
		'Remaining payouts is the total number of payouts still expected for active and future recipients until completion.';
	const availableCreditsExplanation =
		'Available credits in program currency are derived from available credits in CHF and converted with latest exchange rates.';
	const creditStatusLabelExplanation =
		'Credit status is based on available intervals compared with status thresholds and expected intervals.';
	const remainingIntervalsExplanation =
		'Remaining intervals is the highest remaining interval count across active and future recipients.';
	const recipientsTotalExplanation = 'Recipients is the total number of recipients linked to this program.';
	const futureRecipientsExplanation = 'Future recipients have a start date in the future and are not yet payout eligible.';
	const activeRecipientsExplanation = 'Active recipients are started, not suspended, and not completed.';
	const suspendedRecipientsExplanation =
		'Suspended recipients have a suspension date at or before now and are not counted as active.';
	const completedRecipientsExplanation =
		'Completed recipients have paid or confirmed payout count at least equal to expected intervals for the current program setup.';
	const completedSurveysExplanation = 'Completed surveys counts surveys with completed status.';
	const totalSurveysExplanation = 'Total surveys counts all surveys linked to recipients in this program.';

	return (
		<div className="space-y-4">
			<SectionTitle>Statistics</SectionTitle>

			<Card>
				<div className="space-y-6">
					<div className="grid grid-cols-1 items-stretch gap-6 lg:grid-cols-3">
						<StatPanel href="/portal/management/contributions">
							<StatProgress
								title="Contributions Progress"
								start={{
									label: 'Total Contributions',
									value: formatMoney(stats.contributedToProgramSoFarChf, 'CHF'),
									info: totalContributionsExplanation,
								}}
								end={{
									label: 'Total Program Cost',
									value: formatMoney(stats.totalProgramCostsChf, 'CHF'),
									info: totalProgramCostChfExplanation,
								}}
								percent={stats.fundingProgressPercent}
							/>
							<StatGrid>
								<Stat label="Contributors" value={formatNumber(stats.contributorsCount)} info={contributorsExplanation} />
								<Stat label="Contributions" value={formatNumber(stats.contributionsCount)} info={contributionsExplanation} />
								<Stat
									label="Avg Contribution"
									value={formatMoney(stats.averageContributionChf, 'CHF')}
									info={averageContributionExplanation}
								/>
								<Stat
									label="Via Stripe"
									value={formatMoney(stats.contributedViaStripeChf, 'CHF')}
									info={contributedViaStripeExplanation}
								/>
								<Stat
									label="Via Wire Transfer"
									value={formatMoney(stats.contributedViaWireTransferChf, 'CHF')}
									info={contributedViaWireTransferExplanation}
								/>
								<Stat
									label="Others"
									value={formatMoney(stats.contributedViaOthersChf, 'CHF')}
									info={contributedViaOthersExplanation}
								/>
							</StatGrid>
						</StatPanel>

						<StatPanel href="/portal/delivery/payouts">
							<StatProgress
								title="Payout Progress"
								start={{
									label: 'Paid out so far',
									value: formatMoney(stats.paidOutSoFarProgramCurrency, stats.payoutCurrency),
									info: paidOutSoFarExplanation,
								}}
								end={{
									label: 'Total Program Cost',
									value: formatMoney(stats.totalProgramCostsProgramCurrency, stats.payoutCurrency),
									info: totalProgramCostProgramCurrencyExplanation,
								}}
								percent={stats.payoutProgressPercent}
							/>
							<StatGrid>
								<Stat
									label="Payout / Interval"
									value={formatMoney(stats.payoutPerInterval, stats.payoutCurrency)}
									info={payoutPerIntervalExplanation}
								/>
								<Stat label="Interval" value={stats.payoutInterval} info={payoutIntervalExplanation} />
								<Stat
									label="Program Duration"
									value={`${formatNumber(stats.programDurationInMonths)} months`}
									info={programDurationExplanation}
								/>
								<Stat
									label="Projected Remaining"
									value={formatMoney(projectedRemainingProgramCurrency, stats.payoutCurrency)}
									info={projectedRemainingExplanation}
								/>
								<Stat label="Payouts Done" value={formatNumber(stats.payoutsDoneCount)} info={payoutsDoneExplanation} />
								<Stat
									label="Remaining Payouts"
									value={formatNumber(stats.remainingPayoutsCount)}
									info={remainingPayoutsExplanation}
								/>
							</StatGrid>
						</StatPanel>

						<StatPanel href={`/portal/programs/${programId}/payout-forecast`}>
							<StatHeadline
								title="Available Credits"
								value={`${formatNumber(stats.availableCreditsInIntervals, 1)} intervals`}
								info={{ label: 'Show available intervals calculation', content: intervalsExplanation }}
							/>
							<StatGrid>
								<Stat
									label="Available Credits"
									value={formatMoney(stats.availableCreditsProgramCurrency, stats.payoutCurrency)}
									info={availableCreditsExplanation}
								/>
								<Stat
									label="Cost / Interval"
									value={formatMoney(stats.costPerIntervalProgramCurrency, stats.payoutCurrency)}
									info={costPerIntervalProgramExplanation}
								/>
								<Stat
									label="Credit Status"
									info={creditStatusLabelExplanation}
									value={
										<Tooltip>
											<TooltipTrigger asChild>
												<span className="flex items-center gap-2">
													<Icon className={cn(color, 'h-4 w-4')} aria-hidden />
													<span>{creditStatus}</span>
												</span>
											</TooltipTrigger>
											<TooltipContent sideOffset={8}>{creditExplanation}</TooltipContent>
										</Tooltip>
									}
								/>
								<Stat
									label="Remaining Intervals"
									value={formatNumber(stats.remainingIntervalsCount)}
									info={remainingIntervalsExplanation}
								/>
							</StatGrid>
						</StatPanel>
					</div>

					<div className="grid grid-cols-1 items-stretch gap-6 lg:grid-cols-2">
						<StatPanel href={`/portal/programs/${programId}/recipients`}>
							<StatHeadline
								title="Recipient Status"
								value={`${formatNumber(stats.recipientsCount)} recipients`}
								info={{ label: 'Show recipients total explanation', content: recipientsTotalExplanation }}
							/>
							<StatGrid>
								<Stat label="Future" value={formatNumber(stats.futureRecipientsCount)} info={futureRecipientsExplanation} />
								<Stat label="Active" value={formatNumber(stats.activeRecipientsCount)} info={activeRecipientsExplanation} />
								<Stat
									label="Suspended"
									value={formatNumber(stats.suspendedRecipientsCount)}
									info={suspendedRecipientsExplanation}
								/>
								<Stat
									label="Completed"
									value={formatNumber(stats.completedRecipientsCount)}
									info={completedRecipientsExplanation}
								/>
							</StatGrid>
						</StatPanel>

						<StatPanel href={`/portal/programs/${programId}/surveys`}>
							<StatProgress
								title="Survey Progress"
								start={{
									label: 'Completed Surveys',
									value: formatNumber(stats.completedSurveysCount),
									info: completedSurveysExplanation,
								}}
								end={{
									label: 'Total Surveys',
									value: formatNumber(stats.totalSurveysCount),
									info: totalSurveysExplanation,
								}}
								percent={stats.surveyCompletionPercent}
							/>
						</StatPanel>
					</div>
				</div>
			</Card>
		</div>
	);
};
