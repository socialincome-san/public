import { DefaultParams } from '@/app/[lang]/[region]';
import HeroVideoOverlay from '@/app/[lang]/[region]/(website)/(home)/(components)/hero-video-overlay';
import { Translator } from '@/lib/i18n/translator';
import { WebsiteLanguage } from '@/lib/i18n/utils';
import { FontColor } from '@socialincome/ui/src/interfaces/color';
import MuxVideoComponent from '../(components)/mux-video';

export const HeroVideo = async ({ lang, region }: DefaultParams) => {
  const translator = await Translator.getInstance({
    language: lang as WebsiteLanguage,
    namespaces: ['website-home', 'common'],
  });

  return (
    <div className="relative h-[calc(100svh)] w-full">
      <MuxVideoComponent
        translations={{
          subtitles: translator.t<string>('video-subtitle'),
        }}
        lang={lang}
        region={region}
      />
      <HeroVideoOverlay
        translations={{
          buttonText: translator.t('section-1.take-action'),
          mainText: translator.t<{ text: string; color?: FontColor }[]>('section-1.title-1'),
        }}
        lang={lang}
        region={region}
      />
    </div>
  );
};
