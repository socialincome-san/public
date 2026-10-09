'use client';

import { NotFound as NotFoundComponent } from '@/components/not-found';
import { useWebsiteBasePath } from '@/lib/i18n/website-currency';
import { Button } from '@socialincome/design-system/actions/button/button';
import Link from 'next/link';

export default function NotFound() {
	return (
		<NotFoundComponent>
			<Button asChild>
				<Link href={`${useWebsiteBasePath()}/dashboard/subscriptions`}>Return to dashboard</Link>
			</Button>
		</NotFoundComponent>
	);
}
