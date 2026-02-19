import { Breadcrumb } from '@/components/breadcrumb/breadcrumb';
import { Translator } from '@/lib/i18n/translator';
import { WebsiteLanguage } from '@/lib/i18n/utils';
import type { PropsWithChildren } from 'react';
import { DefaultLayoutProps } from '../..';

export default async function Layout({ children, params }: PropsWithChildren<DefaultLayoutProps>) {
  const { lang } = await params;

  const translator = await Translator.getInstance({ language: lang as WebsiteLanguage, namespaces: ['website-me'] });

  const breadcrumbLinks = [
    { href: '/', label: translator.t('breadcrumb.website') },
    { href: '/dashboard/contributions', label: translator.t('breadcrumb.dashboard') },
    { href: '/dashboard/profile', label: translator.t('breadcrumb.profile') },
  ];

  return (
    <>
      <Breadcrumb links={breadcrumbLinks} />
      <h1 className="py-8 text-5xl">{translator.t('title.profile')}</h1>
      {children}
    </>
  );
}
