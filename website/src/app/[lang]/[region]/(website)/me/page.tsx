import { Translator } from '@socialincome/shared/src/utils/i18n';
import { BaseContainer } from '@socialincome/ui';
import { Suspense } from 'react';
import { DefaultPageProps } from '../..';
import { AccountRedirect } from './account-redirect';
import { WebsiteLanguage } from '@/lib/i18n/utils';

export default async function Page({ params }: DefaultPageProps) {
	const { lang } = await params;
	const translator = await Translator.getInstance({ language: lang as WebsiteLanguage, namespaces: ['website-login'] });

	return (
		<BaseContainer className="min-h-screen-navbar mx-auto flex max-w-lg flex-col">
			<Suspense fallback={translator.t('detect-account-type')}>
				<AccountRedirect lang={lang as WebsiteLanguage} />
			</Suspense>
		</BaseContainer>
	);
}
