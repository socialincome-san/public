import { DefaultPageProps } from '@/app/[lang]/[region]';
import { SignOutButton } from '@/app/[lang]/[region]/(website)/me/security/sign-out-button';
import { Translator } from '@socialincome/shared/src/utils/i18n';

export default async function Page({ params }: DefaultPageProps) {
	const { lang } = await params;
	const translator = await Translator.getInstance({ language: lang, namespaces: ['website-me'] });

	return (
		<div className="space-y-12">
			<SignOutButton
				translations={{
					title: translator.t('security.sign-out.title'),
					buttonText: translator.t('security.sign-out.button'),
				}}
			/>
		</div>
	);
}
