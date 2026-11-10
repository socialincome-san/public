import { cva } from 'class-variance-authority';
import * as React from 'react';
import { cn } from '../../../cn';
import { type WithoutClassName } from '../../../without-class-name';
import { Input } from '../input/input';

const fieldBorder = 'border-input/60';

const digitsVariants = cva('flex items-baseline gap-2 leading-none font-medium @max-[10rem]:flex-wrap', {
	variants: {
		size: {
			default: 'text-lg',
			lg: 'text-lg sm:gap-3 sm:text-4xl',
		},
	},
});

type AmountQuickPick = {
	value: number;
	ariaLabel: string;
};

type AmountFieldProps = {
	label: string;
	value: string;
	error?: string;
	// Shown faded, for a field that is not the active choice
	inactive?: boolean;
	// Shown inside the field while it has focus
	quickPicks?: AmountQuickPick[];
	selectedQuickPick?: number | null;
	onQuickPickSelect?: (value: number) => void;
	// lg: bigger digits, and the quick picks also show while the field is idle from sm up
	size?: 'default' | 'lg';
} & WithoutClassName<Omit<React.ComponentProps<'input'>, 'value' | 'size'>>;

const AmountField = ({
	label,
	value,
	error,
	inactive = false,
	quickPicks = [],
	selectedQuickPick = null,
	onQuickPickSelect,
	size = 'default',
	id,
	...props
}: AmountFieldProps) => {
	const generatedId = React.useId();
	const inputId = id ?? generatedId;
	const errorId = `${inputId}-error`;

	return (
		<div>
			<div
				className={cn(
					fieldBorder,
					'group bg-card focus-within:border-ring focus-within:ring-ring/50 @container relative rounded-md border px-4 py-3 transition-[border-color,box-shadow,background-color,color] focus-within:ring-[3px]',
					inactive ? 'text-muted-foreground opacity-60' : 'text-foreground',
				)}
			>
				<label
					htmlFor={inputId}
					className={cn(
						'absolute left-4 cursor-text font-medium transition-all motion-reduce:transition-none',
						value === ''
							? 'group-focus-within:text-2xs top-1/2 -translate-y-1/2 text-sm group-focus-within:top-3 group-focus-within:translate-y-0'
							: 'text-2xs top-3',
					)}
				>
					{label}
				</label>
				<div className="h-3.5" aria-hidden />
				{/* Below 10rem the chips no longer fit next to the digits and move to their own line */}
				<div className={digitsVariants({ size })}>
					<Input
						variant="bare"
						id={inputId}
						inputMode="numeric"
						// Password managers ignore autoComplete="off" and need their own opt-out
						autoComplete="off"
						data-1p-ignore
						data-lpignore="true"
						data-bwignore
						value={value}
						aria-invalid={error !== undefined}
						aria-describedby={error === undefined ? undefined : errorId}
						{...props}
					/>
					{quickPicks.length > 0 && (
						// The shift puts the chips' bottom edge on the bottom of the digits
						<div
							className={cn(
								'-my-1 hidden shrink-0 -translate-y-2 gap-1.5 group-focus-within:flex @max-[10rem]:my-0 @max-[10rem]:shrink @max-[10rem]:translate-y-0 @max-[10rem]:flex-wrap',
								size === 'lg' && 'sm:my-0 sm:flex',
							)}
						>
							{quickPicks.map((quickPick) => (
								<button
									key={quickPick.value}
									type="button"
									aria-pressed={selectedQuickPick === quickPick.value}
									aria-label={quickPick.ariaLabel}
									// Safari does not focus buttons on click, so the field would lose focus and hide the chips first
									onMouseDown={(e) => e.preventDefault()}
									onClick={() => onQuickPickSelect?.(quickPick.value)}
									className={cn(
										fieldBorder,
										'text-2xs cursor-pointer rounded-full border px-2.5 py-1 font-medium whitespace-nowrap transition-colors',
										selectedQuickPick === quickPick.value
											? 'bg-muted text-foreground'
											: 'bg-card text-muted-foreground hover:bg-muted/50 hover:text-foreground',
									)}
								>
									{quickPick.value}
								</button>
							))}
						</div>
					)}
				</div>
			</div>
			{error !== undefined && (
				<p id={errorId} className="text-destructive text-2xs mt-2 font-medium">
					{error}
				</p>
			)}
		</div>
	);
};

export { AmountField, type AmountQuickPick };
