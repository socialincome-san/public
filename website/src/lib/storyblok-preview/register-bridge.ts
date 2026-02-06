import type { ISbStoryData } from '@storyblok/js';

type RegisterBridgeParams = {
	onInput: (story: ISbStoryData) => void;
};

/**
 * Register the Storyblok bridge to listen for input events from the Visual Editor.
 * This should only be called after loadStoryblokBridge() has completed.
 */
export const registerStoryblokBridge = ({ onInput }: RegisterBridgeParams) => {
	const isServer = typeof window === 'undefined';
	const isBridgeLoaded = !isServer && typeof window.storyblokRegisterEvent !== 'undefined';

	if (!isBridgeLoaded) {
		return;
	}

	window.storyblokRegisterEvent(() => {
		const sbBridge = new window.StoryblokBridge();
		sbBridge.on(['input'], (event) => {
			if (!event?.story) {
				return;
			}
			onInput(event.story);
		});
	});
};
