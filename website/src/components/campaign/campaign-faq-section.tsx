import { FaqSelectionContent } from '@/components/content-blocks/faq-selection-content';
import { resolveFaqItems } from '@/components/content-blocks/faq-selection.utils';
import type { Faq } from '@/generated/storyblok/types/109655/storyblok-components';
import { BlockWrapper } from '@socialincome/design-system/block-wrapper/block-wrapper';
import type { ISbStoryData } from '@storyblok/js';

type Props = {
	heading: string;
	faqs: ISbStoryData<Faq>[];
};

export const CampaignFaqSection = ({ heading, faqs }: Props) => {
	const items = resolveFaqItems(faqs);

	if (!items.length) {
		return null;
	}

	return (
		<BlockWrapper>
			<FaqSelectionContent heading={heading} items={items} />
		</BlockWrapper>
	);
};
