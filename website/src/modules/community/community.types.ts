export type CommunityPerson = {
	name: string;
	imageSrc?: string;
	href: string;
};

export type CommunityPanelData = {
	volunteerCount: number;
	countryCount: number;
	roleCount: number;
	headline: string;
	headlineEmphasis?: string;
	intro?: string;
	volunteersHref?: string;
	tickerItems: string[];
	mistakeText?: string;
	contactEmail?: string;
	maintainers: { label: string; people: CommunityPerson[] }[];
	worldsTitle?: string;
	worlds: { name: string; tag?: string; text?: string; people: CommunityPerson[] }[];
	rolesTitle?: string;
	rolesText?: string;
	roles: { role: string; person: CommunityPerson; email: string }[];
	waysInTitle?: string;
	waysIn: { name: string; effort?: string; href?: string }[];
	cta?: { label: string; href: string };
	readingTitle?: string;
	articles: { title: string; author: string; href: string; imageSrc?: string }[];
};

export const COMMUNITY_CACHE_TAG = 'community';
