import NewsletterGlowContainer from '@/components/newsletter-glow-container/newsletter-glow-container';
import { StoryblokActionButton } from '@/components/storyblok/StoryblokActionButton';
import { StoryblokCampaignDonate } from '@/components/storyblok/StoryblokCampaignDonate';
import { StoryblokEmbeddedVideoPlayer } from '@/components/storyblok/StoryblokEmbeddedVideoPlayer';
import { StoryblokImageWithCaption } from '@/components/storyblok/StoryblokImageWithCaption';
import { StoryblokReferencesGroup } from '@/components/storyblok/StoryblokReferencesGroup';
import { WebsiteRegion } from '@/i18n';
import { StoryblokArticle } from '@socialincome/shared/src/storyblok/journal';
import { LanguageCode } from '@socialincome/shared/src/types/language';
import { Translator } from '@socialincome/shared/src/utils/i18n';
import { QuotedText } from '@socialincome/ui';
import { render } from 'storyblok-rich-text-react-renderer';

export function richTextRenderer(
	articleData: StoryblokArticle,
	translator: Translator,
	lang: LanguageCode,
	region: WebsiteRegion,
) {
	return render(articleData.content, {
		blokResolvers: {
			['quotedText']: (props: any) => <QuotedText {...props} />,
			['imageWithCaption']: (props: any) => <StoryblokImageWithCaption {...props} />,
			['embeddedVideo']: (props: any) => <StoryblokEmbeddedVideoPlayer {...props} />,
			['referencesGroup']: (props: any) => <StoryblokReferencesGroup translator={translator} {...props} lang={lang} />,
			['actionButton']: (props: any) => <StoryblokActionButton {...props} />,
			['newsletterSignup']: (_) => (
				<NewsletterGlowContainer
					className="rounded-lg"
					lang={lang}
					title={translator.t('popup.information-label')}
					formTranslations={{
						informationLabel: translator.t('popup.information-label'),
						toastSuccess: translator.t('popup.toast-success'),
						toastFailure: translator.t('popup.toast-failure'),
						emailPlaceholder: translator.t('popup.email-placeholder'),
						buttonAddSubscriber: translator.t('popup.button-subscribe'),
					}}
				/>
			),
			['campaignDonate']: (props: any) => (
				<StoryblokCampaignDonate lang={lang} {...props} translator={translator} region={region} />
			),
		},
	});
}
