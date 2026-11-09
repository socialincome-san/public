import { getCountryTitle } from '@/components/storyblok/country/country.utils';
import type { Country } from '@/generated/storyblok/types/109655/storyblok-components';
import type { WebsiteCurrency, WebsiteLanguage } from '@/lib/i18n/utils';
import {
	getPageStoryPath,
	getWebsitePathTailFromStoryblokSlug,
	getWebsitePublicPath,
	normalizeStoryblokSlug,
	STORYBLOK_PAGES_FOLDER,
} from '@/lib/storyblok/storyblok-paths';
import { getPageFolderNameAction, getStoryTitleAction } from '@/modules/storyblok-content/storyblok-content.actions';
import type { StoryTitleData } from '@/modules/storyblok-content/storyblok-content.types';
import type { BreadcrumbLinkItem } from '@socialincome/design-system/navigation/breadcrumb/breadcrumb';
import { getTranslations } from 'next-intl/server';

export type BreadcrumbLink = BreadcrumbLinkItem;

type BuildBreadcrumbLinksParams = {
	fullSlug: string;
	currentLabel: string;
	lang: WebsiteLanguage;
	currency: WebsiteCurrency;
	includeCurrentLabel?: boolean;
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

// A folder without a page of its own, such as get-involved/individuals, is named but not linked
const fetchAncestor = async (slugPath: string, lang: WebsiteLanguage, fallbackSegment: string) => {
	const result = await getStoryTitleAction({ storyPath: slugPath, language: lang });
	if (result.success) {
		return { label: getStoryLabel(result.data, fallbackSegment), linked: true };
	}
	const folderName = await getPageFolderNameAction({ storyPath: slugPath, language: lang });

	return folderName.success
		? { label: folderName.data, linked: false }
		: { label: humanizeSlugSegment(fallbackSegment), linked: true };
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
	currency,
	includeCurrentLabel = true,
}: BuildBreadcrumbLinksParams): Promise<BreadcrumbLink[]> => {
	const t = await getTranslations('website-common');
	const normalizedFullSlug = normalizeStoryblokSlug(fullSlug);
	const segments = normalizedFullSlug.split('/').filter(Boolean);

	if (segments.length === 0) {
		return [];
	}

	const links: BreadcrumbLink[] = [
		{
			href: getWebsitePublicPath(lang, currency, ''),
			label: capitalizeLabel(t('breadcrumb.home')),
		},
	];

	const ancestorStoryblokPaths = getAncestorStoryblokPaths(normalizedFullSlug);

	links.push(
		...(await Promise.all(
			ancestorStoryblokPaths.map(async (storyblokPath) => {
				const segment = storyblokPath.split('/').at(-1) ?? storyblokPath;
				const { label, linked } = await fetchAncestor(storyblokPath, lang, segment);

				return {
					href: linked
						? getWebsitePublicPath(lang, currency, getWebsitePathTailFromStoryblokSlug(storyblokPath))
						: undefined,
					label: capitalizeLabel(label),
				};
			}),
		)),
	);
	if (includeCurrentLabel) {
		links.push({
			href: '',
			label: currentLabel,
		});
	}

	return links;
};
