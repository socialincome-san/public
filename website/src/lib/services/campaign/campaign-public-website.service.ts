import type { Faq } from '@/generated/storyblok/types/109655/storyblok-components';
import { Translator } from '@/lib/i18n/translator';
import type { WebsiteLanguage } from '@/lib/i18n/utils';
import {
	DEFAULT_OPEN_GRAPH_IMAGE_URL,
	DEFAULT_TWITTER_IMAGE_URL,
	getMetadata,
	toProductionMetadataUrl,
} from '@/lib/utils/metadata';
import type { ISbStoryData } from '@storyblok/js';
import { BaseService } from '../core/base.service';
import type { ServiceResult } from '../core/base.types';
import type { StoryblokService } from '../storyblok/storyblok.service';
import type { CampaignPageContent } from './campaign-public-website.types';
import type { CampaignReadService } from './campaign-read.service';
import type { CampaignPage } from './campaign.types';

const campaignPageNamespaces = ['website-campaign', 'website-videos', 'website-newsletter', 'website-faq'] as const;

export class CampaignPublicWebsiteService extends BaseService {
	private readonly storyblok: StoryblokService;
	private readonly campaignRead: CampaignReadService;

	constructor(db: BaseService['db'], storyblok: StoryblokService, campaignRead: CampaignReadService) {
		super(db);
		this.storyblok = storyblok;
		this.campaignRead = campaignRead;
	}

	async getMetadataForSlug(slug: string, lang: WebsiteLanguage) {
		const result = await this.campaignRead.getBySlug(slug);
		if (!result.success || !result.data?.isActive) {
			return this.getFallbackMetadata(lang);
		}

		return this.getPageMetadata(lang, result.data);
	}

	async getPageContent(lang: WebsiteLanguage): Promise<ServiceResult<CampaignPageContent>> {
		try {
			const [translator, faqsResult] = await Promise.all([
				Translator.getInstance({ language: lang, namespaces: [...campaignPageNamespaces] }),
				this.storyblok.getFaqs(lang, 5),
			]);

			const faqs: ISbStoryData<Faq>[] = faqsResult.success ? faqsResult.data : [];

			return this.resultOk({ translator, faqs });
		} catch (error) {
			this.logger.error(error);

			return this.resultFail(`Could not load campaign page content: ${JSON.stringify(error)}`);
		}
	}

	getPageMetadata(
		lang: WebsiteLanguage,
		campaign: Pick<CampaignPage, 'title' | 'metadataDescription' | 'metadataOgImage' | 'metadataTwitterImage'>,
	) {
		const description = campaign.metadataDescription?.trim();

		return getMetadata(lang, 'website-campaign', {
			title: campaign.title,
			...(description ? { description } : {}),
			openGraph: {
				title: campaign.title,
				...(description ? { description } : {}),
				images: toProductionMetadataUrl(campaign.metadataOgImage, DEFAULT_OPEN_GRAPH_IMAGE_URL),
			},
			twitter: {
				title: campaign.title,
				...(description ? { description } : {}),
				images: toProductionMetadataUrl(campaign.metadataTwitterImage, DEFAULT_TWITTER_IMAGE_URL),
			},
		});
	}

	getFallbackMetadata(lang: WebsiteLanguage) {
		return getMetadata(lang, 'website-campaign');
	}
}
