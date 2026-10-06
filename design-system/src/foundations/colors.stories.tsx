import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { FoundationPage, FoundationSection, TokenName } from './foundation-layout';
import { contrastRating, contrastRatio, parseRgb, readRootToken, toHex, useComputedStyle } from './measure';

const meta = {
	title: 'Foundations/Colors',
	parameters: { layout: 'padded' },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

type ColorPair = {
	name: string;
	token: string;
	// Literal class names so Tailwind generates them
	surfaceClass: string;
	usage: string;
};

const colorPairs: ColorPair[] = [
	{
		name: 'background / foreground',
		token: '--background',
		surfaceClass: 'bg-background text-foreground',
		usage: 'Page background and body text.',
	},
	{
		name: 'primary / primary-foreground',
		token: '--primary',
		surfaceClass: 'bg-primary text-primary-foreground',
		usage: 'Brand surfaces and text on them, e.g. footer, selected states.',
	},
	{
		name: 'secondary / secondary-foreground',
		token: '--secondary',
		surfaceClass: 'bg-secondary text-secondary-foreground',
		usage: 'Secondary buttons and quiet surfaces.',
	},
	{
		name: 'muted / muted-foreground',
		token: '--muted',
		surfaceClass: 'bg-muted text-muted-foreground',
		usage: 'Subtle backgrounds; muted-foreground for helper and meta text.',
	},
	{
		name: 'accent / accent-foreground',
		token: '--accent',
		surfaceClass: 'bg-accent text-accent-foreground',
		usage: 'Hover and focus highlights in menus and lists.',
	},
	{
		name: 'card / card-foreground',
		token: '--card',
		surfaceClass: 'bg-card text-card-foreground',
		usage: 'Cards and raised surfaces.',
	},
	{
		name: 'popover / popover-foreground',
		token: '--popover',
		surfaceClass: 'bg-popover text-popover-foreground',
		usage: 'Popovers, menus and select lists.',
	},
];

// Soft variants flip the pair: *-foreground is the background and the status color is the text
const statusPairs: ColorPair[] = [
	{
		name: 'destructive (solid)',
		token: '--destructive',
		surfaceClass: 'bg-destructive text-destructive-foreground',
		usage: 'Destructive buttons, form error messages.',
	},
	{
		name: 'destructive (soft)',
		token: '--destructive-foreground',
		surfaceClass: 'bg-destructive-foreground text-destructive',
		usage: 'Error badges and inline error panels.',
	},
	{
		name: 'confirm (solid)',
		token: '--confirm',
		surfaceClass: 'bg-confirm text-confirm-foreground',
		usage: 'Confirmed buttons, status dots.',
	},
	{
		name: 'confirm (soft)',
		token: '--confirm-foreground',
		surfaceClass: 'bg-confirm-foreground text-confirm',
		usage: 'Verified badges, success banners and card footers.',
	},
	{
		name: 'warning (solid)',
		token: '--warning',
		surfaceClass: 'bg-warning text-warning-foreground',
		usage: 'Not used as a text pair: warning-foreground is a tint, not a text color.',
	},
	{
		name: 'warning (soft)',
		token: '--warning-foreground',
		surfaceClass: 'bg-warning-foreground text-foreground',
		usage: 'Warning badges (Badge variant="secondary").',
	},
];

const ColorPairCard = ({ name, token, surfaceClass, usage }: ColorPair) => {
	const [ref, style] = useComputedStyle();
	const background = style ? parseRgb(style.backgroundColor) : null;
	const foreground = style ? parseRgb(style.color) : null;
	const ratio = background && foreground ? contrastRatio(background, foreground) : null;

	return (
		<div className="border-border flex flex-col overflow-hidden rounded-xl border">
			<div ref={ref} className={`flex h-24 items-end justify-between p-4 ${surfaceClass}`}>
				<span className="text-lg font-medium">Aa</span>
				{ratio ? (
					<span className="text-sm">
						{ratio.toFixed(2)}:1 · {contrastRating(ratio)}
					</span>
				) : null}
			</div>
			<div className="flex flex-col gap-1 p-4 text-sm">
				<span className="font-medium">{name}</span>
				<span className="text-muted-foreground">{usage}</span>
				<span className="text-muted-foreground font-mono text-xs">
					{token}: hsl({readRootToken(token)}){background ? ` · ${toHex(background)}` : ''}
				</span>
			</div>
		</div>
	);
};

type SingleColor = {
	name: string;
	token: string;
	swatchClass: string;
	usage: string;
};

const singleColors: SingleColor[] = [
	{ name: 'border', token: '--border', swatchClass: 'bg-border', usage: 'Dividers and container borders.' },
	{ name: 'input', token: '--input', swatchClass: 'bg-input', usage: 'Form control borders, active filters.' },
	{ name: 'ring', token: '--ring', swatchClass: 'bg-ring', usage: 'Focus rings.' },
	{ name: 'banner-blue', token: '--banner-blue', swatchClass: 'bg-banner-blue', usage: 'Journal banner sections.' },
	{
		name: 'highlight',
		token: '--highlight',
		swatchClass: 'bg-highlight',
		usage: 'Warm callouts, e.g. the cover-costs prompt.',
	},
];

const SingleColorSwatch = ({ name, token, swatchClass, usage }: SingleColor) => {
	const [ref, style] = useComputedStyle();
	const rgb = style ? parseRgb(style.backgroundColor) : null;

	return (
		<div className="flex items-center gap-4">
			<div ref={ref} className={`border-border size-14 shrink-0 rounded-lg border ${swatchClass}`} />
			<div className="flex flex-col gap-0.5 text-sm">
				<span className="font-medium">{name}</span>
				<span className="text-muted-foreground">{usage}</span>
				<span className="text-muted-foreground font-mono text-xs">
					{token}: hsl({readRootToken(token)}){rgb ? ` · ${toHex(rgb)}` : ''}
				</span>
			</div>
		</div>
	);
};

const chartTokens = ['--chart-1', '--chart-2', '--chart-3', '--chart-4', '--chart-5'];

type Gradient = {
	name: string;
	tokens: string;
	usage: string;
	background: string;
};

const gradients: Gradient[] = [
	{
		name: 'Button gradient',
		tokens: '--gradient-button-from → --gradient-button-to',
		usage: 'Default button background.',
		background: 'linear-gradient(to right, hsl(var(--gradient-button-from)), hsl(var(--gradient-button-to)))',
	},
	{
		name: 'Card gradient',
		tokens: '--gradient-card-from → --gradient-card-to',
		usage: 'Wallet and local partner program rows.',
		background: 'linear-gradient(to right, hsl(var(--gradient-card-from)), hsl(var(--gradient-card-to)))',
	},
	{
		name: 'Modal gradient',
		tokens: '--gradient-background-from → --gradient-background-to',
		usage: 'Donation modal and gradient cards (bg-donation-modal-gradient, surface="gradient").',
		background: 'linear-gradient(-17deg, var(--gradient-background-from) 19%, var(--gradient-background-to) 50%), white',
	},
];

const ColorsOverview = () => (
	<FoundationPage
		title="Colors"
		intro={
			<>
				<p>
					Colors are semantic: pick a token by its role (<TokenName>muted-foreground</TokenName> for helper text), not by how
					it looks. Every surface token has a matching foreground for text on it.
				</p>
				<p>
					Values are defined as HSL channels in <TokenName>src/styles/tokens.css</TokenName> and exposed as Tailwind colors
					in <TokenName>src/styles/theme.css</TokenName>. The swatches below show the values the browser resolves and the
					WCAG contrast of each pair.
				</p>
				<p>
					Tailwind&apos;s default palette is removed from the theme, so classes like <TokenName>text-slate-600</TokenName>{' '}
					generate nothing, and arbitrary colors (<TokenName>bg-[#…]</TokenName>) are not allowed. The exceptions are{' '}
					<TokenName>white</TokenName> and <TokenName>black</TokenName> for content on photos and videos (e.g.{' '}
					<TokenName>bg-black/60</TokenName>). If a color is missing, add a token here. The{' '}
					<TokenName>no-arbitrary-design-values</TokenName> lint rule enforces this in both packages.
				</p>
			</>
		}
	>
		<FoundationSection
			title="Surfaces and text"
			description="Use the pair together: the foreground is tuned for text on its surface."
		>
			<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
				{colorPairs.map((pair) => (
					<ColorPairCard key={pair.token} {...pair} />
				))}
			</div>
		</FoundationSection>

		<FoundationSection
			title="Status"
			description="Solid fills use the *-foreground token for text; soft tints flip it and use *-foreground as the background."
		>
			<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
				{statusPairs.map((pair) => (
					<ColorPairCard key={pair.name} {...pair} />
				))}
			</div>
		</FoundationSection>

		<FoundationSection title="Lines and highlights">
			<div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
				{singleColors.map((color) => (
					<SingleColorSwatch key={color.token} {...color} />
				))}
			</div>
		</FoundationSection>

		<FoundationSection title="Charts" description="Series colors for charts, in this order.">
			<div className="flex flex-wrap gap-4">
				{chartTokens.map((token) => (
					<div key={token} className="flex flex-col items-center gap-2">
						<div className="size-14 rounded-lg" style={{ background: `hsl(var(${token}))` }} />
						<TokenName>{token}</TokenName>
					</div>
				))}
			</div>
		</FoundationSection>

		<FoundationSection title="Gradients">
			<div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
				{gradients.map((gradient) => (
					<div key={gradient.name} className="border-border flex flex-col overflow-hidden rounded-xl border">
						<div className="h-20" style={{ background: gradient.background }} />
						<div className="flex flex-col gap-1 p-4 text-sm">
							<span className="font-medium">{gradient.name}</span>
							<span className="text-muted-foreground">{gradient.usage}</span>
							<span className="text-muted-foreground font-mono text-xs">{gradient.tokens}</span>
						</div>
					</div>
				))}
			</div>
		</FoundationSection>
	</FoundationPage>
);

export const Overview: Story = {
	render: () => <ColorsOverview />,
};
