import { blockMargins } from '@/components/content-blocks/block-margins';
import { DonationCalculator } from '@/components/donation-wizard/donation-calculator';
import type { DonationCalculator as DonationCalculatorBlok } from '@/generated/storyblok/types/109655/storyblok-components';
import { BlockWrapper } from '@socialincome/design-system/layout/block-wrapper/block-wrapper';
import { storyblokEditable } from '@storyblok/react';

type Props = {
	blok: DonationCalculatorBlok;
};

export const DonationCalculatorBlock = ({ blok }: Props) => (
	<BlockWrapper {...blockMargins(blok)} {...storyblokEditable(blok)}>
		<DonationCalculator />
	</BlockWrapper>
);
