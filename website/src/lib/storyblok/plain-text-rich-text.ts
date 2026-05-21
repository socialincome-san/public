import type { StoryblokRichtext } from 'storyblok-rich-text-react-renderer';

const textNode = (text: string) => ({ type: 'text' as const, text });

export const titledParagraphRichText = (title: string, body: string): StoryblokRichtext => ({
	type: 'doc',
	content: [
		{ type: 'heading', attrs: { level: 2 }, content: [textNode(title)] },
		{ type: 'paragraph', content: [textNode(body)] },
	],
});
