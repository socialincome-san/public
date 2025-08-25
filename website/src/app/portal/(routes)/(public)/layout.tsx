import { AppShell } from '@/app/portal/components/app-shell';
import type { ReactNode } from 'react';

export default async function PublicLayout({ children }: { children: ReactNode }) {
	return <AppShell>{children}</AppShell>;
}
