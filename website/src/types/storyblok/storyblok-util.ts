import { MultilinkStoryblok, PageStoryblok } from './storyblok.generated';

export type StoryblokData<TStory> = TStory extends { content: any } ? MultilinkStoryblok & { story: TStory } : never;

export type SIStoryblokComponentName = ArrayElement<PageStoryblok['body']>['component'];
export type SIStoryblokComponentsMap = { [k in SIStoryblokComponentName]?: any };
