import { cn } from '@/lib/utils/cn';
import { PropsWithChildren } from 'react';

export const BlockWrapper = ({ children, className }: PropsWithChildren<{ className?: string }>) => {
	return <div className={cn('my-8 lg:my-16', className)}>{children}</div>;
};
