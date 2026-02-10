import { WebsiteAppShell } from '@/components/app-shells/website/app-shell';
import { getAuthenticatedContributorOrRedirect } from '@/lib/firebase/current-contributor';
import { WebsiteLanguage } from '@/lib/i18n/utils';
import type { PropsWithChildren } from 'react';
import { DefaultLayoutProps } from '..';

export default async function Layout({ children, params }: PropsWithChildren<DefaultLayoutProps>) {
	const { lang, region } = await params;
	const contributor = await getAuthenticatedContributorOrRedirect();

	return (
		<WebsiteAppShell session={contributor} lang={lang as WebsiteLanguage} region={region} scope="dashboard">
			{children}
		</WebsiteAppShell>
	);
}
