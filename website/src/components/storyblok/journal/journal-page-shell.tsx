import { cn } from '@/lib/utils/cn';
import type { PropsWithChildren } from 'react';

export const JournalPageShell = ({ children, className }: PropsWithChildren<{ className?: string }>) => (
	<div className={cn('w-site-width max-w-content mx-auto space-y-10 px-4 py-6 sm:px-0 sm:py-10', className)}>{children}</div>
);
