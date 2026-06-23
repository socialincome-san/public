import { BlockWrapper } from '@/components/block-wrapper';
import { RichTextRenderer } from '@/components/storyblok/rich-text-renderer';
import { ImageText } from '@/generated/storyblok/types/109655/storyblok-components';
import { getScaledDimensions } from '@/lib/services/storyblok/storyblok.utils';
import { cn } from '@/lib/utils/cn';
import { storyblokEditable, type SbBlokData } from '@storyblok/react';
import NextImage from 'next/image';

type Props = {
	blok: ImageText;
};

const IMAGE_MAX_WIDTH = 600;

const isSvgAsset = (filename: string, contentType?: string) => {
	const pathWithoutQuery = filename.split('?')[0] ?? '';

	return contentType === 'image/svg+xml' || pathWithoutQuery.toLowerCase().endsWith('.svg');
};

export const ImageTextBlock = ({ blok }: Props) => {
	if (!blok.content) {
		return null;
	}

	const imageFilename = blok.image.filename;
	const isSvg = imageFilename ? isSvgAsset(imageFilename, blok.image.content_type) : false;
	const dimensions =
		imageFilename && !isSvg
			? (getScaledDimensions(imageFilename, IMAGE_MAX_WIDTH) ?? {
					width: blok.image.width ?? IMAGE_MAX_WIDTH,
					height: blok.image.height ?? IMAGE_MAX_WIDTH,
				})
			: null;
	const widthClassesByRatio = {
		'': { image: 'md:w-1/2', text: 'md:w-1/2' },
		'1/3': { image: 'md:w-1/3', text: 'md:w-2/3' },
		'1/2': { image: 'md:w-1/2', text: 'md:w-1/2' },
		'2/3': { image: 'md:w-2/3', text: 'md:w-1/3' },
	};

	const imageToTextRatio = blok.imageToTextRatio ?? '1/2';

	const widthClasses = widthClassesByRatio[imageToTextRatio] ?? widthClassesByRatio['1/2'];

	return (
		<BlockWrapper
			{...storyblokEditable(blok as SbBlokData)}
			className={cn(
				'text-foreground flex flex-col gap-14 text-lg md:flex-row md:items-center',
				blok.layout === 'imageRight' && 'md:flex-row-reverse',
			)}
		>
			{imageFilename && (
				<div className={cn('order-2 md:order-none', widthClasses.image)}>
					{isSvg ? (
						// SVGs should keep their original vector source instead of going through the Storyblok raster loader.
						// eslint-disable-next-line @next/next/no-img-element
						<img
							src={imageFilename}
							alt={blok.image.alt ?? ''}
							width={blok.image.width ?? undefined}
							height={blok.image.height ?? undefined}
							className="h-auto w-full rounded-2xl"
						/>
					) : (
						dimensions && (
							<NextImage
								src={imageFilename}
								alt={blok.image.alt ?? ''}
								width={dimensions.width}
								height={dimensions.height}
								className="h-auto w-full rounded-2xl"
							/>
						)
					)}
				</div>
			)}
			<div className={cn('order-1 flex-1 md:order-none', widthClasses.text)}>
				<RichTextRenderer richTextDocument={blok.content} />
			</div>
		</BlockWrapper>
	);
};
