import { getCurrentAccountType } from '@/lib/firebase/current-account';
import { notFound, redirect } from 'next/navigation';

export async function AccountRedirect() {
	const accountType = await getCurrentAccountType();

	if (accountType === 'user') {
		redirect('/portal');
	}
	if (accountType === 'contributor') {
		redirect('/dashboard/contributions');
	}

	return notFound();
}
