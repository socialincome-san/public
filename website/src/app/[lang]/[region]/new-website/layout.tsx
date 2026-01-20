import { DefaultLayoutProps } from '@/app/[lang]/[region]';
import { WebsiteAppShell } from '@/components/app-shells/website/app-shell';
import { WebsiteLanguage } from '@/lib/i18n/utils';
import { notFound } from 'next/navigation';
import type { PropsWithChildren } from 'react';

const ENABLE_NEW_WEBSITE = process.env.FEATURE_ENABLE_NEW_WEBSITE === 'true';

export default async function Layout({ children, params }: PropsWithChildren<DefaultLayoutProps>) {
	const { lang } = await params;

	if (!ENABLE_NEW_WEBSITE) {
		console.warn('New Website feature is disabled - returning 404');
		notFound();
	}

	return <WebsiteAppShell lang={lang as WebsiteLanguage}>{children}</WebsiteAppShell>;
}
