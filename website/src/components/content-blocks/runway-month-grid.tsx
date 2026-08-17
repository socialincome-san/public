import { BlockWrapper } from '@/components/block-wrapper';
import type { RunwayMonthGrid as RunwayMonthGridBlok } from '@/generated/storyblok/types/109655/storyblok-components';
import type { WebsiteLanguage } from '@/lib/i18n/utils';
import { storyblokEditable } from '@storyblok/react';

type Props = {
	blok: RunwayMonthGridBlok;
	lang: WebsiteLanguage;
};

export const RunwayMonthGridBlock = ({ blok, lang }: Props) => {
	return (
		<BlockWrapper {...storyblokEditable(blok as SbBlockData)}>
			<div className="space-y-6">
				<div className="space-y-2"></div>
			</div>
		</BlockWrapper>
	);
};
