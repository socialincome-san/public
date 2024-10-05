import { DefaultPageProps } from '@/app/[lang]/[region]';
import { Translator } from '@socialincome/shared/src/utils/i18n';
import { BaseContainer, Typography } from '@socialincome/ui';

export default async function Page({ params }: DefaultPageProps) {
	const translator = await Translator.getInstance({
		language: params.lang,
		namespaces: ['website-community'],
	});

	return (
		<BaseContainer className="items-left flex flex-col space-y-8 pt-16">
			<Typography size="3xl" weight="bold">
				{translator.t('test')}
			</Typography>

			<Typography as="h1" weight="bold" size="4xl">
				{translator.t('test')}
			</Typography>
		</BaseContainer>
	);
}
