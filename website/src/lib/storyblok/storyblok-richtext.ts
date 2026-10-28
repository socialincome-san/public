import type { Page } from '@/generated/storyblok/types/109655/storyblok-components';
import type { StoryblokAsset, StoryblokRichTextDoc } from '@/generated/storyblok/types/storyblok';

type RichTextNode = StoryblokRichTextDoc | StoryblokRichTextDoc['content'][number];

const isRichTextDoc = (value: unknown): value is StoryblokRichTextDoc =>
	typeof value === 'object' && value !== null && 'type' in value && value.type === 'doc' && 'content' in value;

const toText = (node: RichTextNode): string => {
	if (node.type === 'text') {
		return node.text;
	}
	if (node.type === 'hard_break') {
		return ' ';
	}
	if (!('content' in node) || !node.content) {
		return '';
	}

	// Inline children of a paragraph or heading are fragments of one run of text, e.g. a bold word.
	return node.content.map(toText).join(node.type === 'paragraph' || node.type === 'heading' ? '' : ' ');
};

// Some richtext fields, e.g. Country.description, still hold the plain string they had before the schema changed.
export const storyblokRichtextToPlainText = (node: RichTextNode | string) =>
	(typeof node === 'string' ? node : toText(node)).replaceAll(/\s+/g, ' ').trim();

// Hero headings and titles are Markdown, e.g. "Give 1 % of your income and **change lives**."
const markdownToPlainText = (markdown: string) =>
	markdown
		.replaceAll(/!?\[([^\]]*)\]\([^)]*\)/g, '$1')
		.replaceAll(/^#+\s*/gm, '')
		.replaceAll(/[*_`~]/g, '')
		.replaceAll(/\s+/g, ' ')
		.trim();

const isImageAsset = (value: unknown): value is StoryblokAsset =>
	typeof value === 'object' &&
	value !== null &&
	'fieldtype' in value &&
	value.fieldtype === 'asset' &&
	'filename' in value &&
	typeof value.filename === 'string' &&
	value.filename !== '';

const markdownFieldToPlainText = (value: unknown) =>
	typeof value === 'string' ? markdownToPlainText(value) || undefined : undefined;

const getPageStoryText = (page: Page) => {
	let heading: string | undefined;
	let paragraph: string | undefined;

	for (const block of page.content ?? []) {
		heading ??= markdownFieldToPlainText(block.heading) ?? markdownFieldToPlainText(block.title);
		paragraph ??= markdownFieldToPlainText(block.description);

		for (const doc of Object.values(block).filter(isRichTextDoc)) {
			for (const node of doc.content) {
				const text = storyblokRichtextToPlainText(node);
				if (!text) {
					continue;
				}
				if (node.type === 'heading') {
					heading ??= text;
				} else if (node.type === 'paragraph') {
					paragraph ??= text;
				}
			}
		}
		if (heading && paragraph) {
			break;
		}
	}

	return { heading, paragraph };
};

const nonEmpty = (value: string | undefined) => (value?.trim() ? value.trim() : undefined);

/**
 * Editors can set a page's meta title, description and image in its SEO tab. Whatever they leave empty comes from
 * `defaultTitle` or from what visitors see first: the first heading and paragraph of the page's blocks, and the
 * first block's image.
 */
export const getPageStoryMetadata = (page: Page, defaultTitle?: string) => {
	const { heading, paragraph } = getPageStoryText(page);
	const firstBlockImage: unknown = page.content?.[0]?.image;

	return {
		title: nonEmpty(page.metaTitle) ?? defaultTitle ?? heading,
		description: nonEmpty(page.metaDescription) ?? paragraph,
		image: isImageAsset(page.metaImage) ? page.metaImage : isImageAsset(firstBlockImage) ? firstBlockImage : undefined,
	};
};
