import { DefaultParams } from '@/app/[lang]/[region]';
import { Translator } from '@/lib/i18n/translator';
import { WebsiteLanguage } from '@/lib/i18n/utils';
import { BaseContainer, Typography } from '@socialincome/ui';
import { FontColor } from '@socialincome/ui/src/interfaces/color';

export default async function Section1({ lang }: DefaultParams) {
  const translator = await Translator.getInstance({ language: lang as WebsiteLanguage, namespaces: ['website-arts'] });

  return (
    <BaseContainer className="min-h-screen-navbar flex items-center justify-center">
      <p className="w-2/3 text-center">
        {translator.t<{ text: string; color?: FontColor }[]>('section-1.title').map((title, index) => (
          <Typography as="span" key={index} size="5xl" weight="bold" color={title.color}>
            {title.text}
          </Typography>
        ))}
      </p>
    </BaseContainer>
  );
}
