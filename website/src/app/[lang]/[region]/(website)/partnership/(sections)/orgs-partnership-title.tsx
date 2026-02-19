import { DefaultParams } from '@/app/[lang]/[region]';
import { Translator } from '@/lib/i18n/translator';
import { WebsiteLanguage } from '@/lib/i18n/utils';
import { Typography } from '@socialincome/ui';

export const OrgsPartnershipTitle = async ({ lang }: DefaultParams) => {
  const translator = await Translator.getInstance({
    language: lang as WebsiteLanguage,
    namespaces: ['website-partnership'],
  });

  return (
    <div className="mx-auto flex w-4/5 flex-col items-center justify-center pt-10 md:mb-20 lg:w-4/5">
      <Typography weight="medium" className="mb-12 text-center text-3xl sm:text-4xl md:text-4xl">
        {translator.t('partner-carousel.title')}
      </Typography>
      <Typography size="xl" className="mb-4 text-center leading-relaxed">
        {translator.t('partner-carousel.subtitle')}
      </Typography>
    </div>
  );
};
