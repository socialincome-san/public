import { HeroVideoBlock } from '@/components/content-blocks/hero-video';
import { DonationFormServer } from '@/components/donation-wizard/donation-form-server';
import type { HeroVideo } from '@/generated/storyblok/types/109655/storyblok-components';
import { Translator } from '@/lib/i18n/translator';
import { getWebsiteRootParams } from '@/lib/i18n/website-root-params';

type Props = {
	blok: HeroVideo;
};

export const HeroVideoBlockServer = async ({ blok }: Props) => {
	const { lang } = await getWebsiteRootParams();
	const translator = await Translator.getInstance({ language: lang, namespaces: 'website-home' });

	return (
		<HeroVideoBlock
			blok={blok}
			lang={lang}
			subtitleUrl={translator.t('video-subtitle')}
			translations={{
				playVideo: translator.t('video-controls.play-video'),
				pauseVideo: translator.t('video-controls.pause-video'),
				muteVideo: translator.t('video-controls.mute-video'),
				unmuteVideo: translator.t('video-controls.unmute-video'),
				showCaptions: translator.t('video-controls.show-captions'),
				hideCaptions: translator.t('video-controls.hide-captions'),
				expandVideoView: translator.t('video-controls.expand-video-view'),
				exitExpandedVideoView: translator.t('video-controls.exit-expanded-video-view'),
				donateNow: translator.t('donate-now'),
			}}
			donationForm={<DonationFormServer lang={lang} />}
		/>
	);
};
