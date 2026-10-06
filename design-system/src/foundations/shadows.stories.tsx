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
				Elevation uses the Tailwind shadow scale. The higher a surface floats, the larger its shadow. Arbitrary shadows (
				<TokenName>shadow-[0_4px_20px_rgba(…)]</TokenName>) are not part of the system; if none of these fit, add a named
				shadow token instead.
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
	</FoundationPage>
);

export const Overview: Story = {
	render: () => <ShadowsOverview />,
};
