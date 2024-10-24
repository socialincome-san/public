import { DefaultLayoutProps, DefaultPageProps } from '@/app/[lang]/[region]';
import { getMetadata } from '@/metadata';
import { Translator } from '@socialincome/shared/src/utils/i18n';

export async function generateMetadata({ params }: DefaultLayoutProps) {
	return getMetadata(params.lang, 'website-login');
}

export default async function Page({ params }: DefaultPageProps) {
	const translator = await Translator.getInstance({ language: params.lang, namespaces: ['website-login'] });

	return (
		<div className="min-h-screen-navbar mx-auto flex max-w-lg flex-col">
			hello
		</div>
	);
}
