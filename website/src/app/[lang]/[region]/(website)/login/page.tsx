import { DefaultPageProps } from '@/app/[lang]/[region]';
import LoginForm from '@/app/[lang]/[region]/(website)/login/login-form';
import { Translator } from '@socialincome/shared/src/utils/i18n';
import { BaseContainer } from '@socialincome/ui';

export default async function Page({ params }: DefaultPageProps) {
	const translator = await Translator.getInstance({ language: params.lang, namespaces: ['website-me'] });

	return (
		<BaseContainer>
			<LoginForm
				lang={params.lang}
				region={params.region}
				translations={{
					title: translator.t('login.title'),
					email: translator.t('login.email'),
					password: translator.t('login.password'),
					forgotPassword: translator.t('login.forgot-password'),
					signInWithGoogle: translator.t('login.sign-in-with-google'),
					requiredField: translator.t('login.required-field'),
					invalidEmail: translator.t('login.invalid-email'),
					submitButton: translator.t('login.submit-button'),
					unknownUser: translator.t('login.unknown-user'),
					wrongPassword: translator.t('login.wrong-password'),
				}}
			/>
		</BaseContainer>
	);
}
