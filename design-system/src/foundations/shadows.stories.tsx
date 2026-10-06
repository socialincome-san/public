import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { FoundationPage, FoundationSection, TokenName } from './foundation-layout';
import { useComputedStyle } from './measure';

const meta = {
	title: 'Foundations/Shadows',
	parameters: { layout: 'padded' },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

type Elevation = {
	name: string;
	// Literal class names so Tailwind generates them
	shadowClass: string;
	usage: string;
};

const elevations: Elevation[] = [
	{ name: 'shadow-xs', shadowClass: 'shadow-xs', usage: 'Buttons, inputs, checkboxes' },
	{ name: 'shadow-sm', shadowClass: 'shadow-sm', usage: 'Flat cards (Card elevation="flat")' },
	{ name: 'shadow-md', shadowClass: 'shadow-md', usage: 'Popovers, menus, select lists' },
	{ name: 'shadow-lg', shadowClass: 'shadow-lg', usage: 'Raised cards (Card default), gradient dialogs' },
	{ name: 'shadow-xl', shadowClass: 'shadow-xl', usage: 'Interactive cards on hover' },
];

const namedShadows: Elevation[] = [
	{ name: 'shadow-card', shadowClass: 'shadow-card', usage: 'Soft cards and panels on light backgrounds' },
	{ name: 'shadow-raised', shadowClass: 'shadow-raised', usage: 'Floating controls such as carousel buttons' },
	{ name: 'shadow-overlay', shadowClass: 'shadow-overlay', usage: 'Large floating panels: navigation flyout, survey shell' },
];

const dropShadows = [
	{ name: 'drop-shadow-card', shadowClass: 'drop-shadow-card', usage: 'Follows the shape of the content, e.g. the wallet' },
	{ name: 'drop-shadow-on-media', shadowClass: 'drop-shadow-on-media', usage: 'Keeps text legible on photos' },
];

// Tailwind's unused shadow layers resolve to transparent
const visibleShadowLayers = (boxShadow: string) =>
	boxShadow
		.split(/,(?![^(]*\))/)
		.map((layer) => layer.trim())
		.filter((layer) => !layer.startsWith('rgba(0, 0, 0, 0)'))
		.join(', ');

const ElevationSwatch = ({ name, shadowClass, usage }: Elevation) => {
	const [ref, style] = useComputedStyle();

	return (
		<div className="flex flex-col gap-3">
			<div ref={ref} className={`bg-card h-24 rounded-2xl ${shadowClass}`} />
			<TokenName>{name}</TokenName>
			<span className="text-muted-foreground text-sm">{usage}</span>
			<span className="text-muted-foreground font-mono text-xs leading-snug break-all">
				{style ? visibleShadowLayers(style.boxShadow) : null}
			</span>
		</div>
	);
};

const ShadowsOverview = () => (
	<FoundationPage
		title="Shadows"
		intro={
			<p>
				Components use the Tailwind scale; feature sections use the named shadows. The higher a surface floats, the larger
				its shadow. Arbitrary shadows (<TokenName>shadow-[0_4px_20px_rgba(…)]</TokenName>) are not allowed; if none of these
				fit, add a named token. The <TokenName>no-arbitrary-design-values</TokenName> lint rule enforces this in both
				packages.
			</p>
		}
	>
		<FoundationSection title="Elevation">
			<div className="bg-muted grid grid-cols-1 gap-8 rounded-3xl p-8 sm:grid-cols-3 lg:grid-cols-5">
				{elevations.map((elevation) => (
					<ElevationSwatch key={elevation.name} {...elevation} />
				))}
			</div>
		</FoundationSection>

		<FoundationSection title="Named shadows" description="Defined in src/styles/theme.css.">
			<div className="bg-muted grid grid-cols-1 gap-8 rounded-3xl p-8 sm:grid-cols-3">
				{namedShadows.map((elevation) => (
					<ElevationSwatch key={elevation.name} {...elevation} />
				))}
			</div>
		</FoundationSection>

		<FoundationSection
			title="Drop shadows"
			description="A filter instead of a box shadow, so it follows transparent shapes and text."
		>
			<div className="from-primary to-muted-foreground grid grid-cols-1 gap-8 rounded-3xl bg-linear-to-br p-8 sm:grid-cols-2">
				{dropShadows.map((dropShadow) => (
					<div key={dropShadow.name} className="flex flex-col gap-2">
						<span className={`text-primary-foreground text-3xl font-medium ${dropShadow.shadowClass}`}>CHF 1&apos;250</span>
						<span className="text-primary-foreground font-mono text-xs">{dropShadow.name}</span>
						<span className="text-primary-foreground text-sm">{dropShadow.usage}</span>
					</div>
				))}
			</div>
		</FoundationSection>
	</FoundationPage>
);

export const Overview: Story = {
	render: () => <ShadowsOverview />,
};
