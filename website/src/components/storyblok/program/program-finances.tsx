import { ProgramFinancesCard } from '@/components/storyblok/program/program-finances-card';
import { ProgramFinancesDialog } from '@/components/storyblok/program/program-finances-dialog';
import { getCurrentUser } from '@/lib/firebase/current-user';
import { getWebsiteCurrencyFromCookie } from '@/lib/i18n/get-website-currency';
import type { Translator } from '@/lib/i18n/translator';
import type { WebsiteLanguage } from '@/lib/i18n/utils';
import type { ProgramDashboardStats } from '@/lib/services/program-stats/program-stats.types';
import { services } from '@/lib/services/services';

type Props = {
	stats: ProgramDashboardStats;
	programId: string;
	translator: Translator;
	lang: WebsiteLanguage;
};

export const ProgramFinances = async ({ stats, programId, translator, lang }: Props) => {
	const [user, displayCurrency] = await Promise.all([getCurrentUser(), getWebsiteCurrencyFromCookie()]);
	const isLoggedIn = user !== null;
	const displayAmounts = await services.programStats.resolveDisplayAmounts(stats, displayCurrency);
	const financesCard = <ProgramFinancesCard displayAmounts={displayAmounts} translator={translator} lang={lang} embedded />;

	return (
		<div className="bg-card flex flex-col gap-6 rounded-xl p-4 shadow-lg lg:p-6">
			<div className="flex items-center justify-between">
				<h2 className="text-foreground text-xl font-bold">{translator.t('navigation.finances')}</h2>
			</div>

			{financesCard}
			<ProgramFinancesDialog
				dialogTitle={translator.t('program-detail-page.program-finances-title')}
				viewBreakdownLabel={translator.t('program-detail-page.view-breakdown')}
				manageLabel={
					isLoggedIn ? translator.t('program-detail-page.manage') : translator.t('program-detail-page.login-to-manage')
				}
				manageHref={`/portal/programs/${programId}/payout-forecast`}
				payoutForecastInfoTooltip={translator.t('program-detail-page.payout-forecast-info')}
				financesCard={financesCard}
				programId={programId}
			/>
		</div>
	);
};
