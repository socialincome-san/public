import { DefaultPageProps } from '@/app/[lang]/[region]';
import { Translator } from '@socialincome/shared/src/utils/i18n';
import { BaseContainer, Typography } from '@socialincome/ui';

export default async function Page({ params }: DefaultPageProps) {
	const translator = await Translator.getInstance({
		language: params.lang,
		namespaces: ['website-quiz'],
	});

	return (
		<BaseContainer className="min-h-screen-navbar flex items-center justify-center">
			<div>
				<Typography size="5xl" weight="medium" className="text-center">
					{translator.t('result.wrong')}
				</Typography>
			</div>
		</BaseContainer>
	);
}
