import { HeroVideoBlock } from '@/components/content-blocks/hero-video';
import { DonationFormServer } from '@/components/donation-wizard/donation-form-server';
import type { HeroVideo } from '@/generated/storyblok/types/109655/storyblok-components';
import { WebsiteLanguage, WebsiteRegion } from '@/lib/i18n/utils';
import { getTranslations } from 'next-intl/server';

type Props = {
	blok: HeroVideo;
	lang: WebsiteLanguage;
	region: WebsiteRegion;
};

export const HeroVideoBlockServer = async ({ blok, lang }: Props) => {
	const t = await getTranslations('website-home');

	return (
		<HeroVideoBlock
			blok={blok}
			lang={lang}
			subtitleUrl={t('video-subtitle')}
			translations={{
				playVideo: t('video-controls.play-video'),
				pauseVideo: t('video-controls.pause-video'),
				muteVideo: t('video-controls.mute-video'),
				unmuteVideo: t('video-controls.unmute-video'),
				showCaptions: t('video-controls.show-captions'),
				hideCaptions: t('video-controls.hide-captions'),
				expandVideoView: t('video-controls.expand-video-view'),
				exitExpandedVideoView: t('video-controls.exit-expanded-video-view'),
				donateNow: t('donate-now'),
			}}
			donationForm={<DonationFormServer />}
		/>
	);
};
