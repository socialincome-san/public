import { getDimensionsFromStoryblokImageUrl } from '@/lib/services/storyblok/storyblok.utils';
import { Typography } from '@socialincome/ui';
import Image from 'next/image';

export const StoryblokImageWithCaption = ({
	image,
	caption,
}: {
	image: { filename: string; alt?: string; focus?: string };
	caption: string;
}) => {
	if (!image?.filename) {
		return null;
	}
	const dimensionsFromStoryblokImage = getDimensionsFromStoryblokImageUrl(image.filename);
	return (
		<div className="w-full px-0 py-8">
			<Image
				src={image.filename}
				alt={image.alt || ''}
				className={`m-0 h-auto w-full object-contain p-0`}
				width={dimensionsFromStoryblokImage.width}
				height={dimensionsFromStoryblokImage.height}
			/>
			{caption && (
				<Typography size="md" className="m-0 mt-2 pt-4 text-left">
					{caption}
				</Typography>
			)}
		</div>
	);
}
