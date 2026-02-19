import { DefaultParams } from '@/app/[lang]/[region]';
import { I18nDialog } from '@/components/legacy/i18n-dialog';
import { SILogo } from '@/components/legacy/logos/si-logo';
import { Translator } from '@/lib/i18n/translator';
import { WebsiteLanguage } from '@/lib/i18n/utils';
import { GlobeEuropeAfricaIcon, LanguageIcon } from '@heroicons/react/24/solid';
import { BaseContainer, Button } from '@socialincome/ui';
import { PropsWithChildren } from 'react';

interface SurveyPageParams extends DefaultParams {
  recipient: string;
  survey: string;
}

export interface SurveyPageProps {
  params: Promise<SurveyPageParams>;
}

export default async function Layout({ children, params }: PropsWithChildren<SurveyPageProps>) {
  const { lang } = await params;

  const translator = await Translator.getInstance({
    language: lang as WebsiteLanguage,
    namespaces: ['common', 'website-common', 'website-me'],
  });

  return (
    <div className="min-h-screen bg-muted">
      <nav className="bg-white">
        <BaseContainer className="flex h-16 items-center justify-between">
          <SILogo className="h-4" />
          <I18nDialog
            languages={[
              { code: 'en', translation: 'English' },
              { code: 'kri', translation: 'Krio' },
            ]}
            regions={[{ code: 'int', translation: 'International' }]}
            currencies={[]}
            translations={{
              language: translator.t('language'),
              region: translator.t('region'),
              currency: translator.t('currency'),
            }}
          >
            <Button variant="ghost" className="flex max-w-md space-x-2">
              <LanguageIcon className="h-4 w-4" />
              <GlobeEuropeAfricaIcon className="h-4 w-4" />
            </Button>
          </I18nDialog>
        </BaseContainer>
      </nav>
      <main className="mx-auto max-w-5xl py-4">{children}</main>
    </div>
  );
}
