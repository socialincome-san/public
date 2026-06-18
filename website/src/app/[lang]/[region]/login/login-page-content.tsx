'use client';

import { MagicLinkLoginForm } from '@/components/login/magic-link-login-form';
import { useTranslator } from '@/lib/hooks/useTranslator';
import { WebsiteLanguage } from '@/lib/i18n/utils';

type Props = {
	lang: WebsiteLanguage;
};

export const LoginPageContent = ({ lang }: Props) => {
	const translator = useTranslator(lang, 'website-login');

	return (
		<div className="flex min-h-[40vh] flex-1 flex-col items-center justify-center px-4">
			<div className="border-border mx-auto w-full max-w-[400px] rounded-3xl border bg-white px-4 pt-4 pb-6 shadow-[0_2px_4px_rgba(0,0,0,0.05)] sm:px-6 sm:pt-5 sm:pb-7 md:px-9 md:py-9">
				<h1 className="text-foreground mb-5 text-xl font-semibold">{translator?.t('title')}</h1>
				<MagicLinkLoginForm lang={lang} />
			</div>
		</div>
	);
};
