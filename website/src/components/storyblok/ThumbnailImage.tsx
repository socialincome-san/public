import { getDimensionsFromStoryblokImageUrl } from '@/components/storyblok/StoryblokUtils';
import { StoryblokImage } from '@socialincome/shared/src/storyblok/journal';
import Image from 'next/image';

const DEFAULT_HEIGHT = 15;

const DEFAULT_WIDTH = 25;

export function ThumbnailImage({ thumbnail }: { thumbnail?: StoryblokImage }) {
	if (!thumbnail) {
		return null;
	}
	let dimensionsFromStoryblokImageUrl = getDimensionsFromStoryblokImageUrl(thumbnail.filename);
	return (
		<Image
			className="my-auto flex h-14 w-20 p-0"
			src={thumbnail.filename}
			alt={String(thumbnail.id) + '-thumbnail'}
			width={dimensionsFromStoryblokImageUrl.width ?? DEFAULT_WIDTH}
			height={dimensionsFromStoryblokImageUrl.height ?? DEFAULT_HEIGHT}
		/>
	);
}
