const COLORS = [
	'foreground',
	'background',
	'border',
	'input',
	'ring',
	'primary',
	'primary-foreground',
	'secondary',
	'secondary-foreground',
	'destructive',
	'destructive-foreground',
	'muted',
	'muted-foreground',
	'accent',
	'accent-foreground',
	'popover',
	'popover-foreground',
	'card',
	'card-foreground',
	'bg-primary',
	'bg-red-50',
	'bg-yellow-50',
	'bg-green-50',
	'bg-blue-50',
	'bg-indigo-50',
	'bg-purple-50',
	'bg-pink-50',
	'bg-muted',
	'bg-primary',
	'bg-background',
	'bg-transparent',
] as const;
type Color = (typeof COLORS)[number];

export type FontColor = Extract<
	Color,
	| 'foreground'
	| 'background'
	| 'primary'
	| 'primary-foreground'
	| 'secondary'
	| 'secondary-foreground'
	| 'destructive'
	| 'destructive-foreground'
	| 'muted'
	| 'muted-foreground'
	| 'accent'
	| 'accent-foreground'
	| 'card'
	| 'card-foreground'
	| 'popover'
	| 'popover-foreground'
>;
