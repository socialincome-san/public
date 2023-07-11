// TODO: use https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes and custom codes for languages that are not in that list, e.g. Krio

const LANGUAGES = ['en', 'de', 'it', 'fr', 'kri'] as const;
export type Language = (typeof LANGUAGES)[number];
