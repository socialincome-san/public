import { HeroVideo } from '@/generated/storyblok/types/109655/storyblok-components';

type HeroVideoBlockProps = {
	blok: HeroVideo;
};

export default function HeroVideoBlock({ blok }: HeroVideoBlockProps) {
	return <div>{blok.heading}</div>;
}
