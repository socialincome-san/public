'use client';

import { useUser } from '@/app/portal/hooks/useUser';

export default function Dashboard() {
	const user = useUser();

	if (!user) return null;

	return <div className="text-lg">Welcome back, {user.firstName} 👋</div>;
}
