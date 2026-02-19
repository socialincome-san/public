'use client';

import { LanguageCode } from '@/lib/types/language';
import { GlowHoverContainer, Typography } from '@socialincome/ui';

import NewsletterForm from '@/components/legacy/newsletter/form/newsletter-form';
import { NewsletterTranslations } from '../types';

type NewsletterGlowContainerProps = {
  title: string;
  lang: LanguageCode;
  formTranslations: NewsletterTranslations;
  className?: string;
};

const NewsletterGlowContainer = ({ title, lang, formTranslations, className }: NewsletterGlowContainerProps) => {
  return (
    <GlowHoverContainer className={className}>
      <div className="flex flex-col items-center py-12">
        <div className="align-center flex flex-col">
          <Typography size="2xl" color="foreground" weight="medium">
            {title}
          </Typography>
        </div>
        <div className="mt-8 flex w-full justify-center sm:w-full md:max-w-md">
          <NewsletterForm lang={lang} translations={formTranslations} />
        </div>
      </div>
    </GlowHoverContainer>
  );
};

export default NewsletterGlowContainer;
