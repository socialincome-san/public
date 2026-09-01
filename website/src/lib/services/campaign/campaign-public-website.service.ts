import type { Campaign, CampaignGlobals, Faq } from '@/generated/storyblok/types/109655/storyblok-components';
import { Translator } from '@/lib/i18n/translator';
import type { WebsiteLanguage } from '@/lib/i18n/utils';
import { STORYBLOK_CAMPAIGN_GLOBALS_PATH } from '@/lib/storyblok/storyblok-paths';
import { getMetadata } from '@/lib/utils/metadata';
import type { ISbStoryData } from '@storyblok/js';
import { BaseService } from '../core/base.service';
import type { ServiceResult } from '../core/base.types';
import type { StoryblokService } from '../storyblok/storyblok.service';
import type { CampaignPageContent } from './campaign-public-website.types';

const campaignPageNamespaces = [
	'website-campaign',
	'website-common',
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

	async getPageContent(lang: WebsiteLanguage, campaignFaqs?: Campaign['faq']): Promise<ServiceResult<CampaignPageContent>> {
		try {
			const [translator, faqs] = await Promise.all([
				Translator.getInstance({ language: lang, namespaces: [...campaignPageNamespaces] }),
				this.resolveCampaignFaqs(lang, campaignFaqs),
			]);

			return this.resultOk({ translator, faqs });
		} catch (error) {
			console.error(error);

			return this.resultFail(`Could not load campaign page content: ${JSON.stringify(error)}`);
		}
	}

	private async resolveCampaignFaqs(lang: WebsiteLanguage, campaignFaqs?: Campaign['faq']): Promise<ISbStoryData<Faq>[]> {
		if (campaignFaqs?.length) {
			return CampaignPublicWebsiteService.toResolvedFaqs(campaignFaqs);
		}

		const globalsResult = await this.storyblok.getStoryWithFallback<ISbStoryData<CampaignGlobals>>(
			STORYBLOK_CAMPAIGN_GLOBALS_PATH,
			lang,
		);

		if (!globalsResult.success) {
			return [];
		}

		return CampaignPublicWebsiteService.toResolvedFaqs(globalsResult.data.content.faq);
	}

	private static toResolvedFaqs(faqReferences: (ISbStoryData<Faq> | string)[]): ISbStoryData<Faq>[] {
		return faqReferences.filter((reference): reference is ISbStoryData<Faq> => typeof reference !== 'string');
	}

	getPageMetadata(
		lang: WebsiteLanguage,
		campaign: {
			title: string;
			description: string;
			primaryImage?: { filename?: string | null } | null;
		},
	) {
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

		return getMetadata(lang, 'website-campaign', campaignMetadata);
	}

	getFallbackMetadata(lang: WebsiteLanguage) {
		return getMetadata(lang, 'website-campaign');
	}
}
