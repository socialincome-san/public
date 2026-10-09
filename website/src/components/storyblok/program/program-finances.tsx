import { ProgramFinancesCard } from '@/components/storyblok/program/program-finances-card';
import { ProgramFinancesDialog } from '@/components/storyblok/program/program-finances-dialog';
import { ProgramManageLabel } from '@/components/storyblok/program/program-manage-label';
import type { WebsiteCurrency, WebsiteLanguage } from '@/lib/i18n/utils';
import { resolveProgramFinancesDisplayAmountsAction } from '@/modules/programs/program.actions';
import type { ProgramDashboardStats } from '@/modules/programs/program.types';
import { DetailPanel } from '@socialincome/design-system/data-display/detail-panel/detail-panel';
import { getTranslations } from 'next-intl/server';

type Props = {
	stats: ProgramDashboardStats;
	programId: string;
	lang: WebsiteLanguage;
	currency: WebsiteCurrency;
};

export const ProgramFinances = async ({ stats, programId, lang, currency }: Props) => {
	const [t, displayAmountsResult] = await Promise.all([
		getTranslations('website-common'),
		resolveProgramFinancesDisplayAmountsAction(stats, currency),
	]);
	const displayAmounts = displayAmountsResult.success
		? displayAmountsResult.data
		: {
				currency: stats.payoutCurrency,
				paidOutSoFar: stats.paidOutSoFarProgramCurrency,
				totalProgramCosts: stats.totalProgramCostsProgramCurrency,
				availableCredits: stats.availableCreditsProgramCurrency,
			};
	const financesCard = <ProgramFinancesCard displayAmounts={displayAmounts} lang={lang} embedded />;

	return (
		<DetailPanel title={t('navigation.finances')}>
			{financesCard}
			<ProgramFinancesDialog
				dialogTitle={t('program-detail-page.program-finances-title')}
				viewBreakdownLabel={t('program-detail-page.view-breakdown')}
				manageLabel={<ProgramManageLabel />}
				manageHref={`/portal/programs/${programId}/payout-forecast`}
				payoutForecastInfoTooltip={t('program-detail-page.payout-forecast-info')}
				financesCard={financesCard}
				programId={programId}
			/>
		</DetailPanel>
	);
};
