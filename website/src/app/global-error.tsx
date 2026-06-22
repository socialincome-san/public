'use client';

import { defaultLanguage } from '@/lib/i18n/utils';
import * as Sentry from '@sentry/nextjs';
import { useEffect } from 'react';

export default function GlobalError({ error }: { error: Error & { digest?: string } }) {
	useEffect(() => {
		Sentry.captureException(error);
	}, [error]);

	return (
		<html lang={defaultLanguage}>
			<body>Sorry, something went wrong, error ID: {error.digest ?? 'N/A'}</body>
		</html>
	);
}
