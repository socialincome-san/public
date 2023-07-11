import { DefaultPageProps } from '@/app/[lang]/[country]';
import { Translator } from '@socialincome/shared/src/utils/i18n';
import { Typography } from '@socialincome/ui';

export default async function Page({ params }: DefaultPageProps) {
	const translator = await Translator.getInstance({
		language: params.lang,
		namespaces: ['website-common'],
	});

	return (
		<div className="flex flex-row items-center h-screen">
			<Typography>{translator.t('navigation.about-us')}</Typography>
		</div>
	);
}
