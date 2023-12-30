'use client';

import { websiteCurrencies, WebsiteLanguage } from "@/i18n";
import { BaseContainer, Typography } from "@socialincome/ui";
import { Translator } from "@socialincome/shared/src/utils/i18n";

export async function CampaignTitle({ lang }: { lang: WebsiteLanguage }) {
  const translator = await Translator.getInstance({
    language: lang,
    namespaces: ['website-campaign-ebola-survivors'],
  });

  return (
    <BaseContainer className="p-0">
      <div className="relative w-full flex flex-col space-y-12">
        <Typography as="h1" size="5xl" weight="bold" className="text-left">
          {translator.t("title")}
        </Typography>
        <Typography as="h2" size="4xl" weight="bold" lineHeight="snug" className="text-left max-w-3xl">
          {translator.t("subtitle")}
        </Typography>
      </div>
    </BaseContainer>
  );
}