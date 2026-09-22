import { getWebsiteCurrencyFromCookie } from '@/lib/i18n/get-website-currency';
import { Translator } from '@/lib/i18n/translator';
import type { WebsiteLanguage, WebsiteRegion } from '@/lib/i18n/utils';
import { resolveWalletPayoutDisplaysAction } from '@/modules/currency-display/currency-display.actions';
import type { PublicProgramStatsMap } from '@/modules/programs/program.types';
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
	const [displayCurrency, translator] = await Promise.all([
		getWebsiteCurrencyFromCookie(),
		Translator.getInstance({ language: lang, namespaces: ['website-common'] }),
	]);
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
			{programs.length === 0 ? (
				<p className="text-muted-foreground">{translator.t('programs-page.empty')}</p>
			) : (
				<ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
					{programs.map((program) => {
						const portalSlug = getProgramPortalSlug(program.content);
						const stats = portalSlug ? statsByPortalSlug[portalSlug] : undefined;

						return (
							<li key={program.uuid} className="h-full">
								<ProgramWallet
									program={program}
									stats={stats}
									walletDisplay={displaysByProgramId.get(program.uuid)}
									translator={translator}
									lang={lang}
									region={region}
								/>
							</li>
						);
					})}
				</ul>
			)}
		</div>
	);
};
