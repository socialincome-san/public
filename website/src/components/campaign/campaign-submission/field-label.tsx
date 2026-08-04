'use client';

import { Label } from '@/components/label';
import { cn } from '@/lib/utils/cn';
import type { ComponentProps } from 'react';

type Props = ComponentProps<typeof Label> & {
	showRequired: boolean;
};

export const FieldLabel = ({ showRequired, className, children, ...props }: Props) => {
	return (
		<Label className={cn(showRequired && 'text-destructive', className)} {...props}>
			{children}
			{showRequired ? <span aria-hidden="true"> *</span> : null}
		</Label>
	);
};
