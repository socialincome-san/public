import { BlockWrapper } from '@/components/block-wrapper';
import { RichTextRenderer } from '@/components/storyblok/rich-text-renderer';
import { ImageText } from '@/generated/storyblok/types/109655/storyblok-components';
import { getScaledDimensions } from '@/lib/services/storyblok/storyblok.utils';
import { cn } from '@/lib/utils/cn';
import { storyblokEditable, type SbBlokData } from '@storyblok/react';
import NextImage from 'next/image';
import type { StoryblokRichtext } from 'storyblok-rich-text-react-renderer';

type Props = {
	blok: ImageText;
};

export const ImageTextBlock = ({ blok }: Props) => {
	if (!blok.content) {
		return null;
	}

	const dimensions = blok.image.filename ? getScaledDimensions(blok.image.filename, 600) : null;
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
				'flex flex-col gap-14 text-lg text-black md:flex-row md:items-center',
				blok.layout === 'imageRight' && 'md:flex-row-reverse',
			)}
		>
			{blok.image.filename && dimensions && (
				<NextImage
					src={blok.image.filename}
					alt={blok.image.alt ?? ''}
					width={dimensions.width}
					height={dimensions.height}
					className={cn('order-2 rounded-2xl md:order-none', widthClasses.image)}
				/>
			)}
			<div className={cn('order-1 flex-1 md:order-none', widthClasses.text)}>
				<RichTextRenderer richTextDocument={blok.content as StoryblokRichtext} />
			</div>
		</BlockWrapper>
	);
};
