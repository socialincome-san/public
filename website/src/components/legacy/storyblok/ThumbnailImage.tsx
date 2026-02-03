import type { StoryblokAsset } from '@/generated/storyblok/types/storyblok';
import { getDimensionsFromStoryblokImageUrl } from '@/lib/services/storyblok/storyblok.utils';
import Image from 'next/image';

const DEFAULT_HEIGHT = 15;

const DEFAULT_WIDTH = 25;

export function ThumbnailImage({ thumbnail }: { thumbnail?: StoryblokAsset }) {
	if (!thumbnail || !thumbnail.filename) return null;

	const imageDimensions = getDimensionsFromStoryblokImageUrl(thumbnail.filename);
	return (
		<div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden">
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
