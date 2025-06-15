import NewsletterGlowContainer from '@/components/newsletter-glow-container/newsletter-glow-container';
import { StoryblokActionButton } from '@/components/storyblok/StoryblokActionButton';
import { StoryblokCampaignDonate } from '@/components/storyblok/StoryblokCampaignDonate';
import { StoryblokEmbeddedVideoPlayer } from '@/components/storyblok/StoryblokEmbeddedVideoPlayer';
import { StoryblokImageWithCaption } from '@/components/storyblok/StoryblokImageWithCaption';
import { StoryblokReferencesGroup } from '@/components/storyblok/StoryblokReferencesGroup';
import { WebsiteRegion } from '@/i18n';
import { LanguageCode } from '@socialincome/shared/src/types/language';
import { Translator } from '@socialincome/shared/src/utils/i18n';
import { QuotedText, Table, TableCell, TableHead, TableRow } from '@socialincome/ui';
import {
	NODE_TABLE,
	NODE_TABLE_CELL,
	NODE_TABLE_HEADER,
	NODE_TABLE_ROW,
	render,
	StoryblokRichtext,
} from 'storyblok-rich-text-react-renderer';

export function richTextRenderer(
	richTextDocument: StoryblokRichtext,
	translator: Translator,
	lang: LanguageCode,
	region: WebsiteRegion,
) {
	return render(richTextDocument, {
		nodeResolvers: {
			// @ts-ignore
			[NODE_TABLE]: (children: any, props: any) => <Table {...props}>{children}</Table>,
			[NODE_TABLE_HEADER]: (children: any, props: any) => <TableHead {...props}>{children}</TableHead>,
			// @ts-ignore
			[NODE_TABLE_ROW]: (children: any, props: any) => <TableRow {...props}>{children}</TableRow>,

			[NODE_TABLE_CELL]: (children: any, props: any) => <TableCell {...props}>{children} </TableCell>,
		},
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
