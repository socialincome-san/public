'use client';

import { ReactNode } from 'react';
import { cn } from '../../../cn';
import { RadioGroup, RadioGroupItem } from '../radio-group/radio-group';

type RadioCardProps = {
	value: string;
	checked?: boolean;
	disabled?: boolean;
	label: ReactNode;
	description?: string;
	badge?: ReactNode;
	children?: ReactNode;
};

export const RadioCard = ({ value, checked, disabled, label, description, badge, children }: RadioCardProps) => {
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
			<span className="absolute top-1/2 right-3 flex -translate-y-1/2">
				<RadioGroupItem value={value} disabled={disabled} />
			</span>

			<div className="flex-1 space-y-1 pr-6">
				<div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
					<span className="min-w-0">{label}</span>
					{badge ? <span className="shrink-0 whitespace-nowrap">{badge}</span> : null}
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
};

type RadioCardGroupProps = {
	value?: string;
	onChange: (value: string) => void;
	layout?: 'stack' | 'grid' | 'wrap';
	children: ReactNode;
};

export const RadioCardGroup = ({ value, onChange, layout = 'stack', children }: RadioCardGroupProps) => {
	return (
		<RadioGroup value={value} onValueChange={onChange} layout={layout === 'wrap' ? 'row' : layout}>
			{children}
		</RadioGroup>
	);
};
