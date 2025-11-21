import { getCurrentAccountType } from '@/lib/firebase/current-account';
import { notFound, redirect } from 'next/navigation';

export async function AccountRedirect() {
	const accountType = await getCurrentAccountType();

	if (accountType === 'contributor') {
		redirect('/dashboard/contributions');
	}
	if (accountType === 'user') {
		redirect('/portal');
	}

	return notFound();
}
