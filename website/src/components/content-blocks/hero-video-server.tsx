import { HeroVideoBlock } from '@/components/content-blocks/hero-video';
import { DonationForm } from '@/components/donation-wizard/donation-form';
import type { HeroVideo } from '@/generated/storyblok/types/109655/storyblok-components';
import { WebsiteCurrency, WebsiteLanguage } from '@/lib/i18n/utils';
import { getTranslations } from 'next-intl/server';

type Props = {
	blok: HeroVideo;
	lang: WebsiteLanguage;
	currency: WebsiteCurrency;
};

export const HeroVideoBlockServer = async ({ blok, lang }: Props) => {
	const t = await getTranslations('website-home');

	return (
		<HeroVideoBlock
			blok={blok}
			lang={lang}
			translations={{
				playVideo: t('video-controls.play-video'),
				pauseVideo: t('video-controls.pause-video'),
				showCaptions: t('video-controls.show-captions'),
				hideCaptions: t('video-controls.hide-captions'),
				playWithSound: t('video-controls.play-with-sound'),
				mute: t('video-controls.mute'),
			}}
			donationForm={<DonationForm />}
		/>
	);
};
