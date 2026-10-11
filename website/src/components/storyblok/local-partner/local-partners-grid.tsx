import {
	getLocalPartnerCandidateFooter,
	LocalPartnerTeaserCard,
} from '@/components/storyblok/local-partner/local-partner-teaser-card';
import type { WebsiteCurrency, WebsiteLanguage } from '@/lib/i18n/utils';
import { getLocalPartnerOverviewStatsAction } from '@/modules/local-partners/local-partner.actions';
import { CardGrid, CardGridItem } from '@socialincome/design-system/layout/card-grid/card-grid';
import { getTranslations } from 'next-intl/server';
import type { LocalPartnerStory } from './local-partner.types';
import { getLocalPartnerPortalSlug } from './local-partner.utils';

type Props = {
	localPartners: LocalPartnerStory[];
	lang: WebsiteLanguage;
	currency: WebsiteCurrency;
	hasActiveFilters?: boolean;
};

export const LocalPartnersGrid = async ({ localPartners, lang, currency, hasActiveFilters = false }: Props) => {
	const portalSlugs = localPartners.map((localPartner) => getLocalPartnerPortalSlug(localPartner.content)).filter(Boolean);
	const [t, statsResult] = await Promise.all([
		getTranslations('website-common'),
		getLocalPartnerOverviewStatsAction(portalSlugs),
	]);
	const statsByPortalSlug = statsResult.success ? statsResult.data : {};

	return (
		<CardGrid emptyMessage={t(hasActiveFilters ? 'local-partners-page.no-results' : 'local-partners-page.empty')}>
			{localPartners.map((localPartner) => {
				const portalSlug = getLocalPartnerPortalSlug(localPartner.content);
				const recipientsCount = statsByPortalSlug[portalSlug]?.recipientsCount ?? 0;
				const candidatesCount = statsByPortalSlug[portalSlug]?.candidatesCount ?? 0;
				const recipientsLabel = t(
					recipientsCount === 1 ? 'local-partners-page.recipient-singular' : 'local-partners-page.recipient-plural',
				);
				const { candidatesLabel, alertVariant } = getLocalPartnerCandidateFooter(t, candidatesCount);

				return (
					<CardGridItem key={localPartner.uuid}>
						<LocalPartnerTeaserCard
							localPartner={localPartner}
							lang={lang}
							currency={currency}
							recipientsCount={recipientsCount}
							recipientsLabel={recipientsLabel}
							candidatesLabel={candidatesLabel}
							alertVariant={alertVariant}
						/>
					</CardGridItem>
				);
			})}
		</CardGrid>
	);
};
