'use client';

import { RichTextRenderer } from '@/components/storyblok/rich-text-renderer';
import type { StoryblokRichtext } from '@/generated/storyblok/types/storyblok';
import { cn } from '@/lib/utils/cn';

type Props = {
	content: StoryblokRichtext;
	vimeoEmbedUrl: string;
	layout?: 'videoLeft' | 'videoRight';
};

export const VideoTextContent = ({ content, vimeoEmbedUrl, layout = 'videoRight' }: Props) => (
	<div
		className={cn(
			'flex flex-col items-center gap-14 text-lg text-black md:flex-row',
			layout === 'videoLeft' && 'md:flex-row-reverse',
		)}
	>
		<div className="md:w-1/3">
			<RichTextRenderer richTextDocument={content} />
		</div>
		<div className="md:w-2/3">
			<iframe
				src={vimeoEmbedUrl}
				title="Video player"
				sandbox="allow-scripts allow-same-origin allow-presentation"
				allow="fullscreen"
				loading="lazy"
				className="aspect-video w-full rounded-2xl border-0"
			/>
		</div>
	</div>
);
