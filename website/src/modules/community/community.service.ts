import type { Person } from '@/generated/storyblok/types/109655/storyblok-components';
import type { StoryblokMultilink } from '@/generated/storyblok/types/storyblok';
import { resultFail, resultOk, type Result } from '@/lib/result';
import {
	createWebsiteJournalArticleLink,
	createWebsitePersonLink,
	formatStoryblokUrl,
	getArticleTitle,
	getPersonAvatarSrc,
	getPersonDisplayName,
	getRoleLabel,
	resolveStoryblokLink,
} from '@/lib/storyblok/storyblok-utils';
import {
	getAllPersons,
	getArticlesByUuids,
	getCommunityGlobals,
	getPrimaryRoleLabels,
} from '@/modules/storyblok-content/storyblok-content.service';
import type { ISbStoryData } from '@storyblok/js';
import type { CommunityPage, StoryReference } from './community.schemas';
import type { CommunityPanelData, CommunityPerson } from './community.types';

const ARTICLE_IMAGE_SIZE = 128;

const toUuid = (reference: StoryReference) => (typeof reference === 'string' ? reference : reference.uuid);

const toHref = (link: StoryblokMultilink | undefined, language: string, region: string) => {
	const href = resolveStoryblokLink(link, language, region);

	return href === '#' ? undefined : href;
};

const blankToUndefined = (value: string | undefined) => (value?.trim() ? value.trim() : undefined);

export const getCommunityPanelData = async (
	page: CommunityPage,
	language: string,
	region: string,
): Promise<Result<CommunityPanelData | null>> => {
	if (!page.communityEnabled) {
		return resultOk(null);
	}

	const pageArticles = (page.communityArticles ?? []).map(toUuid);
	const globalsPromise = getCommunityGlobals(language);
	const articlesPromise =
		pageArticles.length > 0
			? getArticlesByUuids(language, pageArticles)
			: globalsPromise.then((result) =>
					getArticlesByUuids(language, result.success ? (result.data.content.defaultArticles ?? []).map(toUuid) : []),
				);
	const [globalsResult, personsResult, roleLabelsResult, articlesResult] = await Promise.all([
		globalsPromise,
		getAllPersons(language),
		getPrimaryRoleLabels(language),
		articlesPromise,
	]);
	if (!globalsResult.success || !personsResult.success || !roleLabelsResult.success) {
		return resultFail('Could not load the community panel.');
	}

	const globals = globalsResult.data.content;
	const persons = personsResult.data;
	const roleLabels = roleLabelsResult.data;
	const personsByUuid = new Map(persons.map((person) => [person.uuid, person]));

	const toPerson = (person: ISbStoryData<Person>): CommunityPerson => ({
		name: getPersonDisplayName(person),
		imageSrc: getPersonAvatarSrc(person) ?? undefined,
		href: createWebsitePersonLink(person.slug, language, region),
	});
	const findPerson = (reference: StoryReference) => {
		const person = personsByUuid.get(toUuid(reference));

		return person ? toPerson(person) : undefined;
	};
	const findPeople = (references: StoryReference[] = []) =>
		references.map(findPerson).filter((person) => person !== undefined);

	const activeVolunteers = persons.filter((person) => person.content.volunteerStatus === 'active');
	const countries = new Set(activeVolunteers.map((person) => String(person.content.country ?? '')).filter(Boolean));
	const ctaLabel = blankToUndefined(globals.ctaLabel);
	const ctaHref = toHref(globals.ctaLink, language, region);

	return resultOk({
		volunteerCount: activeVolunteers.length,
		countryCount: countries.size,
		roleCount: Object.keys(roleLabels).length,
		headline: globals.headline,
		headlineEmphasis: blankToUndefined(globals.headlineEmphasis),
		intro: blankToUndefined(globals.intro),
		volunteersHref: toHref(globals.volunteersLink, language, region),
		tickerItems: (globals.tickerItems ?? '')
			.split('\n')
			.map((item) => item.trim())
			.filter(Boolean),
		mistakeText: blankToUndefined(globals.mistakeText),
		contactEmail: blankToUndefined(page.communityContactEmail),
		maintainers: (page.communityContributors ?? [])
			.map((group) => ({ label: group.label, people: findPeople(group.people) }))
			.filter((group) => group.people.length > 0),
		worldsTitle: blankToUndefined(globals.worldsTitle),
		worlds: (globals.worlds ?? []).map((world) => ({
			name: world.name,
			tag: blankToUndefined(world.tag),
			text: blankToUndefined(world.text),
			people: findPeople(world.people),
		})),
		rolesTitle: blankToUndefined(globals.rolesTitle),
		rolesText: blankToUndefined(globals.rolesText),
		roles: (globals.roles ?? []).flatMap((role) => {
			const person = findPerson(role.person);

			return person ? [{ role: getRoleLabel(role.role, roleLabels), person, email: role.email }] : [];
		}),
		waysInTitle: blankToUndefined(globals.waysInTitle),
		waysIn: (globals.waysIn ?? []).map((way) => ({
			name: way.name,
			effort: blankToUndefined(way.effort),
			href: toHref(way.link, language, region),
		})),
		cta: ctaLabel && ctaHref ? { label: ctaLabel, href: ctaHref } : undefined,
		readingTitle: blankToUndefined(globals.readingTitle),
		articles: (articlesResult.success ? articlesResult.data : []).map((article) => ({
			title: getArticleTitle(article),
			author: getPersonDisplayName(article.content.author),
			href: createWebsiteJournalArticleLink(article.slug, language, region),
			imageSrc: article.content.image?.filename
				? formatStoryblokUrl(
						article.content.image.filename,
						ARTICLE_IMAGE_SIZE,
						ARTICLE_IMAGE_SIZE,
						article.content.image.focus,
					)
				: undefined,
		})),
	});
};
