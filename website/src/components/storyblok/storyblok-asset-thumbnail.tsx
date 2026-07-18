import type { StoryblokAsset } from '@/generated/storyblok/types/storyblok';
import { getDimensionsFromStoryblokImageUrl } from '@/lib/services/storyblok/storyblok.utils';
import Image from 'next/image';

type Props = {
	asset?: StoryblokAsset;
};

export const StoryblokAssetThumbnail = ({ asset }: Props) => {
	if (!asset?.filename) {
		return null;
	}

	const dimensions = getDimensionsFromStoryblokImageUrl(asset.filename);

	return (
		<div className="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-xs">
			<Image
				src={asset.filename}
				alt={asset.alt ?? 'Thumbnail'}
				width={dimensions.width ?? 25}
				height={dimensions.height ?? 15}
				className="size-full object-contain"
			/>
		</div>
	);
};
