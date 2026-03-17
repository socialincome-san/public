import type { ISbStoryData } from '@storyblok/js';

type StoryblokBridgeEvent = {
	story?: ISbStoryData;
};

type StoryblokBridgeInstance = {
	on: (events: string | string[], handler: (event: StoryblokBridgeEvent) => void) => void;
};

type StoryblokBridgeConstructor = new () => StoryblokBridgeInstance;

declare global {
	interface Window {
		StoryblokBridge: StoryblokBridgeConstructor;
		storyblokRegisterEvent: (cb: () => void) => void;
	}
}

export {};
