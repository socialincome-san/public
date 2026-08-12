import { LocalPartnerTeaserCard } from '@/components/storyblok/local-partner/local-partner-teaser-card';
import { Translator } from '@/lib/i18n/translator';
import { getWebsiteRootParams } from '@/lib/i18n/website-root-params';
import type { LocalPartnerStory } from './local-partner.types';

type Props = {
	localPartners: LocalPartnerStory[];
};

export const LocalPartnersGrid = async ({ localPartners }: Props) => {
	const { lang } = await getWebsiteRootParams();
	const translator = await Translator.getInstance({ language: lang, namespaces: ['website-common'] });
	const viewDetailsLabel = translator.t('local-partners-page.view-details');

	if (localPartners.length === 0) {
		return <p className="text-muted-foreground">{translator.t('local-partners-page.empty')}</p>;
	}

	return (
		<ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
			{localPartners.map((localPartner) => (
				<li key={localPartner.uuid} className="flex">
					<LocalPartnerTeaserCard localPartner={localPartner} viewDetailsLabel={viewDetailsLabel} className="max-w-none" />
				</li>
			))}
		</ul>
	);
};
