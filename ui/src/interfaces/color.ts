export const COLORS = [
	'foreground',
	'background',
	'border',
	'input',
	'ring',
	'si-yellow',
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
	'bg-red-50',
	'bg-yellow-50',
	'bg-green-50',
	'bg-blue-50',
	'bg-indigo-50',
	'bg-purple-50',
	'bg-pink-50',
	'bg-muted',
] as const;
export type Color = (typeof COLORS)[number];

export type FontColor = Extract<
	Color,
	| 'foreground'
	| 'background'
	| 'si-yellow'
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
	| 'popover'
	| 'popover-foreground'
>;

export type BackgroundColor = Extract<
	Color,
	| 'bg-red-50'
	| 'bg-yellow-50'
	| 'bg-green-50'
	| 'bg-blue-50'
	| 'bg-indigo-50'
	| 'bg-purple-50'
	| 'bg-pink-50'
	| 'bg-muted'
>;
