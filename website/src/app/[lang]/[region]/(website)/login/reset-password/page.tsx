import { DefaultLayoutProps, DefaultPageProps } from '@/app/[lang]/[region]';
import ResetPasswordForm from '@/app/[lang]/[region]/(website)/login/reset-password/reset-password-form';
import { getMetadata } from '@/metadata';
import { Translator } from '@socialincome/shared/src/utils/i18n';
import { Alert, AlertDescription, AlertTitle, BaseContainer, Typography } from '@socialincome/ui';

export async function generateMetadata({ params }: DefaultLayoutProps) {
	const { lang } = await params;
	return getMetadata(lang, 'website-login');
}

export default async function Page(
	props: DefaultPageProps & {
		searchParams: { oobCode?: string };
	},
) {
	const searchParams = await props.searchParams;
	const params = await props.params;
	const translator = await Translator.getInstance({ language: params.lang, namespaces: ['website-login'] });

	if (!searchParams.oobCode) {
		return (
			<BaseContainer className="mx-auto flex max-w-lg flex-col">
				<Alert variant="destructive">
					<AlertTitle>Error</AlertTitle>
					<AlertDescription>
						<Typography>{translator.t('reset-password.invalid-code')}</Typography>
					</AlertDescription>
				</Alert>
			</BaseContainer>
		);
	}

	return (
		<BaseContainer className="mx-auto flex max-w-lg flex-col">
			<ResetPasswordForm
				params={params}
				oobCode={searchParams.oobCode}
				translations={{
					title: translator.t('reset-password.title'),
					passwordPlaceholder: translator.t('reset-password.password-placeholder'),
					confirmPasswordPlaceholder: translator.t('reset-password.confirm-password-placeholder'),
					invalidPassword: translator.t('reset-password.invalid-password'),
					passwordsDontMatch: translator.t('reset-password.passwords-dont-match'),
					resetPasswordSubmitButton: translator.t('reset-password.submit-button'),
					resetPasswordSuccess: translator.t('reset-password.success'),
					resetPasswordError: translator.t('reset-password.error'),
					resetPasswordInvalid: translator.t('reset-password.invalid-action'),
					resetPasswordExpired: translator.t('reset-password.expired-code'),
				}}
			/>
		</BaseContainer>
	);
}
