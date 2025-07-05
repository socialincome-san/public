import { getDimensionsFromStoryblokImageUrl } from '@/components/storyblok/StoryblokUtils';
import { StoryblokImage } from '@/types/journal';
import Image from 'next/image';

const DEFAULT_HEIGHT = 15;

const DEFAULT_WIDTH = 25;

export function ThumbnailImage({ thumbnail }: { thumbnail?: StoryblokImage }) {
	if (!thumbnail) {
		return null;
	}
	let imageDimensions = getDimensionsFromStoryblokImageUrl(thumbnail.filename);
	return (
		<Image
			className="my-auto flex h-14 w-20 p-0"
			src={thumbnail.filename}
			alt={thumbnail.alt || `Thumbnail-${thumbnail.id}`}
			width={imageDimensions.width ?? DEFAULT_WIDTH}
			height={imageDimensions.height ?? DEFAULT_HEIGHT}
		/>
	);
}
