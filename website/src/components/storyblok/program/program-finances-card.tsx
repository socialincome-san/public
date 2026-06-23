import { Badge } from '@/components/badge';
import { Progress } from '@/components/progress';
import type { Translator } from '@/lib/i18n/translator';
import { type WebsiteLanguage, getSafeNumberFormatLocale } from '@/lib/i18n/utils';
import type { ProgramDashboardStats, ProgramFinancesDisplayAmounts } from '@/lib/services/program-stats/program-stats.types';
import { formatCompactNumberLocale, formatNumberLocale } from '@/lib/utils/string-utils';
import { TriangleAlert } from 'lucide-react';

type Props = {
	stats: ProgramDashboardStats;
	displayAmounts: ProgramFinancesDisplayAmounts;
	translator: Translator;
	lang: WebsiteLanguage;
	embedded?: boolean;
};

const formatAmount = (amount: number, locale: string, fractionDigits = 0): string =>
	formatNumberLocale(amount, locale, {
		minimumFractionDigits: fractionDigits,
		maximumFractionDigits: fractionDigits,
	});

const clampPercent = (value: number): number => {
	if (!Number.isFinite(value)) {
		return 0;
	}

	return Math.min(100, Math.max(0, value));
};

export const ProgramFinancesCard = ({ stats, displayAmounts, translator, lang, embedded = false }: Props) => {
	const locale = getSafeNumberFormatLocale(lang);
	const currency = displayAmounts.currency;
	const sentToRecipients = formatCompactNumberLocale(displayAmounts.paidOutSoFar, locale);
	const totalProgramCosts = formatCompactNumberLocale(displayAmounts.totalProgramCosts, locale);
	const availableCredits = formatAmount(displayAmounts.availableCredits, locale, 2);
	const progressPercent = clampPercent(stats.payoutProgressPercent);
	const showLowCreditsWarning = stats.availableCreditsInIntervals <= 3;

	const content = (
		<>
			<div className="text-foreground flex items-end justify-between">
				<div className="flex flex-col gap-3.5">
					<p className="text-xs">{translator.t('program-detail-page.sent-to-recipients')}</p>
					<p className="flex items-baseline gap-1">
						<span className="text-sm font-bold">{currency}</span>
						<span className="text-xl">{sentToRecipients}</span>
					</p>
				</div>
				<div className="flex flex-col items-end gap-3.5">
					<p className="text-xs">{translator.t('program-detail-page.total-program-costs')}</p>
					<p className="flex items-baseline gap-1">
						<span className="text-sm font-bold">{currency}</span>
						<span className="text-xl">{totalProgramCosts}</span>
					</p>
				</div>
			</div>

			<Progress value={progressPercent} />

			<div className="flex items-center justify-between pt-2">
				<p className="text-foreground text-sm">{translator.t('program-detail-page.available-credits')}</p>
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
		</>
	);

	if (embedded) {
		return <div className="flex flex-col gap-6">{content}</div>;
	}

	return <div className="bg-card flex flex-col gap-6 rounded-xl px-10 py-8 shadow-lg">{content}</div>;
};
