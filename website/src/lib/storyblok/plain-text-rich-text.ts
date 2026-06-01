import type { StoryblokRichtext } from '@/generated/storyblok/types/storyblok';

const textNode = (text: string) => ({ type: 'text' as const, text });

export const titledParagraphRichText = (title: string, body: string): StoryblokRichtext => ({
	type: 'doc',
	content: [
		{ type: 'heading', attrs: { level: 2 }, content: [textNode(title)] },
		{ type: 'paragraph', content: [textNode(body)] },
	],
});

export const headingAndParagraphsRichText = (title: string, paragraphs: string[]): StoryblokRichtext => ({
	type: 'doc',
	content: [
		{ type: 'heading', attrs: { level: 2 }, content: [textNode(title)] },
		...paragraphs.map((text) => ({ type: 'paragraph' as const, content: [textNode(text)] })),
	],
});
