import { LocalPartnersGrid } from '@/components/storyblok/local-partner/local-partners-grid';
import { LocalPartnersTeaserIntro } from '@/components/storyblok/local-partner/local-partners-teaser-intro';
import type { WebsiteLanguage, WebsiteRegion } from '@/lib/i18n/utils';
import type { LocalPartnerStory } from './local-partner.types';

type Props = {
	localPartners: LocalPartnerStory[];
	lang: WebsiteLanguage;
	region: WebsiteRegion;
	title?: string;
	text?: string;
};

export const LocalPartnersOverview = ({ localPartners, lang, region, title, text }: Props) => {
	const hasCmsHeader = Boolean(title?.trim()) || Boolean(text?.trim());

	return (
		<div className="flex w-full flex-col gap-8">
			{hasCmsHeader ? (
				<div className="flex flex-col gap-4">
					{title?.trim() ? <h1 className="font-sans text-5xl font-normal text-cyan-900">{title.trim()}</h1> : null}
					{text?.trim() ? <p className="text-foreground font-sans text-lg font-normal not-italic">{text.trim()}</p> : null}
				</div>
			) : (
				<LocalPartnersTeaserIntro lang={lang} />
			)}
			<LocalPartnersGrid localPartners={localPartners} lang={lang} region={region} />
		</div>
	);
};
