'use client';

import { Button } from '@/app/portal/components/button';
import { SpinnerIcon } from '@socialincome/ui/src/icons/spinner';
import { ReactNode } from 'react';

type DialogActionSectionProps = {
	label: string;
	description: string;
	onClick: () => void;
	icon?: ReactNode;
	isPending?: boolean;
	variant?: 'default' | 'outline';
};

export function DialogActionSection({
	label,
	description,
	onClick,
	icon,
	isPending,
	variant = 'outline',
}: DialogActionSectionProps) {
	return (
		<div>
			<Button className="w-full" variant={variant} onClick={onClick} disabled={isPending}>
				{isPending ? <SpinnerIcon className="h-4 w-4 animate-spin" /> : icon}
				<span className="ml-2">{label}</span>
			</Button>
			<p className="text-muted-foreground mt-1 text-xs">{description}</p>
		</div>
	);
}
