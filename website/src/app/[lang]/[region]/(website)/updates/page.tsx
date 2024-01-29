import { DefaultPageProps } from '@/app/[lang]/[region]';
import { Translator } from '@socialincome/shared/src/utils/i18n';
import { BaseContainer, Typography } from '@socialincome/ui';

export default async function Page({ params: { lang } }: DefaultPageProps) {
  const translator = await Translator.getInstance({
    language: lang,
    namespaces: [ 'common', 'website-updates' ],
  });

  return (
    <BaseContainer className="mx-auto max-w-3xl space-y-16 pb-16">
      <div className="space-y-8">
        <div>
          <Typography as="h1" weight="bold" size="4xl">
            {translator.t('title')}
          </Typography>
          <Typography size="xl">
            {translator.t('subtitle')}
          </Typography>
          <Typography size="md">
            {translator.t('fname')}
          </Typography>
          <Typography size="md">
            {translator.t('email')}
          </Typography>
          <Typography size="md">
            {translator.t('gender')}: {translator.t('genders.male')} {translator.t('genders.female')} {translator.t('genders.other')} {translator.t('genders.private')}
          </Typography>
          <Typography size="md">
            {translator.t('language')}: {translator.t('languages.en')} {translator.t('languages.de')}
          </Typography>
          <Typography size="md">
            {translator.t('region')}: {translator.t('regions.int')} {translator.t('regions.ch')}
          </Typography>
          <Typography size="md">
            {translator.t('form.legal')}
          </Typography>
          <Typography size="md">
            {translator.t('form.sub')}
          </Typography>
        </div>
      </div>
    </BaseContainer>
  );
}
