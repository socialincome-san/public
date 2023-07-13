import { DefaultPageProps } from '@/app/[lang]/[country]';
import { Translator } from '@socialincome/shared/src/utils/i18n';

export default async function Page({ params }: DefaultPageProps) {
	const translator = await Translator.getInstance({
		language: params.lang,
		namespaces: ['website-home'],
	});

	return (
		<div className="flex h-screen flex-row items-center">
			<div className="w-full text-center">{translator.t('title-1')}</div>
		</div>
	);
}
