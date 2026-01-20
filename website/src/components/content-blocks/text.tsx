import { Text } from '@/generated/storyblok/types/109655/storyblok-components';
import type { StoryblokRichtext } from 'storyblok-rich-text-react-renderer';
import { RichTextRenderer } from '../storyblok/rich-text-renderer';

type TextBlockProps = {
	blok: Text;
};

export default function TextBlock({ blok }: TextBlockProps) {
	if (!blok.content) {
		return null;
	}

	return (
		<div className="text-lg text-black">
			<RichTextRenderer richTextDocument={blok.content as StoryblokRichtext} />
		</div>
	);
}
