import { getCountryTitle } from '@/components/storyblok/country/country.utils';
import type { Country } from '@/generated/storyblok/types/109655/storyblok-components';
import { Translator } from '@/lib/i18n/translator';
import type { WebsiteLanguage, WebsiteRegion } from '@/lib/i18n/utils';
import type { StoryTitleData } from '@/lib/services/storyblok/storyblok.service';
import { services } from '@/lib/services/services';
import { NEW_WEBSITE_SLUG } from '@/lib/utils/const';

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

	return story.name?.trim() || humanizeSlugSegment(fallbackSegment);
};

const fetchStoryLabel = async (slugPath: string, lang: WebsiteLanguage, fallbackSegment: string) => {
	const result = await services.storyblok.getStoryTitle(slugPath, lang);

	if (!result.success) {
		return humanizeSlugSegment(fallbackSegment);
	}

	return getStoryLabel(result.data, fallbackSegment);
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
			href: `/${lang}/${region}/${NEW_WEBSITE_SLUG}`,
			label: capitalizeLabel(translator.t('breadcrumb.home')),
		},
	];

	const startIndex = segments[0] === NEW_WEBSITE_SLUG ? 1 : 0;
	const ancestorSegments = segments
		.filter((segment) => segment !== lang.toLowerCase())
		.filter((segment) => segment !== region.toLowerCase())
		.slice(startIndex, -1);

	const ancestorLabels = await Promise.all(
		ancestorSegments.map((segment, index) => {
			const slugPath = segments.slice(0, startIndex + index + 1).join('/');

			return fetchStoryLabel(slugPath, lang, segment);
		}),
	);

	for (const [index, segment] of ancestorSegments.entries()) {
		const slugPath = segments.slice(0, startIndex + index + 1).join('/');

		links.push({
			href: `/${lang}/${region}/${slugPath}`,
			label: capitalizeLabel(ancestorLabels[index]),
		});
	}

	links.push({
		href: '',
		label: currentLabel,
	});

	return links;
};
