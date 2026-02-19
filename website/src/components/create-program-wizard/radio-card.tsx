'use client';

import { RadioGroupItem } from '@/components/radio-group';
import { cn } from '@/lib/utils/cn';
import { ReactNode } from 'react';

type Props = {
	value: string;
	checked?: boolean;
	disabled?: boolean;
	label: ReactNode;
	description?: string;
	badge?: ReactNode;
	children?: ReactNode;
};

export const RadioCard = ({ value, checked, disabled, label, description, badge, children }: Props) => {
	return (
		<label
			data-testid={`radio-card-${value}`}
			className={cn(
				'relative flex items-start gap-3 rounded-lg border p-4 transition-colors',
				!disabled && 'hover:bg-muted/40 cursor-pointer',
				checked && !disabled && 'bg-muted/30',
				disabled && 'cursor-not-allowed opacity-60',
			)}
		>
			<RadioGroupItem value={value} disabled={disabled} className="absolute right-3 top-3" />

			<div className="flex-1 space-y-1 pr-6">
				<div className="flex items-center gap-2">
					{label}
					{badge}
				</div>

				{description && <p className="text-muted-foreground text-sm">{description}</p>}

				{children && (
					<div
						className={cn(
							'grid transition-all duration-300 ease-in-out',
							checked ? 'mt-4 grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0',
						)}
					>
						<div className="overflow-hidden">{children}</div>
					</div>
				)}
			</div>
		</label>
	);
}
