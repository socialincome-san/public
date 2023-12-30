'use client';

import { websiteCurrencies, WebsiteLanguage } from "@/i18n";
import { BaseContainer, Button, Form, FormControl, FormField, FormItem, Input, Typography } from "@socialincome/ui";
import { Translator } from "@socialincome/shared/src/utils/i18n";

export async function DonationForm({ lang }: { lang: WebsiteLanguage }) {
  const translator = await Translator.getInstance({
    language: lang,
    namespaces: ['website-campaign-ebola-survivors'],
  });

  return (
    <BaseContainer className="p-0">
      <div className="text-left">
        (Placeholder Switch): Make it a monthly donation
      </div>
      <div className="text-left">
        (Placeholder for Donationon Form Fields)
      </div>
      <div className="text-left">
        All of this campaigns donations are used to finance the basic income program for Ebola survivors. Funds
        beyond the goal of USD 200,000 are used to support people living in extreme poverty in Sierra Leone.
      </div>
    </BaseContainer>
  );
}