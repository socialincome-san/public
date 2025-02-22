import { DefaultLayoutProps, DefaultPageProps } from '@/app/[lang]/[region]';
import LoginForm from '@/app/[lang]/[region]/(website)/login/login-form';
import RequestPasswordResetDialog from '@/app/[lang]/[region]/(website)/login/request-password-reset-dialog';
import { SocialSignInButtons } from '@/app/[lang]/[region]/(website)/login/social-sign-in-buttons';
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

export default async function Page({ params }: DefaultPageProps) {
	const translator = await Translator.getInstance({ language: params.lang, namespaces: ['website-login'] });

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
				lang={params.lang}
				region={params.region}
				translations={{
					signInWithGoogle: translator.t('sign-in-with-google'),
				}}
			/>
		</BaseContainer>
	);
}
