import { MagicLinkLoginForm } from '@/components/login/magic-link-login-form';
import { Translator } from '@/lib/i18n/translator';
import { WebsiteLanguage } from '@/lib/i18n/utils';

type Props = {
	lang: WebsiteLanguage;
	prefilledEmail: string;
};

export const LoginPageContent = async ({ lang, prefilledEmail }: Props) => {
	const translator = await Translator.getInstance({
		language: lang,
		namespaces: ['website-login'],
	});

	return (
		<div className="flex min-h-[40vh] flex-1 flex-col items-center justify-center px-4">
			<div className="border-border mx-auto w-full max-w-[400px] rounded-3xl border bg-white px-4 pt-4 pb-6 shadow-[0_2px_4px_rgba(0,0,0,0.05)] sm:px-6 sm:pt-5 sm:pb-7 md:px-9 md:py-9">
				<h1 className="text-foreground mb-5 text-xl font-semibold">{translator.t('title')}</h1>
				<MagicLinkLoginForm lang={lang} prefilledEmail={prefilledEmail} />
			</div>
		</div>
	);
};
