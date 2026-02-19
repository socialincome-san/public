import { Card } from '@/components/card';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/tool-tip';
import type { ProgramDashboardStats } from '@/lib/services/program-stats/program-stats.types';
import { formatCurrency } from '@/lib/utils/string-utils';
import { format } from 'date-fns';
import { AlertCircle, CheckCircle, TriangleAlert } from 'lucide-react';
import { AdditionalNumbers } from './additional-numbers';
import { SectionBox } from './section-box';
import { SectionTitle } from './section-title';
import { Stat } from './stat';
import { StatProgressCard } from './stat-progress-card';

type StatsSectionProps = { programId: string; stats: ProgramDashboardStats };

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
			return 'Available credits are below 1 interval. Fund at least the first interval to start payouts.';
		}
		if (creditsInIntervals >= totalExpected) {
			return 'Credits cover all expected intervals for the program.';
		}
		if (creditsInIntervals > 3) {
			return 'Credits cover more than 3 intervals, providing a healthy buffer.';
		}
		if (creditsInIntervals >= 1) {
			return 'Credits cover 1–3 intervals. Consider adding funding to improve the buffer.';
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
										leftValue={formatCurrency(stats.contributedToProgramSoFarChf)}
										rightValue={formatCurrency(stats.totalProgramCostsChf)}
										percent={stats.fundingProgressPercent}
									/>
								</div>
								<AdditionalNumbers>
									<Stat label="Contributors" value={stats.contributorsCount} />
									<Stat label="Contributions" value={stats.contributionsCount} />
									<Stat label="Avg Contribution" value={formatCurrency(stats.averageContributionChf)} />
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
										leftValue={formatCurrency(stats.paidOutSoFarChf)}
										rightValue={formatCurrency(stats.totalProgramCostsChf)}
										percent={stats.payoutProgressPercent}
									/>
								</div>
								<AdditionalNumbers>
									<Stat label="Recipients" value={stats.recipientsCount} />
									<Stat label="Payout / Interval" value={`${stats.payoutPerInterval} ${stats.payoutCurrency}`} />
									<Stat label="Interval" value={stats.payoutInterval} />
									<Stat label="Cost / Interval" value={formatCurrency(stats.costPerIntervalChf)} />
								</AdditionalNumbers>
							</div>
						</SectionBox>

						<SectionBox className="h-full">
							<div className="flex h-full flex-col">
								<div className="flex-1 space-y-6">
									<h2 className="text-lg font-semibold">Available Credits</h2>
									<div className="text-xl font-semibold">{`${stats.availableCreditsInIntervals.toFixed(1)} intervals`}</div>
								</div>
								<AdditionalNumbers>
									<div>
										<p className="text-muted-foreground text-xs">Available Credits</p>
										<p className="font-medium">{formatCurrency(stats.availableCreditsChf)}</p>
									</div>
									<div>
										<p className="text-muted-foreground text-xs">Cost / Interval</p>
										<p className="font-medium">{formatCurrency(stats.costPerIntervalChf)}</p>
									</div>
									<div>
										<p className="text-muted-foreground text-xs">Credit Status</p>
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
								</AdditionalNumbers>
							</div>
						</SectionBox>
					</div>

					<div className="grid grid-cols-1 items-stretch gap-6 lg:grid-cols-2">
						<SectionBox href={`/portal/programs/${programId}/surveys`}>
							<StatProgressCard
								title="Survey Progress"
								leftLabel="Completed Surveys"
								rightLabel="Total Surveys"
								leftValue={`${stats.completedSurveysCount}`}
								rightValue={`${stats.totalSurveysCount}`}
								percent={stats.surveyCompletionPercent}
							/>
						</SectionBox>

						<SectionBox>
							<StatProgressCard
								title="Lifecycle Progress"
								leftLabel="Start Date"
								rightLabel="End Date"
								leftValue={stats.firstPayoutDate ? format(stats.firstPayoutDate, 'dd.MM.yyyy') : '—'}
								rightValue={stats.programEndDate ? format(stats.programEndDate, 'dd.MM.yyyy') : '—'}
								percent={stats.lifecycleProgressPercent}
							/>
						</SectionBox>
					</div>
				</div>
			</Card>
		</div>
	);
};
