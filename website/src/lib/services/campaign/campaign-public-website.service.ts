import type { Faq } from '@/generated/storyblok/types/109655/storyblok-components';
import { Translator } from '@/lib/i18n/translator';
import type { WebsiteLanguage } from '@/lib/i18n/utils';
import { getMetadata } from '@/lib/utils/metadata';
import type { ISbStoryData } from '@storyblok/js';
import { BaseService } from '../core/base.service';
import type { ServiceResult } from '../core/base.types';
import type { StoryblokService } from '../storyblok/storyblok.service';
import type { CampaignPageContent } from './campaign-public-website.types';
import type { CampaignPage } from './campaign.types';

const campaignPageNamespaces = [
	'website-campaign',
	'website-donate',
	'website-videos',
	'website-newsletter',
	'website-faq',
] as const;

export class CampaignPublicWebsiteService extends BaseService {
	private readonly storyblok: StoryblokService;

	constructor(db: BaseService['db'], storyblok: StoryblokService) {
		super(db);
		this.storyblok = storyblok;
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
		const campaignMetadata =
			campaign.metadataDescription && campaign.metadataOgImage && campaign.metadataTwitterImage
				? {
						title: campaign.title,
						description: campaign.metadataDescription,
						openGraph: {
							title: campaign.title,
							description: campaign.metadataDescription,
							images: campaign.metadataOgImage,
						},
						twitter: {
							title: campaign.title,
							card: 'summary_large_image' as const,
							site: '@so_income',
							creator: '@so_income',
							images: campaign.metadataTwitterImage,
						},
					}
				: undefined;

		return getMetadata(lang, 'website-campaign', campaignMetadata);
	}

	getFallbackMetadata(lang: WebsiteLanguage) {
		return getMetadata(lang, 'website-campaign');
	}
}
