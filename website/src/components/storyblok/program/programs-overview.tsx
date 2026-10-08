import { getWebsiteCurrencyFromCookie } from '@/lib/i18n/get-website-currency';
import type { WebsiteLanguage, WebsiteRegion } from '@/lib/i18n/utils';
import { resolveWalletPayoutDisplaysAction } from '@/modules/currency-display/currency-display.actions';
import type { PublicProgramStatsMap } from '@/modules/programs/program.types';
import { CardGrid, CardGridItem } from '@socialincome/design-system/layout/card-grid/card-grid';
import { getTranslations } from 'next-intl/server';
import { ProgramWallet } from './program-wallet';
import type { ProgramStory } from './program.types';
import { getProgramPortalSlug } from './program.utils';

type Props = {
	programs: ProgramStory[];
	statsByPortalSlug: PublicProgramStatsMap;
	lang: WebsiteLanguage;
	region: WebsiteRegion;
};

export const ProgramsOverview = async ({ programs, statsByPortalSlug, lang, region }: Props) => {
	const [displayCurrency, t] = await Promise.all([getWebsiteCurrencyFromCookie(), getTranslations('website-common')]);
	const programStats = programs.flatMap((program) => {
		const portalSlug = getProgramPortalSlug(program.content);
		const stats = portalSlug ? statsByPortalSlug[portalSlug] : undefined;

		return stats ? [{ programId: program.uuid, stats }] : [];
	});
	const displaysResult = await resolveWalletPayoutDisplaysAction(
		programStats.map(({ stats }) => ({
			totalPayoutsSum: stats.totalPayoutsSum,
			totalPayoutsSumChf: stats.totalPayoutsSumChf,
			payoutCurrency: stats.payoutCurrency,
			displayCurrency,
		})),
	);
	const displaysByProgramId = new Map(
		programStats.map(({ programId }, index) => [programId, displaysResult.success ? displaysResult.data[index] : undefined]),
	);

	return (
		<div className="flex w-full flex-col gap-6">
			<CardGrid emptyMessage={t('programs-page.empty')}>
				{programs.map((program) => {
					const portalSlug = getProgramPortalSlug(program.content);
					const stats = portalSlug ? statsByPortalSlug[portalSlug] : undefined;

					return (
						<CardGridItem key={program.uuid}>
							<ProgramWallet
								program={program}
								stats={stats}
								walletDisplay={displaysByProgramId.get(program.uuid)}
								lang={lang}
								region={region}
							/>
						</CardGridItem>
					);
				})}
			</CardGrid>
		</div>
	);
};
