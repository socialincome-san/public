'use client';

import { NotFound } from '@/components/not-found';
import { useWebsiteBasePath } from '@/lib/i18n/website-currency';
import { Button } from '@socialincome/design-system/actions/button/button';
import { useTranslations } from 'next-intl';
import Link from 'next/link';

export default function WebsiteNotFound() {
	const t = useTranslations('website-common');

	return (
		<NotFound title={t('not-found.title')} description={t('not-found.description')}>
			<Button asChild>
				<Link href={useWebsiteBasePath()}>{t('not-found.home-link')}</Link>
			</Button>
		</NotFound>
	);
}
