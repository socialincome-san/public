import { DefaultParams } from '@/app/[lang]/[region]';
import { Translator } from '@socialincome/shared/src/utils/i18n';
import { BaseContainer, Typography } from '@socialincome/ui';
import { FontColor } from '@socialincome/ui/src/interfaces/color';

export async function Faq({ lang, region }: DefaultParams) {
  const translator = await Translator.getInstance({
    language: lang,
    namespaces: ['website-home2'],
  });

  return (
    <BaseContainer>
      <Typography>{translator.t('section-6.title-1')}</Typography>
      <div>
        {translator.t<{ text: string; color?: FontColor }[]>('section-6.question-1').map((title, index) => (
          <Typography as="span" key={index} color={title.color}>
            {title.text}{' '}
          </Typography>
        ))}
      </div>
      <Typography>{translator.t('section-6.cta')}</Typography>
    </BaseContainer>
  )
}