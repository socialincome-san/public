import { MagicLinkLoginForm } from '@/components/login/magic-link-login-form';
import { getTranslations } from 'next-intl/server';

type Props = {
	prefilledEmail: string;
};

export const LoginPageContent = async ({ prefilledEmail }: Props) => {
	const t = await getTranslations('website-login');

	return (
		<div className="flex min-h-[40vh] flex-1 flex-col items-center justify-center px-4">
			<div className="border-border bg-card mx-auto w-full max-w-[400px] rounded-3xl border px-4 pt-4 pb-6 shadow-xs sm:px-6 sm:pt-5 sm:pb-7 md:px-9 md:py-9">
				<h1 className="text-foreground mb-5 text-center text-xl font-semibold">{t('title')}</h1>
				<MagicLinkLoginForm prefilledEmail={prefilledEmail} />
			</div>
		</div>
	);
};
