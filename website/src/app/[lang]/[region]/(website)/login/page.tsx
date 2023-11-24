import { DefaultPageProps } from '@/app/[lang]/[region]';
import LoginForm from '@/app/[lang]/[region]/(website)/login/login-form';
import ResetPasswordDialog from '@/app/[lang]/[region]/(website)/login/reset-password-dialog';
import { SocialSignInButtons } from '@/app/[lang]/[region]/(website)/login/social-sign-in-buttons';
import { Translator } from '@socialincome/shared/src/utils/i18n';

export default async function Page({ params }: DefaultPageProps) {
	const translator = await Translator.getInstance({ language: params.lang, namespaces: ['website-login'] });

	return (
		<div className="mx-auto flex max-w-md flex-col">
			<LoginForm
				lang={params.lang}
				region={params.region}
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
				<ResetPasswordDialog
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
				lang={params.lang}
				region={params.region}
				translations={{
					signInWithGoogle: translator.t('sign-in-with-google'),
				}}
			/>
		</div>
	);
}
