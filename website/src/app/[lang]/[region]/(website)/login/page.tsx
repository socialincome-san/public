import { DefaultLayoutProps, DefaultPageProps } from '@/app/[lang]/[region]';
import LoginForm from '@/app/[lang]/[region]/(website)/login/login-form';
import { WebsiteLanguage } from '@/lib/i18n/utils';
import { getMetadata } from '@/metadata';
import { Translator } from '@socialincome/shared/src/utils/i18n';
import { BaseContainer } from '@socialincome/ui';

export async function generateMetadata(props: DefaultLayoutProps) {
	const params = await props.params;
	return getMetadata(params.lang as WebsiteLanguage, 'website-login');
}

export default async function Page({ params }: DefaultPageProps) {
	const { lang, region } = await params;
	const translator = await Translator.getInstance({ language: lang as WebsiteLanguage, namespaces: ['website-login'] });

	return (
		<BaseContainer className="min-h-screen-navbar mx-auto flex max-w-lg flex-col">
			<LoginForm
				lang={lang}
				region={region}
				translations={{
					title: translator.t('title'),
					email: translator.t('email'),
					invalidEmail: translator.t('invalid-email'),
					submitButton: translator.t('submit-button'),
					checkEmail: translator.t('check-email'),
					confirmEmail: translator.t('confirm-email'),
					confirmEmailTitle: translator.t('confirm-email-title'),
					backToLogin: translator.t('back-to-login'),
					signingIn: translator.t('signing-in'),
				}}
			/>
		</BaseContainer>
	);
}
