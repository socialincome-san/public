import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { FoundationPage, FoundationSection, TokenName } from './foundation-layout';
import { useComputedStyle } from './measure';

const meta = {
	title: 'Foundations/Radius',
	parameters: { layout: 'padded' },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

type RadiusStep = {
	name: string;
	// Literal class names so Tailwind generates them
	radiusClass: string;
	usage: string;
};

const radii: RadiusStep[] = [
	{ name: 'rounded-sm', radiusClass: 'rounded-sm', usage: 'Checkboxes, menu items (from --radius)' },
	{ name: 'rounded-md', radiusClass: 'rounded-md', usage: 'Popovers, menus, tooltips (from --radius)' },
	{ name: 'rounded-lg', radiusClass: 'rounded-lg', usage: 'Alerts, small surfaces (= --radius)' },
	{ name: 'rounded-xl', radiusClass: 'rounded-xl', usage: 'Selectable cards, table containers' },
	{ name: 'rounded-2xl', radiusClass: 'rounded-2xl', usage: 'Media, inner panels' },
	{ name: 'rounded-3xl', radiusClass: 'rounded-3xl', usage: 'Cards and dialogs' },
	{ name: 'rounded-4xl', radiusClass: 'rounded-4xl', usage: 'Large feature panels' },
	{ name: 'rounded-5xl', radiusClass: 'rounded-5xl', usage: 'Bottom corners of page heroes' },
	{ name: 'rounded-full', radiusClass: 'rounded-full', usage: 'Buttons, inputs, badges, avatars' },
];

// rounded-full resolves to an effectively infinite radius
const formatRadius = (radius: string) => (Number.parseFloat(radius) > 1000 ? 'fully round' : radius);

const RadiusSwatch = ({ name, radiusClass, usage }: RadiusStep) => {
	const [ref, style] = useComputedStyle();

	return (
		<div className="flex flex-col gap-2">
			<div ref={ref} className={`bg-muted border-border h-20 w-full border ${radiusClass}`} />
			<TokenName>{name}</TokenName>
			<span className="text-muted-foreground font-mono text-xs">
				{style ? formatRadius(style.borderTopLeftRadius) : null}
			</span>
			<span className="text-muted-foreground text-sm">{usage}</span>
		</div>
	);
};

const RadiusOverview = () => (
	<FoundationPage
		title="Radius"
		intro={
			<p>
				<TokenName>rounded-sm</TokenName>, <TokenName>rounded-md</TokenName> and <TokenName>rounded-lg</TokenName> derive
				from <TokenName>--radius</TokenName> in <TokenName>src/styles/tokens.css</TokenName>; the larger steps are Tailwind
				defaults used by components. Arbitrary radii (<TokenName>rounded-[32px]</TokenName>) are not allowed. The{' '}
				<TokenName>no-arbitrary-design-values</TokenName> lint rule enforces this in both packages.
			</p>
		}
	>
		<FoundationSection title="Scale">
			<div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-5">
				{radii.map((radius) => (
					<RadiusSwatch key={radius.name} {...radius} />
				))}
			</div>
		</FoundationSection>
	</FoundationPage>
);

export const Overview: Story = {
	render: () => <RadiusOverview />,
};
