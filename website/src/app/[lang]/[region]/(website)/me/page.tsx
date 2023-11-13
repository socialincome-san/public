'use client';

import { redirect } from 'next/navigation';
import { useLayoutEffect } from 'react';
import { useUser } from 'reactfire';

export default function Page() {
	const { status: authUserStatus, data: authUser } = useUser();

	useLayoutEffect(() => {
		if (authUserStatus === 'success' && authUser === null) {
			redirect('../login');
		} else {
			redirect('./me/contributions');
		}
	}, [authUser, authUserStatus]);
}
