import { DefaultPageProps } from '@/app/[lang]/[country]';
import { Translator } from '@socialincome/shared/src/utils/i18n';

export default async function Page({ params }: DefaultPageProps) {
	const translator = await Translator.getInstance({
		language: params.lang,
		namespaces: ['website-home'],
	});

	return (
		<div className="flex flex-row items-center h-screen">
			<div className="text-center w-full">{translator.t('title-1')}</div>
		</div>
	);
}
