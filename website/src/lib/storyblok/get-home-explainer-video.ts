import type { ModalCards, Page } from '@/generated/storyblok/types/109655/storyblok-components';
import { WebsiteLanguage, WebsiteRegion } from '@/lib/i18n/utils';
import { services } from '@/lib/services/services';
import { resolveStoryblokLink } from '@/lib/services/storyblok/storyblok.utils';
import { getHomeStoryPath } from '@/lib/storyblok/storyblok-paths';
import { VimeoVideoMatchAndExtract } from '@/lib/utils/UrlVideoParser';
import type { ISbStoryData } from '@storyblok/js';

const vimeoMatcher = new VimeoVideoMatchAndExtract();

export type HomeExplainerVideo = {
	thumbnailSrc: string;
	thumbnailAlt?: string;
	embedUrl: string;
	dialogTitle: string;
};

const findModalCardsBlock = (content: Page['content']): ModalCards | undefined =>
	content?.find((block): block is ModalCards => block.component === 'modalCards');

export const getHomeExplainerVideo = async (
	lang: WebsiteLanguage,
	region: WebsiteRegion,
): Promise<HomeExplainerVideo | null> => {
	const storyResult = await services.storyblok.getStoryWithFallback<ISbStoryData<Page>>(getHomeStoryPath(), lang);

	if (!storyResult.success || !storyResult.data) {
		return null;
	}

	const modalCards = findModalCardsBlock(storyResult.data.content.content);
	if (!modalCards) {
		return null;
	}

	const dialogTitle = modalCards.labelForExplainerVideo?.trim();
	const resolvedVideoUrl = modalCards.linkToExplainerVideo
		? resolveStoryblokLink(modalCards.linkToExplainerVideo, lang, region)
		: null;
	const embedUrl = resolvedVideoUrl ? vimeoMatcher.parseUrl(resolvedVideoUrl) : null;
	const thumbnailSrc = modalCards.explainerVideoThumbnail?.filename;

	if (!dialogTitle || !embedUrl || !thumbnailSrc) {
		return null;
	}

	return {
		thumbnailSrc,
		thumbnailAlt: modalCards.explainerVideoThumbnail?.alt ?? dialogTitle,
		embedUrl,
		dialogTitle,
	};
};
