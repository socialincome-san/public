import {
	COUNTRY_RELATIONS,
	FOCUS_RELATIONS,
	LOCAL_PARTNER_RELATIONS,
	STANDARD_ARTICLE_RELATIONS,
	STANDARD_STORY_RELATIONS,
} from '@/lib/storyblok/storyblok-relations';
import type { ISbStoryData } from '@storyblok/js';

type RegisterBridgeParams = {
	onInput: (story: ISbStoryData) => void;
};

// Without these the editor sends every relation as a bare uuid on each keystroke, and pages that expect resolved
// stories (article authors, tags, …) break.
const PREVIEW_RELATIONS = [
	...new Set([
		...STANDARD_ARTICLE_RELATIONS,
		...STANDARD_STORY_RELATIONS,
		...COUNTRY_RELATIONS,
		...FOCUS_RELATIONS,
		...LOCAL_PARTNER_RELATIONS,
	]),
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
