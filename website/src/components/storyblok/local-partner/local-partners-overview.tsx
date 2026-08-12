import { BlockWrapper } from '@/components/block-wrapper';
import { LocalPartnersGrid } from '@/components/storyblok/local-partner/local-partners-grid';
import { LocalPartnersTeaserIntro } from '@/components/storyblok/local-partner/local-partners-teaser-intro';
import { CmsHeader } from '@/components/storyblok/shared/cms-header';
import type { LocalPartnerStory } from './local-partner.types';

type Props = {
	localPartners: LocalPartnerStory[];
	title?: string;
	text?: string;
};

export const LocalPartnersOverview = ({ localPartners, title, text }: Props) => {
	const hasCmsHeader = Boolean(title?.trim()) || Boolean(text?.trim());

	return (
		<BlockWrapper disableMarginTop={true} disableMarginBottom={true}>
			<div className="flex w-full flex-col gap-8">
				{hasCmsHeader ? <CmsHeader title={title} text={text} /> : <LocalPartnersTeaserIntro />}
				<LocalPartnersGrid localPartners={localPartners} />
			</div>
		</BlockWrapper>
	);
};
