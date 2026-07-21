import { Progress } from '@/components/progress';
import type { Translator } from '@/lib/i18n/translator';
import { type WebsiteLanguage, getSafeNumberFormatLocale } from '@/lib/i18n/utils';
import type { ProgramFinancesDisplayAmounts } from '@/lib/services/program-stats/program-stats.types';
import { formatCompactNumberLocale } from '@/lib/utils/string-utils';

type Props = {
	displayAmounts: ProgramFinancesDisplayAmounts;
	translator: Translator;
	lang: WebsiteLanguage;
	embedded?: boolean;
};

const clampPercent = (value: number): number => {
	if (!Number.isFinite(value)) {
		return 0;
	}

	return Math.min(100, Math.max(0, value));
};

export const ProgramFinancesCard = ({ displayAmounts, translator, lang, embedded = false }: Props) => {
	const locale = getSafeNumberFormatLocale(lang);
	const currency = displayAmounts.currency;
	const sentToRecipients = formatCompactNumberLocale(displayAmounts.paidOutSoFar, locale);
	const totalProgramCosts = formatCompactNumberLocale(displayAmounts.totalProgramCosts, locale);
	const progressPercent = clampPercent(
		displayAmounts.totalProgramCosts > 0 ? (displayAmounts.paidOutSoFar / displayAmounts.totalProgramCosts) * 100 : 0,
	);

	const content = (
		<>
			<div className="text-foreground flex items-end justify-between">
				<div className="flex flex-col gap-3.5">
					<p className="text-xs">{translator.t('program-detail-page.sent-to-recipients')}</p>
					<p className="flex items-baseline gap-1">
						<span className="text-sm font-bold">{currency}</span>
						<span className="text-2xl">{sentToRecipients}</span>
					</p>
				</div>
				<div className="flex flex-col items-end gap-3.5">
					<p className="text-xs">{translator.t('program-detail-page.total-program-costs')}</p>
					<p className="flex items-baseline gap-1">
						<span className="text-sm font-bold">{currency}</span>
						<span className="text-2xl">{totalProgramCosts}</span>
					</p>
				</div>
			</div>

			<Progress value={progressPercent} />
		</>
	);

	if (embedded) {
		return <div className="flex flex-col gap-6">{content}</div>;
	}

	return <div className="bg-card flex flex-col gap-6 rounded-xl px-10 py-8 shadow-lg">{content}</div>;
};
