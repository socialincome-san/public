import { DefaultParams } from '@/app/[lang]/[region]';
import { Translator } from '@socialincome/shared/src/utils/i18n';
import { BaseContainer, Typography } from '@socialincome/ui';
import { FontColor } from '@socialincome/ui/src/interfaces/color';

export async function Approach({ lang, region }: DefaultParams) {
  const translator = await Translator.getInstance({
    language: lang,
    namespaces: ['website-home2'],
  });

  return (
    <BaseContainer>
      <Typography>{translator.t('section-7.title-1')}</Typography>
    </BaseContainer>
  )
}