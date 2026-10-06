import { getPageMaintainers, type PageMaintainerRole } from '@/components/behind-the-scenes/behind-the-scenes.config';
import type { Person } from '@/generated/storyblok/types/109655/storyblok-components';
import type { WebsiteLanguage } from '@/lib/i18n/utils';
import type { ResolvedArticle } from '@/lib/storyblok/storyblok-article';
import { formatStoryblokUrl, getPersonGitHubUrl, getPersonLinkedInUrl, getRoleLabel } from '@/lib/storyblok/storyblok-utils';
import { getCountryNameFromIsoCode } from '@/lib/types/country';
import { getUnassignedIssueCountAction } from '@/modules/github/github.actions';
import {
	getJournalArticlesByTagSlugAction,
	getJournalAuthorsAction,
	getJournalPersonAction,
	getLatestJournalArticlesAction,
} from '@/modules/journal/journal.actions';
import {
	getAllPersonsAction,
	getCountriesAction,
	getPrimaryRoleLabelsAction,
} from '@/modules/storyblok-content/storyblok-content.actions';
import type { ISbStoryData } from '@storyblok/js';

const FURTHER_READING_LIMIT = 3;
/**
 * Journal tag that collects the community writing — field trips, onboarding volunteers, open
 * source, the Writathon. 15 articles carry it, where the plain "latest" feed served whatever was
 * newest, which is usually about cash transfers rather than about the people behind them.
 */
const COMMUNITY_TAG_SLUG = 'volunteering';
/** Roles that write code. Everything else is the majority of this community. */
const CODE_ROLES = new Set(['developer', 'mobile-dev']);
/** Faces shown per world before the rest becomes a +N count. */
const WORLD_FACE_LIMIT = 4;
/** Roles named outright before the rest becomes "and many more". */
const ROLE_LIST_LIMIT = 6;
/** Roles shown per visit. Sampled from the 16 in use, so no role can crowd out the others. */
const SPOTLIGHT_LIMIT = 5;
const TEASER_AVATAR_SIZE = 24;
const TEASER_AVATAR_LIMIT = 3;
/** Hard cap to keep this card short even when a role has a longer roster. */
const PAGE_MAINTAINERS_PER_ROLE_LIMIT = 3;
const PAGE_MAINTAINER_ROLE_ORDER: readonly PageMaintainerRole[] = ['content', 'ux-design', 'development', 'research'];
const PAGE_MAINTAINER_ROLE_LABELS: Record<PageMaintainerRole, string> = {
	content: 'Content',
	'ux-design': 'UX Design',
	development: 'Development',
	research: 'Research',
};
const PAGE_MAINTAINER_ROLE_PRIORITY = new Map(PAGE_MAINTAINER_ROLE_ORDER.map((role, index) => [role, index]));

/** Someone answerable for this particular page, in the order the CMS lists them. */
export type ResolvedMaintainer = {
	roleKey: PageMaintainerRole;
	person: ISbStoryData<Person>;
	roleLabel: string;
	contactUrl: string | null;
};

/** A role the community needs, shown through one of the real people who fills it. */
export type RoleSpotlight = {
	roleKey: string;
	roleLabel: string;
	person: ISbStoryData<Person>;
	/**
	 * Somewhere the reader can reach this person directly. LinkedIn first: 58 of 60 people have a
	 * handle, where only 28 have GitHub — leading with GitHub would make developers the only
	 * contactable half of the community.
	 */
	contactUrl: string | null;
};

/** Fisher–Yates. Written out because this workspace has no lodash and the array is 16 long. */
const shuffled = <T>(items: T[]): T[] => {
	const copy = [...items];
	for (let i = copy.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[copy[i], copy[j]] = [copy[j], copy[i]];
	}

	return copy;
};

const pickContactUrl = (person: ISbStoryData<Person>): string | null => {
	const { linkedinName, githubName } = person.content;

	if (linkedinName?.trim()) {
		return getPersonLinkedInUrl(linkedinName.trim().replace(/\/$/, ''));
	}

	return githubName?.trim() ? getPersonGitHubUrl(githubName.trim()) : null;
};

/** One of the three settings the work happens in. */
export type CommunityWorld = {
	key: 'countries' | 'code' | 'table';
	people: ISbStoryData<Person>[];
	total: number;
	/** True when this setting can be done from anywhere. Only the country work cannot. */
	remote: boolean;
	/** Countries this world is tied to, each with its country page when one exists. */
	placeItems?: { name: string; slug: string | null }[];
	/** The most common roles in this world, named outright. Derived, never hardcoded. */
	roles?: string;
	/** True when more roles exist than are named. */
	moreRoles?: boolean;
};

export type BehindTheScenesData = {
	pageMaintainers: ResolvedMaintainer[];
	roleSpotlights: RoleSpotlight[];
	worlds: CommunityWorld[];
	/** Open issues nobody has picked up, or null when GitHub could not be reached. */
	unassignedIssues: number | null;
	/** How many distinct roles the draw can pull from. */
	roleCount: number;
	countries: number;
	peopleTotal: number;
	formerVolunteers: ISbStoryData<Person>[];
	furtherReading: ISbStoryData<ResolvedArticle>[];
	roleLabels: Record<string, string>;
	counts: {
		volunteers: number;
		journalAuthors: number;
	};
};

/**
 * Every source is resolved independently and degrades to an empty section rather than failing the
 * whole panel, matching how the open-source content block treats a failed GitHub call.
 */
export const loadBehindTheScenesData = async (programSlug: string, lang: WebsiteLanguage): Promise<BehindTheScenesData> => {
	const maintainerEntries = getPageMaintainers(programSlug);

	const [
		maintainerResults,
		allPersonsResult,
		roleLabelsResult,
		articlesResult,
		authorsResult,
		countriesResult,
		issueCountResult,
	] = await Promise.all([
		Promise.all(maintainerEntries.map((entry) => getJournalPersonAction({ language: lang, slug: entry.person }))),
		getAllPersonsAction(lang),
		getPrimaryRoleLabelsAction(lang),
		(async () => {
			const tagged = await getJournalArticlesByTagSlugAction({ language: lang, tagSlug: COMMUNITY_TAG_SLUG });

			// Falls back to the newest articles rather than dropping the section, the same way every
			// other source here degrades on its own.
			return tagged.success && tagged.data.length > 0 ? tagged : getLatestJournalArticlesAction(lang);
		})(),
		getJournalAuthorsAction(lang),
		getCountriesAction(lang),
		getUnassignedIssueCountAction(),
	]);

	const allPersons = allPersonsResult.success ? allPersonsResult.data : [];

	const formerVolunteers = allPersons.filter((person) => person.content.volunteerStatus === 'inactive');
	const activeVolunteers = allPersons.filter((person) => person.content.volunteerStatus === 'active');

	// Three settings rather than a ranked list: the split is by where the work happens, so the 38
	// people who never touch the repository are a peer group, not a remainder.
	const roleOf = (person: ISbStoryData<Person>) => String(person.content.primaryRole ?? '').trim();
	const inCountries = allPersons.filter((person) => (person.content.countryOffice ?? []).length > 0);
	const inCode = allPersons.filter((person) => CODE_ROLES.has(roleOf(person)));
	const countryUuids = new Set(inCountries.map((person) => person.uuid));
	const aroundTable = allPersons.filter((person) => !CODE_ROLES.has(roleOf(person)) && !countryUuids.has(person.uuid));

	// Named rather than "there" — the reader should not have to guess which countries these are. Each
	// resolves to its own country page where one exists; the ISO code is the only join available.
	const officeCodes = [
		...new Set(inCountries.flatMap((person) => (person.content.countryOffice ?? []).map((code) => String(code).trim()))),
	].filter(Boolean);
	const countrySlugByIso = new Map(
		(countriesResult.success ? countriesResult.data : []).map((country) => [
			String(country.content.isoCode ?? '')
				.trim()
				.toLowerCase(),
			country.slug,
		]),
	);
	const placeItems = officeCodes.map((code) => ({
		name: getCountryNameFromIsoCode(code),
		slug: countrySlugByIso.get(code.toLowerCase()) ?? null,
	}));

	// Derived from the people actually in the bucket, so no role can be silently left out of the
	// copy — a hardcoded list named 6 of the 15 roles here and quietly dropped design.
	const roleLabels = roleLabelsResult.success ? roleLabelsResult.data : {};
	const listRoles = (group: ISbStoryData<Person>[]) => {
		const counts = new Map<string, number>();
		group.forEach((person) => {
			const label = getRoleLabel(person.content.primaryRole, roleLabels);
			if (label) {
				counts.set(label, (counts.get(label) ?? 0) + 1);
			}
		});

		const ordered = [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).map(([label]) => label);
		const shown = ordered.slice(0, ROLE_LIST_LIMIT);
		const hasMore = ordered.length > shown.length;
		// A plain comma list when truncated: the copy supplies its own "and many more", and a
		// conjunction list would render "Strategy, and UX Design and many more".
		const formatted = new Intl.ListFormat(lang, {
			style: 'long',
			type: hasMore ? 'unit' : 'conjunction',
		}).format(shown);

		return { formatted, hasMore };
	};

	const tableRoles = listRoles(aroundTable);

	// Temporary fixed-role setup until those roles come from Storyblok directly.
	const roleEntryCounts = new Map<PageMaintainerRole, number>();
	const pageMaintainers: ResolvedMaintainer[] = maintainerResults
		.flatMap((result, index) => {
			if (!result.success) {
				return [];
			}

			const roleKey = maintainerEntries[index].role;
			const count = roleEntryCounts.get(roleKey) ?? 0;
			if (count >= PAGE_MAINTAINERS_PER_ROLE_LIMIT) {
				return [];
			}

			roleEntryCounts.set(roleKey, count + 1);

			return [
				{
					roleKey,
					person: result.data,
					roleLabel: PAGE_MAINTAINER_ROLE_LABELS[roleKey],
					contactUrl: pickContactUrl(result.data),
				},
			];
		})
		.sort(
			(a, b) => (PAGE_MAINTAINER_ROLE_PRIORITY.get(a.roleKey) ?? 99) - (PAGE_MAINTAINER_ROLE_PRIORITY.get(b.roleKey) ?? 99),
		);

	// Former volunteers are out of the draw: the row invites the reader to ask this person how to
	// join their role, and someone who has left cannot answer that.
	const currentPeople = allPersons.filter((person) => person.content.volunteerStatus !== 'inactive');

	// Sampled by role, not by person. Picking five people at random would surface a developer far too
	// often — one role holds the largest share of the pool — so the draw is over the roles first and
	// only then over the people inside the drawn role. A one-person role gets the same odds as
	// Development, and the face inside each role rotates on every render.
	const peopleByRole = new Map<string, ISbStoryData<Person>[]>();
	currentPeople.forEach((person) => {
		const key = roleOf(person);
		if (!key) {
			return;
		}

		const group = peopleByRole.get(key);
		if (group) {
			group.push(person);
		} else {
			peopleByRole.set(key, [person]);
		}
	});

	const roleSpotlights: RoleSpotlight[] = shuffled([...peopleByRole.keys()])
		.slice(0, SPOTLIGHT_LIMIT)
		.flatMap((roleKey) => {
			const group = peopleByRole.get(roleKey) ?? [];
			const person = group[Math.floor(Math.random() * group.length)];

			return person
				? [
						{
							roleKey,
							roleLabel: getRoleLabel(person.content.primaryRole, roleLabels),
							person,
							contactUrl: pickContactUrl(person),
						},
					]
				: [];
		});

	const allWorlds: CommunityWorld[] = [
		{
			key: 'countries',
			remote: false,
			people: inCountries.slice(0, WORLD_FACE_LIMIT),
			total: inCountries.length,
			placeItems,
		},
		{
			key: 'code',
			remote: true,
			people: inCode.slice(0, WORLD_FACE_LIMIT),
			total: inCode.length,
		},
		{
			key: 'table',
			remote: true,
			people: aroundTable.slice(0, WORLD_FACE_LIMIT),
			total: aroundTable.length,
			roles: tableRoles.formatted,
			moreRoles: tableRoles.hasMore,
		},
	];
	const worlds = allWorlds.filter((world) => world.total > 0);

	// Counted over the same pool the draw uses, so "5 of the N roles" describes what is actually
	// reachable rather than every role the community has ever had.
	const roleCount = peopleByRole.size;
	const countries = new Set(allPersons.map((person) => String(person.content.country ?? '').trim()).filter(Boolean)).size;

	return {
		pageMaintainers,
		roleSpotlights,
		worlds,
		unassignedIssues: issueCountResult.success ? issueCountResult.data : null,
		roleCount,
		countries,
		peopleTotal: allPersons.length,
		formerVolunteers,
		furtherReading: articlesResult.success ? articlesResult.data.slice(0, FURTHER_READING_LIMIT) : [],
		roleLabels,
		counts: {
			volunteers: activeVolunteers.length,
			journalAuthors: authorsResult.success ? authorsResult.data.length : 0,
		},
	};
};

export type TeaserAvatar = {
	src: string;
	alt: string;
};

export const buildTeaserAvatars = (data: BehindTheScenesData): TeaserAvatar[] =>
	data.roleSpotlights.slice(0, TEASER_AVATAR_LIMIT).flatMap(({ person }) => {
		const avatar = person.content.avatar;

		return avatar?.filename
			? [
					{
						src: formatStoryblokUrl(avatar.filename, TEASER_AVATAR_SIZE, TEASER_AVATAR_SIZE, avatar.focus),
						alt: person.content.fullName,
					},
				]
			: [];
	});

export const countDistinctCountries = (persons: ISbStoryData<Person>[]): number =>
	new Set(
		persons
			.map((person) => (typeof person.content.country === 'string' ? person.content.country.trim() : ''))
			.filter(Boolean),
	).size;
