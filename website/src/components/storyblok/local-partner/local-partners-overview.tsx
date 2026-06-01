import { LocalPartnerTeaserCard } from '@/components/storyblok/local-partner/local-partner-teaser-card';
import { LocalPartnersTeaserIntro } from '@/components/storyblok/local-partner/local-partners-teaser-intro';
import { Translator } from '@/lib/i18n/translator';
import type { WebsiteLanguage, WebsiteRegion } from '@/lib/i18n/utils';
import type { LocalPartnerStory } from './local-partner.types';

type Props = {
	localPartners: LocalPartnerStory[];
	lang: WebsiteLanguage;
	region: WebsiteRegion;
};

export const LocalPartnersOverview = async ({ localPartners, lang, region }: Props) => {
	const translator = await Translator.getInstance({ language: lang, namespaces: ['website-common'] });
	const viewDetailsLabel = translator.t('local-partners-page.view-details');

	if (localPartners.length === 0) {
		return <p className="text-muted-foreground">{translator.t('local-partners-page.empty')}</p>;
	}

	return (
		<div className="flex w-full flex-col gap-8">
			<LocalPartnersTeaserIntro lang={lang} />
			<ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
				{localPartners.map((localPartner) => (
					<li key={localPartner.uuid} className="flex">
						<LocalPartnerTeaserCard
							localPartner={localPartner}
							lang={lang}
							region={region}
							viewDetailsLabel={viewDetailsLabel}
							className="max-w-none"
						/>
					</li>
				))}
			</ul>
		</div>
	);
};
