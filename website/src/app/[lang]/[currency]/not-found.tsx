'use client';

import { NotFound } from '@/components/not-found';
import { useWebsiteBasePath } from '@/lib/i18n/website-currency';
import { Button } from '@socialincome/design-system/actions/button/button';
import Link from 'next/link';

export default function WebsiteNotFound() {
	return (
		<NotFound title="We could not find that page" description="The page may have moved, or the link may no longer be valid.">
			<Button asChild>
				<Link href={useWebsiteBasePath()}>Go to homepage</Link>
			</Button>
		</NotFound>
	);
}
