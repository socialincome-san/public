import type { Faq, FaqSelection } from '@/generated/storyblok/types/109655/storyblok-components';
import type { StoryblokRichtext } from '@/generated/storyblok/types/storyblok';
import type { ISbStoryData } from '@storyblok/js';

export type FaqItem = {
	id: string;
	question: StoryblokRichtext;
	answer?: StoryblokRichtext;
};

export const resolveFaqItems = (questions: FaqSelection['questions'] | ISbStoryData<Faq>[]): FaqItem[] => {
	const items: FaqItem[] = [];

	for (const questionReference of questions) {
		if (typeof questionReference === 'string') {
			continue;
		}

		const { answer, question } = questionReference.content;

		if (!question) {
			continue;
		}

		items.push({
			id: questionReference.uuid,
			question,
			answer,
		});
	}

	return items;
};
