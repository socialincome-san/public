import { DefaultPageProps } from '@/app/[lang]/[region]';
import { SignOutButton } from '@/app/[lang]/[region]/(website)/me/security/sign-out-button';
import UpdatePasswordForm from '@/app/[lang]/[region]/(website)/me/security/update-password-form';
import { Translator } from '@socialincome/shared/src/utils/i18n';

export default async function Page({ params }: DefaultPageProps) {
	const { lang } = await params;
	const translator = await Translator.getInstance({ language: lang, namespaces: ['website-me'] });

	return (
		<div className="space-y-12">
			<UpdatePasswordForm
				translations={{
					title: translator.t('security.reset-password.title'),
					password: translator.t('security.reset-password.password'),
					passwordConfirmation: translator.t('security.reset-password.password-confirmation'),
					submitButton: translator.t('security.reset-password.submit-button'),
					passwordsMismatch: translator.t('security.reset-password.passwords-mismatch'),
					passwordResetErrorToast: translator.t('security.reset-password.error-toast'),
					passwordResetSuccessToast: translator.t('security.reset-password.success-toast'),
				}}
			/>
			<SignOutButton
				translations={{
					title: translator.t('security.sign-out.title'),
					buttonText: translator.t('security.sign-out.button'),
				}}
			/>
		</div>
	);
}
