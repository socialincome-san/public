import type { ImageWithCaption as ImageWithCaptionBlok } from '@/generated/storyblok/types/109655/storyblok-components';
import { getDimensionsFromStoryblokImageUrl } from '@/lib/services/storyblok/storyblok.utils';
import { cn } from '@/lib/utils/cn';
import Image from 'next/image';

type Props = ImageWithCaptionBlok;

// Breaks the image out of the article's max-w-2xl text column up to 800px wide.
// Gated behind `lg:` so the breakout math never has to fight overflow-x-clip on narrower viewports.
const WIDE_BREAKOUT_CLASSES = 'lg:relative lg:left-1/2 lg:w-screen lg:max-w-[800px] lg:-translate-x-1/2';

const SingleFigure = ({
	image,
	caption,
	className,
	centerCaption,
}: {
	image: Props['image'];
	caption?: string;
	className?: string;
	centerCaption?: boolean;
}) => {
	if (!image?.filename) {
		return null;
	}

	const dimensions = getDimensionsFromStoryblokImageUrl(image.filename);

	return (
		<figure className={className}>
			<Image
				src={image.filename}
				alt={image.alt ?? ''}
				className="h-auto w-full rounded-xl object-contain"
				width={dimensions.width ?? 1200}
				height={dimensions.height ?? 800}
			/>
			{caption && (
				<figcaption className={cn('text-muted-foreground mt-3 text-base', centerCaption && 'text-center')}>
					{caption}
				</figcaption>
			)}
		</figure>
	);
};

export const ImageWithCaption = ({ image, caption, layout, image2, caption2 }: Props) => {
	if (!image?.filename) {
		return null;
	}

	if (layout === 'sideBySide' && image2?.filename) {
		return (
			<div className={cn('my-8 flex flex-col gap-6 lg:flex-row', WIDE_BREAKOUT_CLASSES)}>
				<SingleFigure image={image} caption={caption} className="w-full lg:w-1/2" centerCaption />
				<SingleFigure image={image2} caption={caption2} className="w-full lg:w-1/2" centerCaption />
			</div>
		);
	}

	return (
		<SingleFigure
			image={image}
			caption={caption}
			className={cn('my-8 w-full', layout === 'wide' && WIDE_BREAKOUT_CLASSES)}
		/>
	);
};
