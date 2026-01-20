import { HeroVideo } from '@/generated/storyblok/types/109655/storyblok-components';

type HeroVideoBlockProps = {
	block: HeroVideo;
};

export default function HeroVideoBlock({ block }: HeroVideoBlockProps) {
	return <div>{block.heading}</div>;
}
