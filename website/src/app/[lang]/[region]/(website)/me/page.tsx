import { Suspense } from 'react';
import { AccountRedirect } from './account-redirect';

export default function Page() {
	return (
		<Suspense fallback={<div>Detecting account type...</div>}>
			<AccountRedirect />
		</Suspense>
	);
}
