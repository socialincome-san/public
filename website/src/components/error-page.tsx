'use client';

import { Button } from '@socialincome/design-system/actions/button/button';
import { FallbackPage } from '@socialincome/design-system/feedback/fallback-page/fallback-page';
import Link from 'next/link';

export const ErrorPage = ({ error }: { error: Error & { digest?: string } }) => (
	<FallbackPage
		eyebrow="500"
		title="Something went wrong"
		description="We could not load this page. Please try again in a moment, or return to the homepage."
		detail={error.digest ? `Error ID: ${error.digest}` : undefined}
	>
		<Button asChild>
			<Link href="/">Go to homepage</Link>
		</Button>
	</FallbackPage>
);
