import type { ISbStoryData } from '@storyblok/js';

interface StoryblokBridgeEvent {
  story?: ISbStoryData;
}

interface StoryblokBridgeInstance {
  on: (events: string | string[], handler: (event: StoryblokBridgeEvent) => void) => void;
}

type StoryblokBridgeConstructor = new () => StoryblokBridgeInstance;

declare global {
  interface Window {
    StoryblokBridge: StoryblokBridgeConstructor;
    storyblokRegisterEvent: (cb: () => void) => void;
  }
}

export {};
