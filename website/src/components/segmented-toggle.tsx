import * as ToggleGroupPrimitive from '@radix-ui/react-toggle-group';
import { cn } from '@socialincome/ui/src/lib/utils';

type Option = { value: string; label: string };

type SegmentedToggleProps = {
	value: string;
	onValueChange: (value: string) => void;
	options: ReadonlyArray<Option>;
	className?: string;
};

export function SegmentedToggle({ value, onValueChange, options, className }: SegmentedToggleProps) {
	return (
		<ToggleGroupPrimitive.Root
			type="single"
			value={value}
			onValueChange={(v) => v && onValueChange(v)}
			className={cn('bg-muted/40 border-input inline-flex rounded-full border p-1', className)}
		>
			{options.map((opt) => (
				<ToggleGroupPrimitive.Item
					key={opt.value}
					value={opt.value}
					className={cn(
						'text-muted-foreground data-[state=on]:text-foreground hover:text-foreground rounded-full px-3 py-1 text-sm transition-colors',
						'data-[state=on]:bg-background data-[state=on]:shadow-xs',
					)}
				>
					{opt.label}
				</ToggleGroupPrimitive.Item>
			))}
		</ToggleGroupPrimitive.Root>
	);
}
