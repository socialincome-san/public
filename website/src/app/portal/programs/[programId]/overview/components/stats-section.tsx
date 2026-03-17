import { Card } from '@/components/card';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/tool-tip';
import type { ProgramDashboardStats } from '@/lib/services/program-stats/program-stats.types';
import { formatCurrencyLocale, formatNumberLocale } from '@/lib/utils/string-utils';
import { AlertCircle, CheckCircle, CircleHelp, TriangleAlert } from 'lucide-react';
import { AdditionalNumbers } from './additional-numbers';
import { SectionBox } from './section-box';
import { SectionTitle } from './section-title';
import { Stat } from './stat';
import { StatProgressCard } from './stat-progress-card';

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
			return { Icon: TriangleAlert, color: 'text-red-600' };
		}
		if (creditsInIntervals >= totalExpected) {
			return { Icon: CheckCircle, color: 'text-green-600' };
		}
		if (creditsInIntervals > 3) {
			return { Icon: CheckCircle, color: 'text-green-600' };
		}
		if (creditsInIntervals >= 1) {
			return { Icon: AlertCircle, color: 'text-amber-600' };
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
						<SectionBox href="/portal/management/contributions" className="h-full">
							<div className="flex h-full flex-col">
								<div className="flex-1 space-y-6">
									<StatProgressCard
										title="Contributions Progress"
										leftLabel="Total Contributions"
										rightLabel="Total Program Cost"
										leftTooltipText={totalContributionsExplanation}
										rightTooltipText={totalProgramCostChfExplanation}
										leftValue={formatMoney(stats.contributedToProgramSoFarChf, 'CHF')}
										rightValue={formatMoney(stats.totalProgramCostsChf, 'CHF')}
										percent={stats.fundingProgressPercent}
									/>
								</div>
								<AdditionalNumbers>
									<Stat
										label="Contributors"
										value={formatNumber(stats.contributorsCount)}
										tooltipText={contributorsExplanation}
									/>
									<Stat
										label="Contributions"
										value={formatNumber(stats.contributionsCount)}
										tooltipText={contributionsExplanation}
									/>
									<Stat
										label="Avg Contribution"
										value={formatMoney(stats.averageContributionChf, 'CHF')}
										tooltipText={averageContributionExplanation}
									/>
									<Stat
										label="Via Stripe"
										value={formatMoney(stats.contributedViaStripeChf, 'CHF')}
										tooltipText={contributedViaStripeExplanation}
									/>
									<Stat
										label="Via Wire Transfer"
										value={formatMoney(stats.contributedViaWireTransferChf, 'CHF')}
										tooltipText={contributedViaWireTransferExplanation}
									/>
									<Stat
										label="Others"
										value={formatMoney(stats.contributedViaOthersChf, 'CHF')}
										tooltipText={contributedViaOthersExplanation}
									/>
								</AdditionalNumbers>
							</div>
						</SectionBox>

						<SectionBox href="/portal/delivery/make-payouts" className="h-full">
							<div className="flex h-full flex-col">
								<div className="flex-1 space-y-6">
									<StatProgressCard
										title="Payout Progress"
										leftLabel="Paid out so far"
										rightLabel="Total Program Cost"
										leftTooltipText={paidOutSoFarExplanation}
										rightTooltipText={totalProgramCostProgramCurrencyExplanation}
										leftValue={formatMoney(stats.paidOutSoFarProgramCurrency, stats.payoutCurrency)}
										rightValue={formatMoney(stats.totalProgramCostsProgramCurrency, stats.payoutCurrency)}
										percent={stats.payoutProgressPercent}
									/>
								</div>
								<AdditionalNumbers>
									<Stat
										label="Payout / Interval"
										value={formatMoney(stats.payoutPerInterval, stats.payoutCurrency)}
										tooltipText={payoutPerIntervalExplanation}
									/>
									<Stat label="Interval" value={stats.payoutInterval} tooltipText={payoutIntervalExplanation} />
									<Stat
										label="Program Duration"
										value={`${formatNumber(stats.programDurationInMonths)} months`}
										tooltipText={programDurationExplanation}
									/>
									<Stat
										label="Projected Remaining"
										value={formatMoney(projectedRemainingProgramCurrency, stats.payoutCurrency)}
										tooltipText={projectedRemainingExplanation}
									/>
									<Stat
										label="Payouts Done"
										value={formatNumber(stats.payoutsDoneCount)}
										tooltipText={payoutsDoneExplanation}
									/>
									<Stat
										label="Remaining Payouts"
										value={formatNumber(stats.remainingPayoutsCount)}
										tooltipText={remainingPayoutsExplanation}
									/>
								</AdditionalNumbers>
							</div>
						</SectionBox>

						<SectionBox href={`/portal/programs/${programId}/payout-forecast`} className="h-full">
							<div className="flex h-full flex-col">
								<div className="flex-1 space-y-6">
									<h2 className="text-lg font-semibold">Available Credits</h2>
									<div className="flex items-center gap-2 text-xl font-semibold">
										<span>{`${formatNumber(stats.availableCreditsInIntervals, 1)} intervals`}</span>
										<Tooltip>
											<TooltipTrigger asChild>
												<button
													type="button"
													aria-label="Show available intervals calculation"
													className="text-muted-foreground hover:text-foreground inline-flex"
												>
													<CircleHelp className="h-4 w-4" />
												</button>
											</TooltipTrigger>
											<TooltipContent sideOffset={8} className="max-w-[340px] text-sm">
												{intervalsExplanation}
											</TooltipContent>
										</Tooltip>
									</div>
								</div>
								<AdditionalNumbers>
									<Stat
										label="Available Credits"
										value={formatMoney(stats.availableCreditsProgramCurrency, stats.payoutCurrency)}
										tooltipText={availableCreditsExplanation}
									/>
									<Stat
										label="Cost / Interval"
										value={formatMoney(stats.costPerIntervalProgramCurrency, stats.payoutCurrency)}
										tooltipText={costPerIntervalProgramExplanation}
									/>
									<div>
										<div className="text-muted-foreground flex items-center gap-1 text-xs">
											<p>Credit Status</p>
											<Tooltip>
												<TooltipTrigger asChild>
													<button
														type="button"
														aria-label="Show credit status explanation"
														className="text-muted-foreground hover:text-foreground inline-flex"
													>
														<CircleHelp className="h-3 w-3" />
													</button>
												</TooltipTrigger>
												<TooltipContent sideOffset={8} className="max-w-[280px] text-sm">
													{creditStatusLabelExplanation}
												</TooltipContent>
											</Tooltip>
										</div>
										<Tooltip>
											<TooltipTrigger asChild>
												<div className="flex items-center gap-2 font-medium">
													<Icon className={`${color} h-4 w-4`} aria-hidden />
													<span>{creditStatus}</span>
												</div>
											</TooltipTrigger>
											<TooltipContent sideOffset={8}>{creditExplanation}</TooltipContent>
										</Tooltip>
									</div>
									<Stat
										label="Remaining Intervals"
										value={formatNumber(stats.remainingIntervalsCount)}
										tooltipText={remainingIntervalsExplanation}
									/>
								</AdditionalNumbers>
							</div>
						</SectionBox>
					</div>

					<div className="grid grid-cols-1 items-stretch gap-6 lg:grid-cols-2">
						<SectionBox href={`/portal/programs/${programId}/recipients`}>
							<div className="space-y-6">
								<h2 className="text-lg font-semibold">Recipient Status</h2>
								<div className="flex items-center gap-2 text-xl font-semibold">
									<span>{formatNumber(stats.recipientsCount)} recipients</span>
									<Tooltip>
										<TooltipTrigger asChild>
											<button
												type="button"
												aria-label="Show recipients total explanation"
												className="text-muted-foreground hover:text-foreground inline-flex"
											>
												<CircleHelp className="h-3.5 w-3.5" />
											</button>
										</TooltipTrigger>
										<TooltipContent sideOffset={8} className="max-w-[280px] text-sm">
											{recipientsTotalExplanation}
										</TooltipContent>
									</Tooltip>
								</div>
								<AdditionalNumbers>
									<Stat
										label="Future"
										value={formatNumber(stats.futureRecipientsCount)}
										tooltipText={futureRecipientsExplanation}
									/>
									<Stat
										label="Active"
										value={formatNumber(stats.activeRecipientsCount)}
										tooltipText={activeRecipientsExplanation}
									/>
									<Stat
										label="Suspended"
										value={formatNumber(stats.suspendedRecipientsCount)}
										tooltipText={suspendedRecipientsExplanation}
									/>
									<Stat
										label="Completed"
										value={formatNumber(stats.completedRecipientsCount)}
										tooltipText={completedRecipientsExplanation}
									/>
								</AdditionalNumbers>
							</div>
						</SectionBox>

						<SectionBox href={`/portal/programs/${programId}/surveys`}>
							<StatProgressCard
								title="Survey Progress"
								leftLabel="Completed Surveys"
								rightLabel="Total Surveys"
								leftTooltipText={completedSurveysExplanation}
								rightTooltipText={totalSurveysExplanation}
								leftValue={formatNumber(stats.completedSurveysCount)}
								rightValue={formatNumber(stats.totalSurveysCount)}
								percent={stats.surveyCompletionPercent}
							/>
						</SectionBox>
					</div>
				</div>
			</Card>
		</div>
	);
};
