'use client';

import { WebsiteLanguage } from "@/i18n";
import { BaseContainer, Typography } from "@socialincome/ui";
import { Translator } from "@socialincome/shared/src/utils/i18n";

export async function CampaignFaq({ lang }: { lang: WebsiteLanguage }) {
  const translator = await Translator.getInstance({
    language: lang,
    namespaces: ['website-campaign-ebola-survivors'],
  });

  return (
    <BaseContainer className="p-0">
      <div className="space-y-8">
        <Typography as="h2" size="2xl" weight="bold">
          {translator.t('faq.title')}
        </Typography>
        <div className="space-y-4">
          {translator.t<{ question: string; answer: string }[]>('faq.questions').map(({ question, answer }, index) => (
            <div key={index}>
              <Typography as="h3" size="xl" weight="bold">
                {question}
              </Typography>
              <Typography as="p" className="mt-2" dangerouslySetInnerHTML={{ __html: answer }} />
            </div>
          ))}
        </div>
      </div>
    </BaseContainer>
  );
}