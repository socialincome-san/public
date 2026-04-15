import { BlockWrapper } from '@/components/block-wrapper';
import { RichTextRenderer } from '@/components/storyblok/rich-text-renderer';
import type { VideoText } from '@/generated/storyblok/types/109655/storyblok-components';
import { cn } from '@/lib/utils/cn';
import { VimeoVideoMatchAndExtract } from '@/lib/utils/UrlVideoParser';
import { storyblokEditable, type SbBlokData } from '@storyblok/react';
import type { StoryblokRichtext } from 'storyblok-rich-text-react-renderer';

type Props = {
	blok: VideoText;
};

const vimeoParser = new VimeoVideoMatchAndExtract();

export const VideoTextBlock = ({ blok }: Props) => {
	const vimeoUrl = blok.vimeoLink?.url ? vimeoParser.parseUrl(blok.vimeoLink.url) : null;

	if (!blok.content || !vimeoUrl) {
		return null;
	}

	return (
		<BlockWrapper
			{...storyblokEditable(blok as SbBlokData)}
			className={cn(
				'flex flex-col items-center gap-14 text-lg text-black md:flex-row',
				blok.layout === 'videoLeft' && 'md:flex-row-reverse',
			)}
		>
			<div className="md:w-1/3">
				<RichTextRenderer richTextDocument={blok.content as StoryblokRichtext} />
			</div>
			<div className="md:w-2/3">
				<iframe
					src={vimeoUrl}
					title="Video player"
					sandbox="allow-scripts allow-same-origin allow-presentation"
					allow="fullscreen"
					loading="lazy"
					className="aspect-video w-full rounded-2xl border-0"
				/>
			</div>
		</BlockWrapper>
	);
};
