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

export const RichTextRenderer = ({ richTextDocument, translator, lang, region }: RichTextRendererProps) => {
  return render(richTextDocument, {
    markResolvers: {
      [MARK_LINK]: (children: unknown, props: unknown) => (
        <Link className="font-normal" {...props}>
          {children}
        </Link>
      ),
    },
    nodeResolvers: {
      // @ts-ignore
      [NODE_LI]: (children: unknown, props: unknown) => (
        <li className="m-0.5 p-0.5 [&::marker]:text-black [&>*]:m-0 [&>*]:p-0" {...props}>
          {children}
        </li>
      ),
      // @ts-ignore
      [NODE_TABLE]: (children: unknown, props: unknown) => (
        <Table className="text-foreground" {...props}>
          <TableBody>{children}</TableBody>
        </Table>
      ),
      [NODE_TABLE_HEADER]: (children: unknown, props: unknown) => (
        <TableHead className="font-extrabold" {...props}>
          {children}
        </TableHead>
      ),
      // @ts-ignore
      [NODE_TABLE_ROW]: (children: unknown, props: unknown) => <TableRow {...props}>{children}</TableRow>,
      [NODE_TABLE_CELL]: (children: unknown, props: unknown) => <TableCell {...props}>{children} </TableCell>,
    },
    blokResolvers: {
      ['quotedText']: (props: unknown) => <QuotedText {...props} />,
      ['imageWithCaption']: (props: unknown) => <StoryblokImageWithCaption {...props} />,
      ['embeddedVideo']: (props: unknown) => <StoryblokEmbeddedVideoPlayer {...props} />,
      ['referencesGroup']: (props: unknown) => <StoryblokReferencesGroup translator={translator} {...props} lang={lang} />,
      ['actionButton']: (props: unknown) => <StoryblokActionButton {...props} />,
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
      ['campaignDonate']: (props: unknown) => (
        <StoryblokCampaignDonate lang={lang} {...props} translator={translator} region={region} />
      ),
    },
  });
};
