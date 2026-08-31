import { Badge } from '@/components/badge/badge';
import { BlockWrapper } from '@/components/block-wrapper';
import { FocusSdgs } from '@/components/storyblok/focus/focus-sdgs';
import { getFocusSlug, getFocusTitle } from '@/components/storyblok/focus/focus.utils';
import { getLocalPartnerSlug } from '@/components/storyblok/local-partner/local-partner.utils';
import type { LocalPartnerStory } from '@/components/storyblok/local-partner/local-partner.types';
import { ProgramWallet } from '@/components/storyblok/program/program-wallet';
import { getProgramPortalSlug, getProgramTitle } from '@/components/storyblok/program/program.utils';
import { getWebsiteCurrencyFromCookie } from '@/lib/i18n/get-website-currency';
import { Translator } from '@/lib/i18n/translator';
import type { WebsiteLanguage, WebsiteRegion } from '@/lib/i18n/utils';
import { services } from '@/lib/services/services';
import { cn } from '@/lib/utils/cn';
import Link from 'next/link';

type Props = {
	programId: string;
	lang: WebsiteLanguage;
	region: WebsiteRegion;
};

type TeaserMetaItem = {
	id: string;
	name: string;
	href?: string;
};

type TeaserMetaRowProps = {
	label: string;
	items: TeaserMetaItem[];
	showDivider?: boolean;
};

const TeaserMetaRow = ({ label, items, showDivider = false }: TeaserMetaRowProps) => (
	<div className={cn('grid gap-3 py-4 sm:grid-cols-[140px_1fr] sm:items-center', showDivider && 'border-border border-t')}>
		<p className="text-sm font-medium text-slate-600">{label}</p>
		<div className="flex flex-wrap gap-2">
			{items.map((item) => {
				const badge = (
					<Badge
						className={cn(
							'px-3 py-1.5 font-medium',
							item.href && 'hover:bg-muted/80 transition-colors',
						)}
					>
						{item.name}
					</Badge>
				);

				if (!item.href) {
					return <div key={item.id}>{badge}</div>;
				}

				return (
					<Link
						key={item.id}
						href={item.href}
						className="rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-950"
					>
						{badge}
					</Link>
				);
			})}
		</div>
	</div>
);

export const CampaignProgramTeaser = async ({ programId, lang, region }: Props) => {
	const [programSlugResult, displayCurrency] = await Promise.all([
		services.read.program.getProgramSlugById(programId),
		getWebsiteCurrencyFromCookie(),
	]);
	if (!programSlugResult.success) {
		return null;
	}

	const programPortalSlug = programSlugResult.data;
	const [
		programsResult,
		statsResult,
		targetFocusesResult,
		localPartnersResult,
		focusStoriesResult,
		localPartnerStoriesResult,
		translator,
		rates,
	] = await Promise.all([
		services.storyblok.getPrograms(lang),
		services.read.program.getPublicProgramStatsById(programId),
		services.read.program.getPublicTargetFocusesByProgramId(programId),
		services.read.localPartner.getPublicLocalPartnersByProgramId(programId),
		services.storyblok.getFocuses(lang),
		services.storyblok.getLocalPartners(lang),
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
			name: focusStory ? getFocusTitle(focusStory.content) : focus.name,
			sdgs: focusStory?.content.sdgs ?? [],
			href: focusStory ? `/${lang}/${region}/focuses/${getFocusSlug(focusStory)}` : undefined,
		};
	});
	const localPartnerStoriesByPortalSlug = new Map(
		(localPartnerStoriesResult.success ? localPartnerStoriesResult.data : [])
			.map((localPartnerStory) => {
				const portalSlug = localPartnerStory.content.portalSlug?.trim();

				return portalSlug ? ([portalSlug, localPartnerStory] as const) : null;
			})
			.filter((entry): entry is readonly [string, LocalPartnerStory] => entry !== null),
	);
	const localPartners = (localPartnersResult.success ? localPartnersResult.data : []).map((localPartner) => {
		const localPartnerStory = localPartnerStoriesByPortalSlug.get(localPartner.slug);

		return {
			id: localPartner.id,
			name: localPartner.name,
			href: localPartnerStory
				? `/${lang}/${region}/local-partners/${getLocalPartnerSlug(localPartnerStory)}`
				: undefined,
		};
	});
	const sdgValues = focuses.flatMap(({ sdgs }) => sdgs);
	const hasFocuses = focuses.length > 0;
	const hasLocalPartners = localPartners.length > 0;
	const hasSdgs = sdgValues.length > 0;
	const programDescription = program.content.description.trim();

	return (
		<BlockWrapper disableMarginTop={true} className="mt-10">
			<section className="bg-card grid gap-8 rounded-2xl p-6 shadow-sm md:grid-cols-[minmax(0,4fr)_minmax(280px,2fr)] md:gap-12 md:p-3 md:pl-10">
				<div className="min-w-0 py-8">
					<p className="text-muted-foreground text-sm font-medium">{translator.t('campaign.program-teaser.heading')}</p>
					<h2 className="text-foreground mt-3 text-4xl leading-tight font-bold text-pretty">
						{getProgramTitle(program.content)}
					</h2>
					{programDescription ? (
						<p className="text-muted-foreground mt-5 max-w-2xl text-base leading-7">{programDescription}</p>
					) : null}
					{hasFocuses || hasLocalPartners || hasSdgs ? (
						<div className="border-border mt-8 border-y">
							{hasFocuses ? (
								<TeaserMetaRow label={translator.t('campaign.program-teaser.focus-areas')} items={focuses} />
							) : null}
							{hasLocalPartners ? (
								<TeaserMetaRow
									label={translator.t('campaign.program-teaser.local-partners')}
									items={localPartners}
									showDivider={hasFocuses}
								/>
							) : null}
							{hasSdgs ? (
								<div className={hasFocuses || hasLocalPartners ? 'border-border border-t' : undefined}>
									<FocusSdgs values={sdgValues} label={translator.t('focuses-page.sdgs')} layout="row" />
								</div>
							) : null}
						</div>
					) : null}
				</div>
				<div className="flex h-full w-full min-w-0 flex-col">
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
