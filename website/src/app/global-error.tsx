'use client';

import { defaultLanguage } from '@/lib/i18n/utils';

export default function GlobalError({ error }: { error: Error & { digest?: string } }) {
	return (
		<html lang={defaultLanguage}>
			<body>Sorry, something went wrong, error ID: {error.digest ?? 'N/A'}</body>
		</html>
	);
}
