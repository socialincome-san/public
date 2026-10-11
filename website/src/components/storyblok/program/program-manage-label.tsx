import { getCurrentUserAction } from '@/modules/auth/auth.actions';
import { getTranslations } from 'next-intl/server';
import { Suspense } from 'react';

const SessionManageLabel = async () => {
	const [t, userResult] = await Promise.all([getTranslations('website-common'), getCurrentUserAction()]);
	const isLoggedIn = userResult.success && userResult.data !== null;

	return isLoggedIn ? t('program-detail-page.manage') : t('program-detail-page.login-to-manage');
};

// The label depends on the session, so it streams in while the rest of the program page stays static.
export const ProgramManageLabel = async () => {
	const t = await getTranslations('website-common');

	return (
		<Suspense fallback={t('program-detail-page.login-to-manage')}>
			<SessionManageLabel />
		</Suspense>
	);
};
