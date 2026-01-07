'use client';

import { cn } from '@/lib/utils/cn';
import { Cause } from '@prisma/client';
import { X } from 'lucide-react';

function humanizeCause(cause: Cause) {
	return cause.replace(/_/g, ' ');
}

type TargetCauseSelectorProps = {
	selected?: Cause[];
	onToggle: (cause: Cause) => void;
};

export function TargetCauseSelector({ selected = [], onToggle }: TargetCauseSelectorProps) {
	return (
		<div className="space-y-2">
			<p className="text-sm font-medium">Select target causes</p>

			<div className="flex flex-wrap gap-2">
				{Object.values(Cause).map((cause) => {
					const isActive = selected.includes(cause);

					return (
						<button
							key={cause}
							type="button"
							onClick={() => onToggle(cause)}
							aria-pressed={isActive}
							className={cn(
								'inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1 text-sm',
								'relative z-10 transition-colors',

								isActive
									? [
											'text-primary-foreground bg-primary/90 shadow',
											'after:absolute after:inset-0 after:-z-10 after:rounded-full',
											'after:bg-gradient-to-r',
											'after:from-[hsl(var(--gradient-button-from))]',
											'after:to-[hsl(var(--gradient-button-to))]',
											'after:opacity-100 hover:after:opacity-0',
											'after:transition-opacity',
										].join(' ')
									: 'bg-background hover:bg-muted border',
							)}
						>
							<span>{humanizeCause(cause)}</span>

							{isActive && <X className="h-3.5 w-3.5" aria-hidden />}
						</button>
					);
				})}
			</div>
		</div>
	);
}
