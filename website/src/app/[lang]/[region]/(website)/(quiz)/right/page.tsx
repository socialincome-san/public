import { DefaultPageProps } from '@/app/[lang]/[region]';
import { Translator } from '@socialincome/shared/src/utils/i18n';
import { BaseContainer, Typography} from '@socialincome/ui';

export default async function Page({ params }: DefaultPageProps) {
  const translator = await Translator.getInstance({
    language: params.lang,
    namespaces: ['website-quiz'],
  });

  return (
    <BaseContainer className="flex items-center justify-center min-h-screen-navbar">
      <div>
        <Typography size="5xl" weight="medium" className="text-center">
          {translator.t('result.right')}
        </Typography>
      </div>
    </BaseContainer>
  );
}
