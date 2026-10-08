import { CurrencySwitch } from '@/components/currency/currency-switch';
import { ProgramFinancesCard } from '@/components/storyblok/program/program-finances-card';
import { ProgramFinancesDialog } from '@/components/storyblok/program/program-finances-dialog';
import { mapWebsiteCurrencies, type WebsiteLanguage } from '@/lib/i18n/utils';
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
	const [t, userResult, displayAmountsResult] = await Promise.all([
		getTranslations('website-common'),
		getCurrentUserAction(),
		resolveProgramFinancesDisplayAmountsAction(stats),
	]);
	const isLoggedIn = userResult.success && userResult.data !== null;
	const fallbackDisplayAmounts = {
		currency: stats.payoutCurrency,
		paidOutSoFar: stats.paidOutSoFarProgramCurrency,
		totalProgramCosts: stats.totalProgramCostsProgramCurrency,
		availableCredits: stats.availableCreditsProgramCurrency,
	};
	const financesCard = (
		<CurrencySwitch
			variants={mapWebsiteCurrencies((currency) => (
				<ProgramFinancesCard
					displayAmounts={displayAmountsResult.success ? displayAmountsResult.data[currency] : fallbackDisplayAmounts}
					lang={lang}
					embedded
				/>
			))}
		/>
	);

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
