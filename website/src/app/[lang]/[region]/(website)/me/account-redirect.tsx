import { getCurrentSessions } from '@/lib/firebase/current-account';
import { Translator } from '@/lib/i18n/translator';
import { WebsiteLanguage } from '@/lib/i18n/utils';
import { Button } from '@socialincome/ui';
import Link from 'next/link';
import { redirect } from 'next/navigation';

type Props = {
	lang: WebsiteLanguage;
};

export const AccountRedirect = async ({ lang }: Props) => {
	const translator = await Translator.getInstance({ language: lang as WebsiteLanguage, namespaces: ['website-login'] });
	const sessions = await getCurrentSessions();
	const session = sessions[0] ?? null; //this is on the old website. The old website does not support multiple sessions.
	const sessionType = session?.type;

	if (sessionType === 'contributor') {
		redirect('/dashboard/contributions');
	}
	if (sessionType === 'user') {
		redirect('/portal');
	}
	if (sessionType === 'local-partner') {
		redirect('/partner-space/recipients');
	}

	return (
		<>
			<span className="mb-5">{translator.t('invalid-account-type')}</span>
			<Link href={`/login`}>
				<Button>{translator.t('back-to-login')}</Button>
			</Link>
		</>
	);
};
