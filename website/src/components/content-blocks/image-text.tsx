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

export default function ImageTextBlock({ blok }: Props) {
	if (!blok.content) {
		return null;
	}

	const dimensions = blok.image.filename ? getScaledDimensions(blok.image.filename, 600) : null;

	return (
		<BlockWrapper
			{...storyblokEditable(blok as SbBlokData)}
			className={cn(
				'flex flex-row items-center gap-14 text-lg text-black',
				blok.layout === 'imageRight' && 'flex-row-reverse',
			)}
		>
			{blok.image.filename && dimensions && (
				<NextImage
					src={blok.image.filename}
					alt={blok.image.alt ?? ''}
					width={dimensions.width}
					height={dimensions.height}
					className="rounded-2xl"
				/>
			)}
			<div className="flex-1">
				<RichTextRenderer richTextDocument={blok.content as StoryblokRichtext} />
			</div>
		</BlockWrapper>
	);
}
