'use client';

import { Button } from '@/components/button';
import { FallbackPage } from '@/components/fallback-page';
import Link from 'next/link';

export default function Error({ error }: { error: Error & { digest?: string } }) {
	return (
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
}
