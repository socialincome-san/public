import { DefaultLayoutProps, DefaultPageProps } from '@/app/[lang]/[region]';
import LoginForm from '@/app/[lang]/[region]/(website)/login/login-form';
import RequestPasswordResetDialog from '@/app/[lang]/[region]/(website)/login/request-password-reset-dialog';
import { SocialSignInButtons } from '@/app/[lang]/[region]/(website)/login/social-sign-in-buttons';
import { getMetadata } from '@/metadata';
import { Translator } from '@socialincome/shared/src/utils/i18n';
import { BaseContainer } from '@socialincome/ui';

export async function generateMetadata(props: DefaultLayoutProps) {
	const params = await props.params;
	return getMetadata(params.lang, 'website-login');
}

export default async function Page({ params }: DefaultPageProps) {
	const { lang, region } = await params;
	const translator = await Translator.getInstance({ language: lang, namespaces: ['website-login'] });

	return (
		<BaseContainer className="min-h-screen-navbar mx-auto flex max-w-lg flex-col">
			<LoginForm
				lang={lang}
				region={region}
				translations={{
					title: translator.t('title'),
					email: translator.t('email'),
					password: translator.t('password'),
					forgotPassword: translator.t('forgot-password'),
					invalidEmail: translator.t('invalid-email'),
					invalidUserOrPassword: translator.t('invalid-user-or-password'),
					submitButton: translator.t('submit-button'),
				}}
			/>
			<div className="self-end">
				<RequestPasswordResetDialog
					translations={{
						emailPlaceholder: translator.t('email'),
						invalidEmail: translator.t('invalid-email'),
						resetPasswordButton: translator.t('reset-password-button'),
						resetPasswordTitle: translator.t('reset-password-title'),
						resetPasswordText: translator.t('reset-password-text'),
						resetPasswordToastMessage: translator.t('reset-password-toast-message'),
						resetPasswordSubmitButton: translator.t('reset-password-submit-button'),
					}}
				/>
			</div>
			<SocialSignInButtons
				lang={lang}
				region={region}
				translations={{
					signInWithGoogle: translator.t('sign-in-with-google'),
				}}
			/>
		</BaseContainer>
	);
}
