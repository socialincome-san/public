import { Badge } from '@/components/badge';
import { Progress } from '@/components/progress';
import type { ProgramDetailLabels } from '@/components/storyblok/program/program-detail-labels';
import { ProgramDetailPill } from '@/components/storyblok/program/program-detail-pill';
import { type WebsiteLanguage, getSafeNumberFormatLocale } from '@/lib/i18n/utils';
import type { ProgramDashboardStats } from '@/lib/services/program-stats/program-stats.types';
import { formatNumberLocale } from '@/lib/utils/string-utils';
import { TriangleAlert } from 'lucide-react';

type Props = {
	stats: ProgramDashboardStats;
	labels: ProgramDetailLabels;
	lang: WebsiteLanguage;
};

const formatAmount = (amount: number, locale: string, maximumFractionDigits = 0): string => {
	return formatNumberLocale(amount, locale, {
		minimumFractionDigits: maximumFractionDigits,
		maximumFractionDigits,
	});
};

const clampPercent = (value: number): number => {
	if (!Number.isFinite(value)) {
		return 0;
	}

	return Math.min(100, Math.max(0, value));
};

export const ProgramFinances = ({ stats, labels, lang }: Props) => {
	const locale = getSafeNumberFormatLocale(lang);
	const currency = stats.payoutCurrency;
	const sentToRecipients = formatAmount(stats.paidOutSoFarProgramCurrency, locale);
	const totalProgramCosts = formatAmount(stats.totalProgramCostsProgramCurrency, locale);
	const availableCredits = formatAmount(stats.availableCreditsProgramCurrency, locale, 2);
	const progressPercent = clampPercent(stats.payoutProgressPercent);
	const showLowCreditsWarning = stats.availableCreditsInIntervals <= 3;

	return (
		<div className="flex flex-col gap-6 rounded-xl bg-white px-10 py-8 shadow-lg">
			<div className="flex items-center justify-between">
				<h2 className="text-foreground text-xl font-bold">{labels.finances}</h2>
				<ProgramDetailPill label={labels.viewBreakdown} />
			</div>

			<div className="text-foreground flex items-end justify-between">
				<div className="flex flex-col gap-3.5">
					<p className="text-xs">{labels.sentToRecipients}</p>
					<p>
						<span className="text-sm font-bold">{currency}</span>{' '}
						<span className="text-3xl font-medium">{sentToRecipients}</span>
					</p>
				</div>
				<div className="flex flex-col items-end gap-3.5">
					<p className="text-xs">{labels.totalProgramCosts}</p>
					<p>
						<span className="text-sm font-bold">{currency}</span>{' '}
						<span className="text-3xl font-medium">{totalProgramCosts}</span>
					</p>
				</div>
			</div>

			<Progress value={progressPercent} />

			<div className="flex items-center justify-between pt-2">
				<p className="text-foreground text-sm">{labels.availableCredits}</p>
				<div className="flex items-center gap-2">
					{showLowCreditsWarning ? (
						<Badge variant="secondary" className="rounded-full p-1.5">
							<TriangleAlert className="size-3" />
						</Badge>
					) : null}
					<p className="text-foreground text-sm font-bold">
						{currency} {availableCredits}
					</p>
				</div>
			</div>
		</div>
	);
};
