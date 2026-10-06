import { RichTextRenderer } from '@/components/storyblok/rich-text-renderer';
import { Text } from '@/generated/storyblok/types/109655/storyblok-components';
import { cn } from '@socialincome/design-system/cn';
import { BlockWrapper } from '@socialincome/design-system/layout/block-wrapper/block-wrapper';
import { storyblokEditable } from '@storyblok/react';

type Props = {
	blok: Text;
};

const defaultWidthRatio = 'twoThirds';

const widthClassesByRatio = {
	'': 'sm:w-2/3',
	full: '',
	fourFifths: 'sm:w-4/5',
	twoThirds: 'sm:w-2/3',
	half: 'sm:w-1/2',
	third: 'sm:w-1/3',
};

export const TextBlock = ({ blok }: Props) => {
	const { content, disableMarginBottom, disableMarginTop, widthRatio } = blok;

	if (!content) {
		return null;
	}

	const widthClass = widthClassesByRatio[widthRatio ?? defaultWidthRatio];

	return (
		<BlockWrapper disableMarginBottom={disableMarginBottom} disableMarginTop={disableMarginTop} {...storyblokEditable(blok)}>
			<div className={cn('text-foreground text-lg', widthClass)}>
				<RichTextRenderer richTextDocument={content} />
			</div>
		</BlockWrapper>
	);
};
