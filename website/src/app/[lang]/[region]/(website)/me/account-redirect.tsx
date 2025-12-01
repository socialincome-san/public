import { getCurrentAccountType } from '@/lib/firebase/current-account';
import { WebsiteLanguage } from '@/lib/i18n/utils';
import { Translator } from '@socialincome/shared/src/utils/i18n';
import { Button } from '@socialincome/ui';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export async function AccountRedirect({ lang }: { lang: WebsiteLanguage }) {
	const translator = await Translator.getInstance({ language: lang, namespaces: ['website-login'] });
	const accountType = await getCurrentAccountType();

	if (accountType === 'contributor') {
		redirect('/dashboard/contributions');
	}
	if (accountType === 'user') {
		redirect('/portal');
	}

	return (
		<>
			<span className="mb-5">{translator.t('invalid-account-type')}</span>
			<Link href={`/login`}>
				<Button>{translator.t('back-to-login')}</Button>
			</Link>
		</>
	);
}
