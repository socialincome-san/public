import { DefaultParams } from '@/app/[lang]/[region]';
import { Translator } from '@/lib/i18n/translator';
import { WebsiteLanguage } from '@/lib/i18n/utils';
import { BaseContainer, Typography } from '@socialincome/ui';
import Link from 'next/link';
import { ComponentType, HTMLAttributeAnchorTarget } from 'react';

type FooterLinkProps = {
  label: string;
  url: string;
  Icon?: ComponentType<unknown>;
  target?: HTMLAttributeAnchorTarget;
};

const FooterLink = ({ label, url, Icon, target = '_self' }: FooterLinkProps) => {
  return (
    <Link href={url} className="group inline-flex items-center space-x-3" target={target}>
      {Icon && <Icon className="group-hover:fill-base-content h-4 w-4 fill-muted-foreground" />}
      <Typography size="xl" className="group-hover:text-base-content text-muted-foreground">
        {label}
      </Typography>
    </Link>
  );
};

export default async function Footer({ lang, region }: DefaultParams) {
  const translator = await Translator.getInstance({
    language: lang as WebsiteLanguage,
    namespaces: ['common', 'website-common', 'website-me'],
  });

  return (
    <BaseContainer baseClassNames="theme-blue" className="pb-8 pt-10">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <div className="flex flex-col space-y-1">
            <Typography size="sm" weight="medium" color="muted-foreground">
              {translator.t('navigation.follow-us')}
            </Typography>
            <FooterLink label="Instagram" url="https://www.instagram.com/so_income" target="_blank" />
            <FooterLink label="Facebook" url="https://facebook.com/socialincome.org" target="_blank" />
            <FooterLink label="Linkedin" url="https://www.linkedin.com/company/socialincome" target="_blank" />
            <FooterLink label="GitHub" url="https://github.com/socialincome-san/public" target="_blank" />
            <FooterLink label={translator.t('navigation.newsletter')} url={`/${lang}/${region}/newsletter`} />
          </div>
          <div className="flex flex-col space-y-1">
            <Typography size="sm" weight="medium" color="muted-foreground">
              {translator.t('navigation.resources')}
            </Typography>
            <FooterLink label={translator.t('navigation.faq')} url={`/${lang}/${region}/faq`} />
            <FooterLink label={translator.t('navigation.my-account')} url={`/${lang}/${region}/login`} />
            <FooterLink label={translator.t('navigation.no-harm')} url={`/${lang}/${region}/do-no-harm`} />
            <FooterLink label={translator.t('navigation.legal')} url={`/${lang}/${region}/legal`} />
            <FooterLink label={translator.t('navigation.contact')} url={`/${lang}/${region}/contact`} />
          </div>
          <div className="flex flex-col space-y-1">
            <Typography size="sm" weight="medium" color="muted-foreground">
              {translator.t('navigation.our-work')}
            </Typography>
            <FooterLink label={translator.t('navigation.how-it-works')} url={`/${lang}/${region}/our-work#how-it-works`} />
            <FooterLink label={translator.t('navigation.contributors')} url={`/${lang}/${region}/our-work#contributors`} />
            <FooterLink label={translator.t('navigation.recipients')} url={`/${lang}/${region}/our-work#recipients`} />
          </div>
          <div className="flex flex-col space-y-1">
            <Typography size="sm" weight="medium" color="muted-foreground">
              {translator.t('navigation.about-us')}
            </Typography>
            <FooterLink label={translator.t('navigation.our-mission')} url={`/${lang}/${region}/about-us#our-mission`} />
            <FooterLink label={translator.t('navigation.team')} url={`/${lang}/${region}/about-us#team`} />
          </div>
        </div>
      </div>
    </BaseContainer>
  );
}
