import { DefaultPageProps } from '@/app/[lang]/[region]';
import { WebsiteLanguage } from '@/lib/i18n/utils';
import { getMetadata } from '@/lib/utils/metadata';
import { BaseContainer } from '@socialincome/ui';
import FlowOfFunds from './(sections)/flow-of-funds';
import LandingPage from './(sections)/landing-page';
import OurMission from './(sections)/our-mission';
import OurPromise from './(sections)/our-promise';
import Team from './(sections)/team';

export const generateMetadata = async (props: DefaultPageProps) => {
  const params = await props.params;

  return getMetadata(params.lang as WebsiteLanguage, 'website-about-us');
};

export default async function Page(props: DefaultPageProps) {
  const params = await props.params;

  const { lang } = params as { lang: WebsiteLanguage };

  return (
    <BaseContainer className="space-y-56 pt-40">
      <LandingPage lang={lang} />
      <OurMission lang={lang} />
      <OurPromise lang={lang} />
      <FlowOfFunds lang={lang} />
      <Team lang={lang} />
    </BaseContainer>
  );
}
