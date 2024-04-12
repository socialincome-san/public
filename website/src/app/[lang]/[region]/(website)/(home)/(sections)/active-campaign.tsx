import { WebsiteLanguage } from '@/i18n';
import { Translator } from '@socialincome/shared/src/utils/i18n';
import { Badge, BaseContainer, Typography } from "@socialincome/ui";
import { BellAlertIcon } from "@heroicons/react/24/solid";

export async function Campaign({ lang }: { lang: WebsiteLanguage }) {
  const translator = await Translator.getInstance({
    language: lang,
    namespaces: ['website-donate'],
  });

  return (
    <BaseContainer className="flex flex-col items-center justify-center cursor-pointer">
      <a href="https://socialincome.org/campaign/MZmXEVHlDjOOFOMk82jW" target="_blank" rel="noopener noreferrer" className="group">
        <Badge variant="outline" className="flex-shrink-0">
          <Typography size="md" color="primary" weight="normal" className="flex items-center p-1 group-hover:text-primary-foreground">
            <BellAlertIcon className="mx-4 h-8 w-8 sm:h-5 sm:w-5 sm:mx-3" />
            {translator.t('campaign.badge-highlight')}
          </Typography>
          <Typography size="md" color="secondary" weight="medium" className="flex items-center p-1 mr-4 group-hover:text-primary-foreground">
            Rebuilding Lives by Ismatu&nbsp;Gwendolyn
          </Typography>
        </Badge>
      </a>
    </BaseContainer>
  );
}
