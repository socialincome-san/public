import type { ISbStoryData } from '@storyblok/js';

type RegisterBridgeParams = {
	onInput: (story: ISbStoryData) => void;
};

// Without these the editor sends every relation as a bare uuid on each keystroke, and pages that expect resolved
// stories (article authors, tags, …) break. Keep in sync with the relations in storyblok-content.service.ts.
const PREVIEW_RELATIONS = [
	'article.author',
	'article.coAuthors',
	'article.tags',
	'article.type',
	'faqSelection.questions',
	'Campaign.faq',
	'campaignGlobals.faq',
	'program.faq',
	'downloads.documents',
	'partnershipsCarousel.partnerships',
	'partnershipsCard.partnerships',
	'Country.partners',
	'Focus.studies',
	'Local Partner.focuses',
	'Local Partner.partners',
];

export const registerStoryblokBridge = ({ onInput }: RegisterBridgeParams) => {
	const isServer = typeof window === 'undefined';
	const isBridgeLoaded = !isServer && typeof window.storyblokRegisterEvent !== 'undefined';

	if (!isBridgeLoaded) {
		return;
	}

	window.storyblokRegisterEvent(() => {
		const sbBridge = new window.StoryblokBridge({ resolveRelations: PREVIEW_RELATIONS });
		sbBridge.on(['input'], (event) => {
			if (!event?.story) {
				return;
			}
			onInput(event.story as ISbStoryData);
		});
	});
};
