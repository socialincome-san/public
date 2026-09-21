import type { CampaignGlobals, Faq } from '@/generated/storyblok/types/109655/storyblok-components';
import { fetchStoryblokCampaignGlobals } from '@/integrations/storyblok/storyblok-campaign.integration';
import { Translator } from '@/lib/i18n/translator';
import type { WebsiteLanguage } from '@/lib/i18n/utils';
import { resultFail, resultOk, type ServiceResult } from '@/lib/service-result';
import { formatStoryblokUrl } from '@/lib/services/storyblok/storyblok.utils';
import { getMetadata } from '@/lib/utils/metadata';
import type { ISbStoryData } from '@storyblok/js';
import type { Metadata } from 'next';
import type { CampaignNewsletterContent, CampaignPageContent } from './campaign.types';

const campaignPageNamespaces = [
	'website-campaign',
	'website-common',
	'website-videos',
	'website-newsletter',
	'website-faq',
] as const;

const NEWSLETTER_IMAGE_SIZE = 60;

const emptyNewsletterContent: CampaignNewsletterContent = {
	title: '',
	senderName: '',
	imageSrc: null,
	imageAlt: '',
};

export const getCampaignPageContent = async (
	lang: WebsiteLanguage,
	campaignFaqs?: unknown,
): Promise<ServiceResult<CampaignPageContent>> => {
	try {
		const [translator, globalsResult] = await Promise.all([
			Translator.getInstance({ language: lang, namespaces: [...campaignPageNamespaces] }),
			fetchStoryblokCampaignGlobals(lang),
		]);

		const globals = globalsResult.success ? globalsResult.data?.content : null;
		const faqs =
			Array.isArray(campaignFaqs) && campaignFaqs.length > 0
				? toResolvedFaqs(campaignFaqs)
				: globals
					? toResolvedFaqs(globals.faq)
					: [];
		const videoPlaybackIds = globals ? toVideoPlaybackIds(globals) : [];
		const newsletter = globals ? toNewsletterContent(globals) : emptyNewsletterContent;

		return resultOk({ translator, faqs, videoPlaybackIds, newsletter });
	} catch (error) {
		console.error(error);

		return resultFail('Could not load campaign page content');
	}
};

export const getCampaignPageMetadata = async (
	lang: WebsiteLanguage,
	campaign: {
		title: string;
		description: string;
		primaryImage?: { filename?: string | null } | null;
	},
): Promise<ServiceResult<Metadata>> => {
	const primaryImage = campaign.primaryImage?.filename?.trim();
	const campaignMetadata = {
		title: campaign.title,
		description: campaign.description,
		...(primaryImage
			? {
					openGraph: {
						title: campaign.title,
						description: campaign.description,
						images: primaryImage,
					},
					twitter: {
						title: campaign.title,
						card: 'summary_large_image' as const,
						site: '@so_income',
						creator: '@so_income',
						images: primaryImage,
					},
				}
			: {}),
	};

	return resultOk(await getMetadata(lang, 'website-campaign', campaignMetadata));
};

export const getCampaignFallbackMetadata = async (lang: WebsiteLanguage): Promise<ServiceResult<Metadata>> =>
	resultOk(await getMetadata(lang, 'website-campaign'));

const toResolvedFaqs = (faqReferences: unknown[]): ISbStoryData<Faq>[] =>
	faqReferences.filter((reference): reference is ISbStoryData<Faq> => typeof reference === 'object' && reference !== null);

const toVideoPlaybackIds = (globals: CampaignGlobals): string[] =>
	[globals.muxPlaybackId1, globals.muxPlaybackId2, globals.muxPlaybackId3]
		.map((value) => normalizeMuxPlaybackId(value))
		.filter((playbackId): playbackId is string => playbackId !== null);

const toNewsletterContent = (globals: CampaignGlobals): CampaignNewsletterContent => {
	const senderName = globals.newsletterSenderName?.trim() ?? '';
	const filename = globals.newsletterImage?.filename?.trim();
	const imageAlt = globals.newsletterImage?.alt?.trim() ?? '';

	return {
		title: globals.newsletterTitle?.trim() ?? '',
		senderName,
		imageSrc: filename
			? formatStoryblokUrl(filename, NEWSLETTER_IMAGE_SIZE, NEWSLETTER_IMAGE_SIZE, globals.newsletterImage.focus)
			: null,
		imageAlt: imageAlt || senderName,
	};
};

const normalizeMuxPlaybackId = (value: string): string | null => {
	const trimmed = value.trim();
	if (!trimmed) {
		return null;
	}

	const playbackIdFromPlayerUrl = trimmed.match(/player\.mux\.com\/([^/?#]+)/)?.[1];
	if (playbackIdFromPlayerUrl) {
		return playbackIdFromPlayerUrl;
	}

	const playbackIdFromStreamUrl = trimmed.match(/stream\.mux\.com\/([^/.?#]+)/)?.[1];
	if (playbackIdFromStreamUrl) {
		return playbackIdFromStreamUrl;
	}

	return trimmed;
};
