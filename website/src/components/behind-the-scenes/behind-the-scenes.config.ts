/**
 * PROTOTYPE STAND-IN for a Storyblok field that does not exist yet.
 *
 * The `program` content type has no person references yet, so there is no way to ask the CMS
 * who maintains a given page. This map stands in for that upcoming field.
 *
 * Roles are intentionally fixed for now (Content, UX Design, Development, Research) and will move
 * into the CMS later with the same shape.
 */
export type PageMaintainerRole = 'content' | 'ux-design' | 'development' | 'research';

export type PageMaintainer = {
	/** Person story slug. Becomes a story reference once the field is real. */
	person: string;
	/** Temporary fixed role code until this comes from Storyblok. */
	role: PageMaintainerRole;
};

/** Used for any page without its own entry, so the card is never empty. */
const DEFAULT_MAINTAINERS: PageMaintainer[] = [
	{ person: 'alexandra-andrist', role: 'content' },
	{ person: 'sabrina-oertle', role: 'ux-design' },
	{ person: 'christian-grutsch', role: 'ux-design' },
	{ person: 'marion-quartier', role: 'ux-design' },
	{ person: 'nando-schaer', role: 'development' },
	{ person: 'marc-werner', role: 'research' },
];

const PROGRAM_MAINTAINERS: Record<string, PageMaintainer[]> = {
	'mother-and-newborn-program': [
		{ person: 'ariea-burke', role: 'content' },
		{ person: 'alexandra-andrist', role: 'content' },
		{ person: 'sabrina-oertle', role: 'ux-design' },
		{ person: 'christian-grutsch', role: 'ux-design' },
		{ person: 'nando-schaer', role: 'development' },
		{ person: 'marc-werner', role: 'research' },
	],
	'ebola-survivors-program': [
		{ person: 'alexandra-andrist', role: 'content' },
		{ person: 'christian-grutsch', role: 'ux-design' },
		{ person: 'sabrina-oertle', role: 'ux-design' },
		{ person: 'marion-quartier', role: 'ux-design' },
		{ person: 'nando-schaer', role: 'development' },
		{ person: 'marc-werner', role: 'research' },
	],
};

export const getPageMaintainers = (programSlug: string): PageMaintainer[] =>
	PROGRAM_MAINTAINERS[programSlug] ?? DEFAULT_MAINTAINERS;
