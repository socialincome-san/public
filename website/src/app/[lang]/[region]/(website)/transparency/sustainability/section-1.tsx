import { DefaultPageProps } from '@/app/[lang]/[region]';
import { Translator } from '@socialincome/shared/src/utils/i18n';
import { BaseContainer, Typography } from '@socialincome/ui';

export default async function Section1({ params }: DefaultPageProps) {
	const translator = await Translator.getInstance({
		language: params.lang,
		namespaces: ['website-sustainability'],
	});

	return (
		<BaseContainer className="mt-12 flex flex-col items-center space-y-12">
			<Typography as="h1" size="4xl" weight="bold" className="text-center">
				{translator.t('section-1.title')}
			</Typography>
			<Typography as="h1" size="2xl" weight="bold" className="text-center">
				{translator.t('section-1.subtitle')}
			</Typography>
		</BaseContainer>
	);
}
