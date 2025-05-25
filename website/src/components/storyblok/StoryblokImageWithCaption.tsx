import { formatStoryblokUrl } from '@/components/storyblok/StoryblokUtils';
import { Typography } from '@socialincome/ui';
import Image from 'next/image';

const IMAGE_TARGET_WIDTH = 1920;
const IMAGE_TARGET_HEIGHT = 1080;

export function StoryblokImageWithCaption({
	image,
	caption,
}: {
	image: { filename: string; alt?: string; focus?: string };
	caption: string;
}) {
	if (!image?.filename) return null;
	return (
		<div className="w-full px-0 py-8">
			<Image
				src={formatStoryblokUrl(image.filename, IMAGE_TARGET_WIDTH, IMAGE_TARGET_HEIGHT, image.focus)}
				alt={image.alt || ''}
				className={`m-0 h-auto w-full object-contain p-0`}
				width={IMAGE_TARGET_WIDTH}
				height={IMAGE_TARGET_HEIGHT}
			/>
			{caption && (
				<Typography size="xs" className="m-0 mt-2 pt-4 text-left">
					{caption}
				</Typography>
			)}
		</div>
	);
}
