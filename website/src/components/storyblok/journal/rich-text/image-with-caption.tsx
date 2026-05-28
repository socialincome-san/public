import { getDimensionsFromStoryblokImageUrl } from '@/lib/services/storyblok/storyblok.utils';
import Image from 'next/image';

type Props = {
	image: { filename: string; alt?: string; focus?: string };
	caption: string;
};

export const ImageWithCaption = ({ image, caption }: Props) => {
	if (!image?.filename) {
		return null;
	}

	const dimensions = getDimensionsFromStoryblokImageUrl(image.filename);

	return (
		<figure className="my-8 w-full">
			<Image
				src={image.filename}
				alt={image.alt ?? ''}
				className="h-auto w-full rounded-xl object-contain"
				width={dimensions.width ?? 1200}
				height={dimensions.height ?? 800}
			/>
			{caption && <figcaption className="text-muted-foreground mt-3 text-sm">{caption}</figcaption>}
		</figure>
	);
};
