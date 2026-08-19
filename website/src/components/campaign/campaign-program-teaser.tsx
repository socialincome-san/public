import { Badge } from '@/components/badge/badge';
import { BlockWrapper } from '@/components/block-wrapper';
import { FocusSdgs } from '@/components/storyblok/focus/focus-sdgs';
import { getFocusTitle } from '@/components/storyblok/focus/focus.utils';
import { ProgramWallet } from '@/components/storyblok/program/program-wallet';
import { getProgramPortalSlug, getProgramTitle } from '@/components/storyblok/program/program.utils';
import { getWebsiteCurrencyFromCookie } from '@/lib/i18n/get-website-currency';
import { Translator } from '@/lib/i18n/translator';
import type { WebsiteLanguage, WebsiteRegion } from '@/lib/i18n/utils';
import { services } from '@/lib/services/services';

type Props = {
	programId: string;
	lang: WebsiteLanguage;
	region: WebsiteRegion;
};

export const CampaignProgramTeaser = async ({ programId, lang, region }: Props) => {
	const [programSlugResult, displayCurrency] = await Promise.all([
		services.read.program.getProgramSlugById(programId),
		getWebsiteCurrencyFromCookie(),
	]);
	if (!programSlugResult.success) {
		return null;
	}

	const programPortalSlug = programSlugResult.data;
	const [programsResult, statsResult, targetFocusesResult, focusStoriesResult, translator, rates] = await Promise.all([
		services.storyblok.getPrograms(lang),
		services.read.program.getPublicProgramStatsById(programId),
		services.read.program.getPublicTargetFocusesByProgramId(programId),
		services.storyblok.getFocuses(lang),
		Translator.getInstance({ language: lang, namespaces: ['website-campaign', 'website-common'] }),
		services.currencyDisplay.fetchWalletPayoutDisplayRates(displayCurrency),
	]);
	if (!programsResult.success) {
		return null;
	}

	const program = programsResult.data.find(
		(programStory) => getProgramPortalSlug(programStory.content) === programPortalSlug,
	);
	if (!program) {
		return null;
	}

	const targetFocuses = targetFocusesResult.success ? targetFocusesResult.data : [];
	const focusStoriesByPortalSlug = new Map(
		(focusStoriesResult.success ? focusStoriesResult.data : []).map((focusStory) => [
			focusStory.content.portalSlug.trim(),
			focusStory,
		]),
	);
	const focuses = targetFocuses.map((focus) => {
		const focusStory = focusStoriesByPortalSlug.get(focus.slug);

		return {
			id: focus.id,
			title: focusStory ? getFocusTitle(focusStory.content) : focus.name,
			sdgs: focusStory?.content.sdgs ?? [],
		};
	});
	const sdgValues = focuses.flatMap(({ sdgs }) => sdgs);
	const hasFocuses = focuses.length > 0;
	const hasSdgs = sdgValues.length > 0;

	return (
		<BlockWrapper>
			<section className="bg-card grid gap-8 rounded-2xl p-6 shadow-sm md:p-3 md:pl-10 md:grid-cols-[minmax(0,4fr)_minmax(280px,2fr)] md:items-center md:gap-12">
				<div className="min-w-0">
					<p className="text-muted-foreground text-sm font-medium">{translator.t('campaign.program-teaser.heading')}</p>
					<h2 className="text-foreground mt-3 text-4xl leading-tight font-bold text-pretty">
						{getProgramTitle(program.content)}
					</h2>
					{program.content.description.trim() ? (
						<p className="text-muted-foreground mt-5 max-w-2xl text-base leading-7">{program.content.description.trim()}</p>
					) : null}
					{hasFocuses || hasSdgs ? (
						<div className="border-border mt-8 border-y">
							{hasFocuses ? (
								<div className="grid gap-3 py-4 sm:grid-cols-[140px_1fr] sm:items-center">
									<p className="text-sm font-medium text-slate-600">{translator.t('campaign.program-teaser.focus-areas')}</p>
									<div className="flex flex-wrap gap-2">
										{focuses.map((focus) => (
											<Badge key={focus.id} className="px-3 py-1.5 font-medium">
												{focus.title}
											</Badge>
										))}
									</div>
								</div>
							) : null}
							{hasSdgs ? (
								<div className={hasFocuses ? 'border-border border-t' : undefined}>
									<FocusSdgs values={sdgValues} label={translator.t('focuses-page.sdgs')} layout="row" />
								</div>
							) : null}
						</div>
					) : null}
				</div>
				<div className="w-full max-w-md justify-self-center lg:justify-self-end">
					<ProgramWallet
						program={program}
						stats={statsResult.success ? statsResult.data : undefined}
						displayCurrency={displayCurrency}
						rates={rates}
						translator={translator}
						lang={lang}
						region={region}
					/>
				</div>
			</section>
		</BlockWrapper>
	);
};
