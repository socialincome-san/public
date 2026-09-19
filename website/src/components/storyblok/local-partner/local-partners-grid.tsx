import {
	getLocalPartnerCandidateFooter,
	LocalPartnerTeaserCard,
} from '@/components/storyblok/local-partner/local-partner-teaser-card';
import { Translator } from '@/lib/i18n/translator';
import type { WebsiteLanguage, WebsiteRegion } from '@/lib/i18n/utils';
import { getLocalPartnerOverviewStats } from '@/lib/storyblok/local-partner-overview-stats';
import type { LocalPartnerStory } from './local-partner.types';
import { getLocalPartnerPortalSlug } from './local-partner.utils';

type Props = {
	localPartners: LocalPartnerStory[];
	lang: WebsiteLanguage;
	region: WebsiteRegion;
	hasActiveFilters?: boolean;
};

export const LocalPartnersGrid = async ({ localPartners, lang, region, hasActiveFilters = false }: Props) => {
	const portalSlugs = localPartners.map((localPartner) => getLocalPartnerPortalSlug(localPartner.content)).filter(Boolean);
	const [translator, statsByPortalSlug] = await Promise.all([
		Translator.getInstance({ language: lang, namespaces: ['website-common'] }),
		getLocalPartnerOverviewStats(portalSlugs),
	]);

	if (localPartners.length === 0) {
		return (
			<p className="text-muted-foreground">
				{translator.t(hasActiveFilters ? 'local-partners-page.no-results' : 'local-partners-page.empty')}
			</p>
		);
	}

	return (
		<ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
			{localPartners.map((localPartner) => {
				const portalSlug = getLocalPartnerPortalSlug(localPartner.content);
				const recipientsCount = statsByPortalSlug[portalSlug]?.recipientsCount ?? 0;
				const candidatesCount = statsByPortalSlug[portalSlug]?.candidatesCount ?? 0;
				const recipientsLabel = translator.t(
					recipientsCount === 1 ? 'local-partners-page.recipient-singular' : 'local-partners-page.recipient-plural',
				);
				const { candidatesLabel, alertVariant } = getLocalPartnerCandidateFooter(translator, candidatesCount);

				return (
					<li key={localPartner.uuid} className="flex">
						<LocalPartnerTeaserCard
							localPartner={localPartner}
							lang={lang}
							region={region}
							recipientsCount={recipientsCount}
							recipientsLabel={recipientsLabel}
							candidatesLabel={candidatesLabel}
							alertVariant={alertVariant}
							className="max-w-none"
						/>
					</li>
				);
			})}
		</ul>
	);
};
