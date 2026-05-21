import type { Faq, FaqSelection, TwoColumnText, VideoText } from '@/generated/storyblok/types/109655/storyblok-components';
import { titledParagraphRichText } from '@/lib/storyblok/plain-text-rich-text';
import type { ISbStoryData } from '@storyblok/js';

export const buildFaqSelectionBlok = (heading: string, questions: ISbStoryData<Faq>[]): FaqSelection => ({
	component: 'faqSelection',
	_uid: 'campaign-faq-selection',
	heading,
	questions,
});

export const buildVideoTextBlok = (title: string, paragraphs: string[], vimeoVideoId: number): VideoText => ({
	component: 'videoText',
	_uid: 'campaign-video-text',
	content: {
		type: 'doc',
		content: [
			{ type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: title }] },
			...paragraphs.map((text) => ({
				type: 'paragraph',
				content: [{ type: 'text', text }],
			})),
		],
	},
	vimeoLink: {
		url: `https://vimeo.com/${vimeoVideoId}`,
		linktype: 'url',
		fieldtype: 'multilink',
		id: '',
		cached_url: '',
	} as VideoText['vimeoLink'],
	layout: 'videoRight',
});

export const buildTwoColumnTextBlok = (
	left: { title: string; text: string },
	right: { title: string; text: string },
): TwoColumnText => ({
	component: 'twoColumnText',
	_uid: 'campaign-two-column-text',
	leftText: titledParagraphRichText(left.title, left.text),
	rightText: titledParagraphRichText(right.title, right.text),
});
