import { BlockWrapper } from '@/components/block-wrapper';
import { HeroVideo } from '@/generated/storyblok/types/109655/storyblok-components';

type Props = {
	blok: HeroVideo;
};

export default function HeroVideoBlock({ blok }: Props) {
	return <BlockWrapper>{blok.heading}</BlockWrapper>;
}
