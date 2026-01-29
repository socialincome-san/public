import { BlockWrapper } from '@/components/block-wrapper';
import { RichTextRenderer } from '@/components/storyblok/rich-text-renderer';
import { Text } from '@/generated/storyblok/types/109655/storyblok-components';
import type { StoryblokRichtext } from 'storyblok-rich-text-react-renderer';

type Props = {
	blok: Text;
};

export default function TextBlock({ blok }: Props) {
	if (!blok.content) {
		return null;
	}

	return (
		<BlockWrapper className="text-lg text-black">
			<RichTextRenderer richTextDocument={blok.content as StoryblokRichtext} />
		</BlockWrapper>
	);
}
