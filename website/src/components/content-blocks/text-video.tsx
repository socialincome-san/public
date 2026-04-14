import { BlockWrapper } from '@/components/block-wrapper';
import { RichTextRenderer } from '@/components/storyblok/rich-text-renderer';
import { TextVideo } from '@/generated/storyblok/types/109655/storyblok-components';
import { VimeoVideoMatchAndExtract } from '@/lib/utils/UrlVideoParser';
import { storyblokEditable, type SbBlokData } from '@storyblok/react';
import type { StoryblokRichtext } from 'storyblok-rich-text-react-renderer';

type Props = {
	blok: TextVideo;
};

const vimeoParser = new VimeoVideoMatchAndExtract();

export const TextVideoBlock = ({ blok }: Props) => {
	if (!blok.content) {
		return null;
	}

	const vimeoUrl = blok.vimeoLink?.url ? vimeoParser.parseUrl(blok.vimeoLink.url) : null;

	return (
		<BlockWrapper
			{...storyblokEditable(blok as SbBlokData)}
			className="flex flex-col items-center gap-14 text-lg text-black md:flex-row"
		>
			<div className="md:w-1/3">
				<RichTextRenderer richTextDocument={blok.content as StoryblokRichtext} />
			</div>
			{vimeoUrl && (
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
			)}
		</BlockWrapper>
	);
};
