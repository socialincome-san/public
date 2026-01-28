'use client';

import { UserRound } from 'lucide-react';
import Link from 'next/link';

type Props = {};

export const LoginButton = () => {
	return (
		<Link href="/login" className="flex items-center gap-2 text-base font-medium">
			<UserRound className="h-4 w-4" />
			Login
		</Link>
	);
};
