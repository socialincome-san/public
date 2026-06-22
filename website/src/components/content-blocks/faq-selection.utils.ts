import type { Faq, FaqSelection } from '@/generated/storyblok/types/109655/storyblok-components';
import type { ISbStoryData } from '@storyblok/js';

export type FaqItem = {
	id: string;
	question: string;
	answer?: string;
};

export const resolveFaqItems = (questions: FaqSelection['questions'] | ISbStoryData<Faq>[]): FaqItem[] => {
	const items: FaqItem[] = [];

	for (const questionReference of questions) {
		if (typeof questionReference === 'string') {
			continue;
		}

		const question = questionReference.content.question?.trim();

		if (!question) {
			continue;
		}

		if (typeof questionReference.content.answer !== 'string') {
			continue;
		}

		items.push({
			id: questionReference.uuid,
			question,
			answer: questionReference.content.answer?.trim(),
		});
	}

	return items;
};
