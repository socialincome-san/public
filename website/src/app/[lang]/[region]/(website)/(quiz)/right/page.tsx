import { DefaultPageProps } from '@/app/[lang]/[region]';
import { Translator } from '@/lib/i18n/translator';
import { WebsiteLanguage } from '@/lib/i18n/utils';
import { BaseContainer, Typography } from '@socialincome/ui';

export default async function Page({ params }: DefaultPageProps) {
  const { lang } = await params;
  const translator = await Translator.getInstance({ language: lang as WebsiteLanguage, namespaces: ['website-quiz'] });

  return (
    <BaseContainer className="min-h-screen-navbar flex items-center justify-center">
      <div>
        <Typography size="5xl" weight="medium" className="text-center">
          {translator.t('result.right')}
        </Typography>
      </div>
    </BaseContainer>
  );
}
