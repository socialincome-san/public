import { DefaultPageProps } from '@/app/[lang]/[region]';
import { Translator } from '@socialincome/shared/src/utils/i18n';
import { BaseContainer, Typography } from '@socialincome/ui';
import Playstore from './(assets)/playstore.svg';
import Applestore from './(assets)/applestore.svg';
import Image from "next/image";

export default async function Page({ params }: DefaultPageProps) {
  const translator = await Translator.getInstance({
    language: params.lang,
    namespaces: ['website-app'],
  });

  return (
    <BaseContainer className="flex flex-col items-start space-y-8 pt-16">
      <div className="flex flex-col space-y-8">
        <Typography as="h1" size="5xl" weight="bold" className="mx-auto text-center">
          {translator.t('title')}
        </Typography>
        <Typography as="h2" size="xl" className="w-2/3 mx-auto text-center">
          {translator.t('subtitle')}
        </Typography>
      </div>
      <div className="container mx-auto pt-1 md:pt-6 pb-24">
        <div className="flex flex-col md:flex-row">
          <div className="flex flex-col items-center justify-center p-4 m-2 md:w-1/2">
            <Typography as="h2" size="xl" className="pb-4">
              {translator.t('android')}
            </Typography>
            <a href="https://play.google.com/store/apps/details?id=org.socialincome.app&pcampaignid=web_share" target="_blank" rel="noopener noreferrer">
              <Image
                src={Playstore}
                width={150}
                height={50}
                alt="Playstore Button"
              />
            </a>
          </div>
          <div className="flex flex-col items-center justify-center p-4 m-2 md:w-1/2">
            <Typography as="h2" size="xl" className="pb-4">
              {translator.t('apple')}
            </Typography>
            <a href="https://apps.apple.com/ch/app/social-income/id6444860109" target="_blank" rel="noopener noreferrer">
              <Image
                src={Applestore}
                width={150}
                height={50}
                alt="Appstore Button"
              />
            </a>
          </div>
        </div>
      </div>
    </BaseContainer>
  );
}