import { ProgramFinancesCard } from '@/components/storyblok/program/program-finances-card';
import { ProgramFinancesDialog } from '@/components/storyblok/program/program-finances-dialog';
import { getWebsiteCurrencyFromCookie } from '@/lib/i18n/get-website-currency';
import type { WebsiteLanguage } from '@/lib/i18n/utils';
import { getCurrentUserAction } from '@/modules/auth/auth.actions';
import { resolveProgramFinancesDisplayAmountsAction } from '@/modules/programs/program.actions';
import type { ProgramDashboardStats } from '@/modules/programs/program.types';
import { DetailPanel } from '@socialincome/design-system/data-display/detail-panel/detail-panel';
import { getTranslations } from 'next-intl/server';

type Props = {
	stats: ProgramDashboardStats;
	programId: string;
	lang: WebsiteLanguage;
};

export const ProgramFinances = async ({ stats, programId, lang }: Props) => {
	const [t, userResult, displayCurrency] = await Promise.all([
		getTranslations('website-common'),
		getCurrentUserAction(),
		getWebsiteCurrencyFromCookie(),
	]);
	const isLoggedIn = userResult.success && userResult.data !== null;
	const displayAmountsResult = await resolveProgramFinancesDisplayAmountsAction(stats, displayCurrency);
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
				manageLabel={isLoggedIn ? t('program-detail-page.manage') : t('program-detail-page.login-to-manage')}
				manageHref={`/portal/programs/${programId}/payout-forecast`}
				payoutForecastInfoTooltip={t('program-detail-page.payout-forecast-info')}
				financesCard={financesCard}
				programId={programId}
			/>
		</DetailPanel>
	);
};
