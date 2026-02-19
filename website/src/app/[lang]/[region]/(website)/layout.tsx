import { DefaultLayoutProps } from '@/app/[lang]/[region]';
import Footer from '@/components/legacy/footer/footer';
import Navbar from '@/components/legacy/navbar/navbar';
import { NavbarBackgroundProvider } from '@/components/legacy/navbar/navbar-background-provider';
import { PropsWithChildren } from 'react';

export default async function Layout(props: PropsWithChildren<DefaultLayoutProps>) {
  const params = await props.params;

  const { lang, region } = params;

  const { children } = props;

  return (
    <div className="theme-default flex min-h-[100dvh] flex-col [&:has(.hero-video)_nav]:bg-transparent">
      <NavbarBackgroundProvider>
        <Navbar lang={lang} region={region} />
        <main lang={lang} className="mt-16 flex-1 py-8 md:mt-20 md:py-16 [&:has(.blog)]:py-0">
          {children}
        </main>
        <Footer lang={lang} region={region} />
      </NavbarBackgroundProvider>
    </div>
  );
}
