import { DefaultPageProps } from '@/app/[lang]/[country]';
import LoginForm from '@/app/[lang]/[country]/(website)/login/login-form';
import { Translator } from '@socialincome/shared/src/utils/i18n';

export default async function Page(props: DefaultPageProps) {
	const translator = await Translator.getInstance({ language: props.params.lang, namespaces: 'website-me' });

	return (
		<LoginForm
			translations={{
				title: translator.t('login.title'),
				email: translator.t('login.email'),
				password: translator.t('login.password'),
				forgotPassword: translator.t('login.forgot-password'),
				requiredField: translator.t('login.required-field'),
				invalidEmail: translator.t('login.invalid-email'),
				submitButton: translator.t('login.submit-button'),

				unknownUser: translator.t('login.unknown-user'),
				wrongPassword: translator.t('login.wrong-password'),
			}}
			{...props}
		/>
	);
}
