import type { HeroVideo } from '@/generated/storyblok/types/109655/storyblok-components';
import { Translator } from '@/lib/i18n/translator';
import { WebsiteLanguage, WebsiteRegion } from '@/lib/i18n/utils';
import HeroVideoBlock from './hero-video';

type Props = {
	blok: HeroVideo;
	lang: WebsiteLanguage;
	region: WebsiteRegion;
};

export default async function HeroVideoBlockServer({ blok, lang, region }: Props) {
	const translator = await Translator.getInstance({ language: lang, namespaces: 'website-home' });
	return <HeroVideoBlock blok={blok} lang={lang} region={region} subtitleUrl={translator.t('video-subtitle')} />;
}
