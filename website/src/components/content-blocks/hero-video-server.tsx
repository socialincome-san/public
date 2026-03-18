import { HeroVideoBlock, type HeroVideoControlTranslations } from '@/components/content-blocks/hero-video';
import type { HeroVideo } from '@/generated/storyblok/types/109655/storyblok-components';
import { Translator } from '@/lib/i18n/translator';
import { WebsiteLanguage, WebsiteRegion } from '@/lib/i18n/utils';

type Props = {
	blok: HeroVideo;
	lang: WebsiteLanguage;
	region: WebsiteRegion;
};

type TranslatorInstance = Awaited<ReturnType<typeof Translator.getInstance>>;

const videoControlTranslationKeys = {
	playVideo: 'video-controls.play-video',
	pauseVideo: 'video-controls.pause-video',
	muteVideo: 'video-controls.mute-video',
	unmuteVideo: 'video-controls.unmute-video',
	showCaptions: 'video-controls.show-captions',
	hideCaptions: 'video-controls.hide-captions',
	expandVideoView: 'video-controls.expand-video-view',
	exitExpandedVideoView: 'video-controls.exit-expanded-video-view',
} as const satisfies Record<keyof HeroVideoControlTranslations, `video-controls.${string}`>;

type VideoControlTranslationField = keyof HeroVideoControlTranslations;

const getVideoControlTranslations = (translator: TranslatorInstance): HeroVideoControlTranslations => {
	const translations = {} as HeroVideoControlTranslations;

	for (const key of Object.keys(videoControlTranslationKeys) as VideoControlTranslationField[]) {
		translations[key] = translator.t(videoControlTranslationKeys[key]);
	}

	return translations;
};

export const HeroVideoBlockServer = async ({ blok, lang, region }: Props) => {
	const translator = await Translator.getInstance({ language: lang, namespaces: 'website-home' });
	const disableAutoplay = ['record', 'replay'].includes(process.env.STORYBLOK_MOCK_MODE ?? '');

	return (
		<HeroVideoBlock
			blok={blok}
			lang={lang}
			region={region}
			subtitleUrl={translator.t('video-subtitle')}
			translations={getVideoControlTranslations(translator)}
			disableAutoplay={disableAutoplay}
		/>
	);
};
