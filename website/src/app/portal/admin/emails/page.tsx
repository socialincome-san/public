import { getEmailCatalog } from '@/modules/mail/mail.service';
import { requireAdmin } from '@/server/session';
import { AppLoadingSkeleton } from '@socialincome/design-system/feedback/app-loading-skeleton/app-loading-skeleton';
import { Suspense } from 'react';
import { EmailsTable } from './emails-table';

export default function EmailsPage() {
	return (
		<Suspense fallback={<AppLoadingSkeleton />}>
			<EmailsDataLoader />
		</Suspense>
	);
}

const EmailsDataLoader = async () => {
	const user = await requireAdmin();
	const result = await getEmailCatalog(user.id);

	return <EmailsTable rows={result.success ? result.data : []} error={result.success ? null : result.error} />;
};
