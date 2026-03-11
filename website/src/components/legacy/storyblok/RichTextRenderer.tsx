import NewsletterGlowContainer from '@/components/legacy/newsletter/glow-container/newsletter-glow-container';
import { StoryblokActionButton } from '@/components/legacy/storyblok/StoryblokActionButton';
import { StoryblokCampaignDonate } from '@/components/legacy/storyblok/StoryblokCampaignDonate';
import { StoryblokEmbeddedVideoPlayer } from '@/components/legacy/storyblok/StoryblokEmbeddedVideoPlayer';
import { StoryblokImageWithCaption } from '@/components/legacy/storyblok/StoryblokImageWithCaption';
import { StoryblokReferencesGroup } from '@/components/legacy/storyblok/StoryblokReferencesGroup';
import { Translator } from '@/lib/i18n/translator';
import { WebsiteRegion } from '@/lib/i18n/utils';
import { LanguageCode } from '@/lib/types/language';
import { QuotedText, Table, TableBody, TableCell, TableHead, TableRow } from '@socialincome/ui';
import Link from 'next/link';
import { ComponentProps, ReactNode } from 'react';
import {
	MARK_LINK,
	NODE_LI,
	NODE_TABLE,
	NODE_TABLE_CELL,
	NODE_TABLE_HEADER,
	NODE_TABLE_ROW,
	render,
	StoryblokRichtext,
} from 'storyblok-rich-text-react-renderer';

type RichTextRendererProps = {
	richTextDocument: StoryblokRichtext;
	translator: Translator;
	lang: LanguageCode;
	region: WebsiteRegion;
};

type RichTextLinkProps = {
	href?: string;
	target?: string;
	rel?: string;
};

type StoryblokBlockProps = Record<string, unknown>;

export const RichTextRenderer = ({ richTextDocument, translator, lang, region }: RichTextRendererProps) => {
	return render(richTextDocument, {
		markResolvers: {
			[MARK_LINK]: (children: ReactNode, props: RichTextLinkProps) => (
				<Link className="font-normal" href={props.href ?? '#'} target={props.target} rel={props.rel}>
					{children}
				</Link>
			),
		},
		nodeResolvers: {
			// @ts-expect-error Resolver prop typing from library is too broad.
			[NODE_LI]: (children: ReactNode, props: Record<string, unknown>) => (
				<li className="m-0.5 p-0.5 *:m-0 *:p-0 [&::marker]:text-black" {...(props as object)}>
					{children}
				</li>
			),
			// @ts-expect-error Resolver prop typing from library is too broad.
			[NODE_TABLE]: (children: ReactNode, props: Record<string, unknown>) => (
				<Table className="text-foreground" {...(props as object)}>
					<TableBody>{children}</TableBody>
				</Table>
			),
			[NODE_TABLE_HEADER]: (children: ReactNode, props: Record<string, unknown>) => (
				<TableHead className="font-extrabold" {...(props as object)}>
					{children}
				</TableHead>
			),
			// @ts-expect-error Resolver prop typing from library is too broad.
			[NODE_TABLE_ROW]: (children: ReactNode, props: Record<string, unknown>) => (
				<TableRow {...(props as object)}>{children}</TableRow>
			),
			[NODE_TABLE_CELL]: (children: ReactNode, props: Record<string, unknown>) => (
				<TableCell {...(props as object)}>{children} </TableCell>
			),
		},
		blokResolvers: {
			['quotedText']: (props: StoryblokBlockProps) => <QuotedText {...(props as ComponentProps<typeof QuotedText>)} />,
			['imageWithCaption']: (props: StoryblokBlockProps) => (
				<StoryblokImageWithCaption {...(props as ComponentProps<typeof StoryblokImageWithCaption>)} />
			),
			['embeddedVideo']: (props: StoryblokBlockProps) => (
				<StoryblokEmbeddedVideoPlayer {...(props as ComponentProps<typeof StoryblokEmbeddedVideoPlayer>)} />
			),
			['referencesGroup']: (props: StoryblokBlockProps) => (
				<StoryblokReferencesGroup
					{...({
						...(props as Record<string, unknown>),
						translator,
						lang,
					} as ComponentProps<typeof StoryblokReferencesGroup>)}
				/>
			),
			['actionButton']: (props: StoryblokBlockProps) => (
				<StoryblokActionButton {...(props as ComponentProps<typeof StoryblokActionButton>)} />
			),
			['newsletterSignup']: () => (
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
			['campaignDonate']: (props: StoryblokBlockProps) => (
				<StoryblokCampaignDonate
					{...(props as Omit<ComponentProps<typeof StoryblokCampaignDonate>, 'lang' | 'translator' | 'region'>)}
					lang={lang}
					translator={translator}
					region={region}
				/>
			),
		},
	}) as ReactNode;
};
