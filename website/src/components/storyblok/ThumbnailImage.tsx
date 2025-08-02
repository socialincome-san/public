import { getDimensionsFromStoryblokImageUrl } from '@/components/storyblok/StoryblokUtils';
import { StoryblokImage } from '@/types/journal';
import Image from 'next/image';

const DEFAULT_HEIGHT = 15;

const DEFAULT_WIDTH = 25;

export function ThumbnailImage({ thumbnail }: { thumbnail?: StoryblokImage }) {
	if (!thumbnail) return null;

	const imageDimensions = getDimensionsFromStoryblokImageUrl(thumbnail.filename);
	return (
		<div className="h-20 w-20 shrink-0 flex items-center justify-center overflow-hidden">
			<Image
				src={thumbnail.filename}
				alt={thumbnail.alt || `Thumbnail-${thumbnail.id}`}
				width={imageDimensions.width ?? DEFAULT_WIDTH}
				height={imageDimensions.height ?? DEFAULT_HEIGHT}
				className="h-full w-full object-contain"
			/>
		</div>
	);
}
