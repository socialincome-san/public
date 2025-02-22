import { DefaultLayoutProps, DefaultPageProps } from '@/app/[lang]/[region]';
import ResetPasswordForm from '@/app/[lang]/[region]/(website)/login/reset-password/reset-password-form';
import { getMetadata } from '@/metadata';
import { InformationCircleIcon } from '@heroicons/react/24/outline';
import { Translator } from '@socialincome/shared/src/utils/i18n';
import {
	Alert,
	AlertDescription,
	AlertTitle,
	BaseContainer,
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
	Typography,
} from '@socialincome/ui';

export async function generateMetadata({ params }: DefaultLayoutProps) {
	return getMetadata(params.lang, 'website-login');
}

export default async function Page({ params, searchParams }: DefaultPageProps & { searchParams: { oobCode?: string } }) {
	const translator = await Translator.getInstance({ language: params.lang, namespaces: ['website-login'] });

	if (!searchParams.oobCode) {
		return (
			<BaseContainer className="min-h-screen-navbar mx-auto flex max-w-lg flex-col">
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
		<BaseContainer className="min-h-screen-navbar mx-auto flex max-w-lg flex-col">
			<Alert variant="accent" className="mb-8">
				<AlertTitle className="flex-inline flex">
					{translator.t('alert.title')}
					<TooltipProvider delayDuration={100}>
						<Tooltip>
							<TooltipTrigger>
								<InformationCircleIcon className="ml-1 h-5 w-5" />
							</TooltipTrigger>
							<TooltipContent className="max-w-md">{translator.t('alert.tooltip')}</TooltipContent>
						</Tooltip>
					</TooltipProvider>
				</AlertTitle>
				<AlertDescription>
					<Typography>{translator.t('alert.text')}</Typography>
				</AlertDescription>
			</Alert>

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
				}}
			/>
		</BaseContainer>
	);
}
