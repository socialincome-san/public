import { BlockWrapper } from '@/components/block-wrapper';
import { HeroVideo } from '@/generated/storyblok/types/109655/storyblok-components';
import { storyblokEditable, type SbBlokData } from '@storyblok/react';

type Props = {
	blok: HeroVideo;
};

export default function HeroVideoBlock({ blok }: Props) {
	return <BlockWrapper {...storyblokEditable(blok as SbBlokData)}>{blok.heading}</BlockWrapper>;
}
