import * as ToggleGroupPrimitive from '@radix-ui/react-toggle-group';
import { cn } from '@socialincome/ui/src/lib/utils';

type Option = { value: string; label: string };

type SegmentedToggleProps = {
  value: string;
  onValueChange: (value: string) => void;
  options: ReadonlyArray<Option>;
  className?: string;
};

export const SegmentedToggle = ({ value, onValueChange, options, className }: SegmentedToggleProps) => {
  return (
    <ToggleGroupPrimitive.Root
      type="single"
      value={value}
      onValueChange={(v) => v && onValueChange(v)}
      className={cn('inline-flex rounded-full border border-input bg-muted/40 p-1', className)}
    >
      {options.map((opt) => (
        <ToggleGroupPrimitive.Item
          key={opt.value}
          value={opt.value}
          className={cn(
            'rounded-full px-3 py-1 text-sm text-muted-foreground transition-colors hover:text-foreground data-[state=on]:text-foreground',
            'data-[state=on]:shadow-xs data-[state=on]:bg-background',
          )}
        >
          {opt.label}
        </ToggleGroupPrimitive.Item>
      ))}
    </ToggleGroupPrimitive.Root>
  );
};
