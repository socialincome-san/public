'use client';

import { websiteCurrencies, WebsiteLanguage } from "@/i18n";
import { BaseContainer, Typography } from "@socialincome/ui";
import { Translator } from "@socialincome/shared/src/utils/i18n";
import Image from "next/image";
import ismatuImage from "@/app/[lang]/[region]/(website)/campaigns/ebola-survivors/ismatu-gwendolyn.jpeg";

export async function CampaignCard({ lang }: { lang: WebsiteLanguage }) {
  const translator = await Translator.getInstance({
    language: lang,
    namespaces: ['website-campaign-ebola-survivors'],
  });

  return (
    <BaseContainer className="p-0">
      <div className="relative w-full bg-primary p-8 rounded-lg">
        <div
          className="inline-block bg-primary-foreground-muted py-1 px-3 rounded-full mb-4 md:absolute md:top-8 md:right-8">
          <div className="text-md text-primary">
            25 days left
          </div>
        </div>

        <div className="flex mb-4">
          <div className="w-24 h-24 rounded-full overflow-hidden mr-4">
            <Image src={ismatuImage} alt="Ismatu Bangura" width={100} height={100} />
          </div>
          <div className="flex-grow">
            <div>
              <Typography size="2xl" className="text-primary-foreground">
                Ismatu Bangura
              </Typography>
            </div>
            <div>
              <Typography size="2xl" className="text-accent">
                is raising USD 200,000
              </Typography>
            </div>
            <div>
              <Typography size="2xl" className="text-primary-foreground">
                for survivors of Ebola
              </Typography>
            </div>
          </div>
        </div>

        {/* Progress bar placeholder */}
        <div className="w-full bg-primary-foreground-muted rounded-lg my-8">
          <div className="text-center text-accent-foreground py-1">Placeholder for progress bar</div>
        </div>

        {/* Text below the progress bar */}
        <div className="flex flex-col md:flex-row justify-between">
          <div className="flex items-center">
            <Typography size="md" className="text-primary-foreground mb-2 md:mb-0 mr-2">
              USD 1000 raised
            </Typography>
            <Typography size="md" className="text-accent mb-2 md:mb-0">
              2%
            </Typography>
          </div>
          <div>
            <Typography size="md" className="text-primary-foreground">
              34 people donated
            </Typography>
          </div>
        </div>
      </div>
    </BaseContainer>
  );
}