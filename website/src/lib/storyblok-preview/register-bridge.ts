import type { ISbStoryData } from '@storyblok/js';

type RegisterBridgeParams = {
  onInput: (story: ISbStoryData) => void;
};

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
