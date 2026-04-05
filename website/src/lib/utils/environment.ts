export const isStoryblokMockRecordOrReplay = () => ['record', 'replay'].includes(process.env.STORYBLOK_MOCK_MODE ?? '');
