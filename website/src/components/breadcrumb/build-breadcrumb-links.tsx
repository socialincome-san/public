import { getCountryTitle } from '@/components/storyblok/country/country.utils';
import type { Country } from '@/generated/storyblok/types/109655/storyblok-components';
import { Translator } from '@/lib/i18n/translator';
import type { WebsiteLanguage, WebsiteRegion } from '@/lib/i18n/utils';
import { services } from '@/lib/services/services';
import type { StoryTitleData } from '@/lib/services/storyblok/storyblok.service';
import {
	getPageStoryPath,
	getWebsitePathTailFromStoryblokSlug,
	getWebsitePublicPath,
	STORYBLOK_PAGES_FOLDER,
} from '@/lib/storyblok/storyblok-paths';

export type BreadcrumbLink = {
	label: string;
	href: string;
};

type BuildBreadcrumbLinksParams = {
	fullSlug: string;
	currentLabel: string;
	lang: WebsiteLanguage;
	region: WebsiteRegion;
};

const humanizeSlugSegment = (segment: string) => {
	return segment
		.split('-')
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
		.join(' ');
};

const capitalizeLabel = (label: string) => {
	return label
		.split(' ')
		.filter(Boolean)
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
		.join(' ');
};

const getStoryLabel = (story: StoryTitleData, fallbackSegment: string) => {
	if (story.content?.component === 'Country') {
		return getCountryTitle(story.content as Country);
	}

	return story.name?.trim() ?? humanizeSlugSegment(fallbackSegment);
};

const fetchStoryLabel = async (slugPath: string, lang: WebsiteLanguage, fallbackSegment: string) => {
	const result = await services.storyblok.getStoryTitle(slugPath, lang);

	if (!result.success) {
		return humanizeSlugSegment(fallbackSegment);
	}

	return getStoryLabel(result.data, fallbackSegment);
};

const getAncestorStoryblokPaths = (fullSlug: string): string[] => {
	const segments = fullSlug.split('/').filter(Boolean);

	if (segments[0] === STORYBLOK_PAGES_FOLDER) {
		const pageSegments = segments.slice(1);

		return pageSegments.slice(0, -1).map((_, index) => getPageStoryPath(pageSegments.slice(0, index + 1).join('/')));
	}

	return segments.slice(0, -1).map((_, index) => segments.slice(0, index + 1).join('/'));
};

export const buildBreadcrumbLinks = async ({
	fullSlug,
	currentLabel,
	lang,
	region,
}: BuildBreadcrumbLinksParams): Promise<BreadcrumbLink[]> => {
	const translator = await Translator.getInstance({ language: lang, namespaces: ['website-common'] });
	const segments = fullSlug.split('/').filter(Boolean);

	if (segments.length === 0) {
		return [];
	}

	const links: BreadcrumbLink[] = [
		{
			href: getWebsitePublicPath(lang, region, ''),
			label: capitalizeLabel(translator.t('breadcrumb.home')),
		},
	];

	const ancestorStoryblokPaths = getAncestorStoryblokPaths(fullSlug);

	links.push(
		...(await Promise.all(
			ancestorStoryblokPaths.map(async (storyblokPath) => {
				const segment = storyblokPath.split('/').at(-1) ?? storyblokPath;
				const label = await fetchStoryLabel(storyblokPath, lang, segment);

				return {
					href: getWebsitePublicPath(lang, region, getWebsitePathTailFromStoryblokSlug(storyblokPath)),
					label: capitalizeLabel(label),
				};
			}),
		)),
	);

	links.push({
		href: '',
		label: currentLabel,
	});

	return links;
};
