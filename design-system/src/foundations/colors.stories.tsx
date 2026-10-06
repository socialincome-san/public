import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Code, FoundationPage, FoundationSection } from './foundation-layout';
import { toHex, useComputedStyle } from './measure';

const meta = {
	title: 'Foundations/Colors',
	parameters: { layout: 'padded' },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

type ColorToken = {
	name: string;
	// A literal class name, so Tailwind generates it
	swatchClass: string;
};

const colorGroups: { title: string; tokens: ColorToken[] }[] = [
	{
		title: 'Surfaces',
		tokens: [
			{ name: 'background', swatchClass: 'bg-background' },
			{ name: 'card', swatchClass: 'bg-card' },
			{ name: 'popover', swatchClass: 'bg-popover' },
			{ name: 'muted', swatchClass: 'bg-muted' },
			{ name: 'accent', swatchClass: 'bg-accent' },
			{ name: 'primary', swatchClass: 'bg-primary' },
			{ name: 'secondary', swatchClass: 'bg-secondary' },
		],
	},
	{
		title: 'Text',
		tokens: [
			{ name: 'foreground', swatchClass: 'bg-foreground' },
			{ name: 'muted-foreground', swatchClass: 'bg-muted-foreground' },
			{ name: 'primary-foreground', swatchClass: 'bg-primary-foreground' },
			{ name: 'secondary-foreground', swatchClass: 'bg-secondary-foreground' },
			{ name: 'accent-foreground', swatchClass: 'bg-accent-foreground' },
			{ name: 'card-foreground', swatchClass: 'bg-card-foreground' },
			{ name: 'popover-foreground', swatchClass: 'bg-popover-foreground' },
		],
	},
	{
		title: 'Status',
		tokens: [
			{ name: 'destructive', swatchClass: 'bg-destructive' },
			{ name: 'destructive-foreground', swatchClass: 'bg-destructive-foreground' },
			{ name: 'confirm', swatchClass: 'bg-confirm' },
			{ name: 'confirm-foreground', swatchClass: 'bg-confirm-foreground' },
			{ name: 'warning', swatchClass: 'bg-warning' },
			{ name: 'warning-foreground', swatchClass: 'bg-warning-foreground' },
		],
	},
	{
		title: 'Lines',
		tokens: [
			{ name: 'border', swatchClass: 'bg-border' },
			{ name: 'input', swatchClass: 'bg-input' },
			{ name: 'ring', swatchClass: 'bg-ring' },
		],
	},
	{
		title: 'Other',
		tokens: [
			{ name: 'highlight', swatchClass: 'bg-highlight' },
			{ name: 'banner-blue', swatchClass: 'bg-banner-blue' },
			{ name: 'white', swatchClass: 'bg-white' },
			{ name: 'black', swatchClass: 'bg-black' },
		],
	},
];

const ColorSwatch = ({ name, swatchClass }: ColorToken) => {
	const [ref, style] = useComputedStyle();

	return (
		<div className="flex items-center gap-3">
			<div ref={ref} className={`border-border size-12 shrink-0 rounded-lg border ${swatchClass}`} />
			<div className="flex min-w-0 flex-col gap-1">
				<Code>{name}</Code>
				<span className="text-muted-foreground font-mono text-xs">{style ? toHex(style.backgroundColor) : ''}</span>
			</div>
		</div>
	);
};

const chartTokens = ['--chart-1', '--chart-2', '--chart-3', '--chart-4', '--chart-5'];

const gradients = [
	{ name: 'bg-donation-modal-gradient', previewClass: 'bg-donation-modal-gradient' },
	{
		name: '--gradient-button-from/-to',
		previewClass: 'bg-linear-to-r from-[hsl(var(--gradient-button-from))] to-[hsl(var(--gradient-button-to))]',
	},
	{
		name: '--gradient-card-from/-to',
		previewClass: 'bg-linear-to-r from-[hsl(var(--gradient-card-from))] to-[hsl(var(--gradient-card-to))]',
	},
];

const ColorsOverview = () => (
	<FoundationPage
		title="Colors"
		description={
			<>
				Use a token with any color utility: <Code>bg-primary</Code>, <Code>text-muted-foreground</Code>,{' '}
				<Code>border-border</Code>, also with opacity (<Code>bg-black/60</Code>). Tailwind&apos;s default palette is not
				available.
			</>
		}
	>
		{colorGroups.map((group) => (
			<FoundationSection key={group.title} title={group.title}>
				<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
					{group.tokens.map((token) => (
						<ColorSwatch key={token.name} {...token} />
					))}
				</div>
			</FoundationSection>
		))}

		<FoundationSection title="Charts">
			<div className="flex flex-wrap gap-4">
				{chartTokens.map((token) => (
					<div key={token} className="flex flex-col gap-1">
						<div className="size-12 rounded-lg" style={{ background: `hsl(var(${token}))` }} />
						<Code>{token}</Code>
					</div>
				))}
			</div>
		</FoundationSection>

		<FoundationSection title="Gradients">
			<div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
				{gradients.map((gradient) => (
					<div key={gradient.name} className="flex flex-col gap-2">
						<div className={`h-16 rounded-lg ${gradient.previewClass}`} />
						<Code>{gradient.name}</Code>
					</div>
				))}
			</div>
		</FoundationSection>
	</FoundationPage>
);

export const Overview: Story = {
	render: () => <ColorsOverview />,
};
