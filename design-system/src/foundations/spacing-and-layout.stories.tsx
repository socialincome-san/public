import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { FoundationPage, FoundationSection, TokenName } from './foundation-layout';
import { useComputedStyle } from './measure';

const meta = {
	title: 'Foundations/Spacing & Layout',
	parameters: { layout: 'padded' },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

// Literal class names so Tailwind generates them
const spacingSteps = [
	{ step: '1', widthClass: 'w-1' },
	{ step: '2', widthClass: 'w-2' },
	{ step: '3', widthClass: 'w-3' },
	{ step: '4', widthClass: 'w-4' },
	{ step: '6', widthClass: 'w-6' },
	{ step: '8', widthClass: 'w-8' },
	{ step: '10', widthClass: 'w-10' },
	{ step: '12', widthClass: 'w-12' },
	{ step: '16', widthClass: 'w-16' },
	{ step: '24', widthClass: 'w-24' },
	{ step: '32', widthClass: 'w-32' },
];

const SpacingStep = ({ step, widthClass }: { step: string; widthClass: string }) => {
	const [ref, style] = useComputedStyle();

	return (
		<div className="flex items-center gap-4">
			<span className="w-10 shrink-0 text-right font-mono text-xs">{step}</span>
			<div ref={ref} className={`bg-primary h-4 rounded-sm ${widthClass}`} />
			<span className="text-muted-foreground font-mono text-xs">{style?.width}</span>
		</div>
	);
};

// Tailwind defaults, except lg and 2xl which are set in src/styles/theme.css
const breakpoints = [
	{ name: 'sm', value: '40rem (640px)', indicatorClass: 'hidden sm:inline-flex' },
	{ name: 'md', value: '48rem (768px)', indicatorClass: 'hidden md:inline-flex' },
	{ name: 'lg', value: '64rem (1024px)', indicatorClass: 'hidden lg:inline-flex' },
	{ name: 'xl', value: '80rem (1280px)', indicatorClass: 'hidden xl:inline-flex' },
	{ name: '2xl', value: '87.5rem (1400px)', indicatorClass: 'hidden 2xl:inline-flex' },
];

const SpacingAndLayoutOverview = () => (
	<FoundationPage
		title="Spacing & Layout"
		intro={
			<p>
				Spacing uses the Tailwind scale, where one step is <TokenName>0.25rem</TokenName> (4px). Prefer the steps listed
				here; components handle their own inner spacing, and the parent handles the space between components.
			</p>
		}
	>
		<FoundationSection title="Spacing scale" description="Used for padding, margin, gap, width and height.">
			<div className="flex flex-col gap-2">
				{spacingSteps.map((spacing) => (
					<SpacingStep key={spacing.step} {...spacing} />
				))}
			</div>
		</FoundationSection>

		<FoundationSection
			title="Page width"
			description="BlockWrapper applies both, plus the vertical rhythm between page sections (spacing='default' | 'compact')."
		>
			<ul className="flex flex-col gap-2 text-sm">
				<li>
					<TokenName>max-w-content</TokenName> — 1400px, the maximum width of page content.
				</li>
				<li>
					<TokenName>w-site-width</TokenName> — 94vw, the content width below the maximum.
				</li>
			</ul>
		</FoundationSection>

		<FoundationSection
			title="Breakpoints"
			description="Mobile first: unprefixed classes apply to all sizes. Highlighted breakpoints are active in this canvas."
		>
			<div className="flex flex-col gap-2">
				{breakpoints.map((breakpoint) => (
					<div key={breakpoint.name} className="flex items-center gap-4 text-sm">
						<span className="w-10 shrink-0">
							<TokenName>{breakpoint.name}</TokenName>
						</span>
						<span className="text-muted-foreground w-40">{breakpoint.value}</span>
						<span
							className={`bg-confirm-foreground text-confirm rounded-full px-2 py-0.5 text-xs ${breakpoint.indicatorClass}`}
						>
							active
						</span>
					</div>
				))}
			</div>
		</FoundationSection>
	</FoundationPage>
);

export const Overview: Story = {
	render: () => <SpacingAndLayoutOverview />,
};
