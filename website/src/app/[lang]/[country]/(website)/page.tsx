import ClientComponent from '@/components/client-component';
import Link from 'next/link';

import { DefaultPageProps } from '@/app/[lang]/[country]';
import { Translator } from '@socialincome/shared/src/utils/i18n';

export default async function Page({ params }: DefaultPageProps) {
	const translator = await Translator.getInstance({
		language: params.lang as any,
		namespaces: ['website-common'],
	});

	return (
		<div>
			<h1 className="text-2xl">
				Halloo ({params.lang}: {translator.t('currency')})
			</h1>
			<ClientComponent />
			<div>
				<Link href={`/${params.lang}/${params.country}/test`}>Test Link</Link>
			</div>
			<div>
				<Link href={`/${params.lang}/${params.country}/transparency/usd`}>Transparency Link</Link>
			</div>
		</div>
	);
}
