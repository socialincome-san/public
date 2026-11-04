import type { Page } from '@/generated/storyblok/types/109655/storyblok-components';
import type { StoryblokAsset } from '@/generated/storyblok/types/storyblok';
import { getPageStoryMetadata, storyblokRichtextToPlainText } from './storyblok-richtext';

const page = (content: Page['content']): Page => ({ component: 'page', _uid: 'page', content });

const asset: StoryblokAsset = { alt: null, fieldtype: 'asset', id: null, filename: '', name: '', title: null, focus: null };

describe('getPageStoryMetadata', () => {
	it('reads the first heading and paragraph of a text block', () => {
		const text = getPageStoryMetadata(
			page([
				{
					component: 'text',
					_uid: 'text',
					content: {
						type: 'doc',
						content: [
							{ type: 'heading', attrs: { level: 1, textAlign: null }, content: [{ type: 'text', text: 'Downloads' }] },
							{ type: 'paragraph', content: [] },
							{
								type: 'paragraph',
								content: [
									{ type: 'text', text: 'Every report since ' },
									{ type: 'text', text: 'day one', marks: [{ type: 'bold' }] },
									{ type: 'text', text: '.' },
								],
							},
						],
					},
				},
			]),
		);

		expect(text).toEqual({ title: 'Downloads', description: 'Every report since day one.', image: undefined });
	});

	it('strips Markdown from hero headings', () => {
		const text = getPageStoryMetadata(
			page([
				{
					component: 'heroVideo',
					_uid: 'hero',
					muxPlaybackId: 'id',
					heading: 'Give 1 % of your income and **change lives**.',
				},
			]),
		);

		expect(text.title).toBe('Give 1 % of your income and change lives.');
		expect(text.description).toBeUndefined();
	});
});

describe('getPageStoryMetadata overrides', () => {
	const hero = {
		component: 'imageText' as const,
		_uid: 'hero',
		layout: 'imageLeft' as const,
		image: { ...asset, filename: 'https://a.storyblok.com/f/1/hero.jpg' },
		content: {
			type: 'doc' as const,
			content: [
				{
					type: 'heading' as const,
					attrs: { level: 1 as const, textAlign: null },
					content: [{ type: 'text' as const, text: 'Our work' }],
				},
				{ type: 'paragraph' as const, content: [{ type: 'text' as const, text: 'What we do.' }] },
			],
		},
	};

	it('prefers what editors set in the SEO tab', () => {
		const metaImage = { ...asset, filename: 'https://a.storyblok.com/f/1/share.jpg' };
		const text = getPageStoryMetadata({
			...page([hero]),
			metaTitle: ' Custom title ',
			metaDescription: 'Custom description',
			metaImage,
		});

		expect(text).toEqual({ title: 'Custom title', description: 'Custom description', image: metaImage });
	});

	it('falls back to the page when the SEO fields are empty', () => {
		const text = getPageStoryMetadata({ ...page([hero]), metaTitle: '', metaDescription: '  ', metaImage: asset });

		expect(text).toEqual({ title: 'Our work', description: 'What we do.', image: hero.image });
	});

	it('uses the default title before the first heading', () => {
		expect(getPageStoryMetadata(page([hero]), 'Home title').title).toBe('Home title');
	});
});

describe('storyblokRichtextToPlainText', () => {
	it('accepts fields that still hold a plain string', () => {
		expect(storyblokRichtextToPlainText('Sierra Leone sits on\n\nthe West African coast.')).toBe(
			'Sierra Leone sits on the West African coast.',
		);
	});
});
