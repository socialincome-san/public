import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Code, FoundationPage, FoundationSection, TokenRow, TokenTable } from './foundation-layout';

const meta = {
	title: 'Foundations/Spacing & Layout',
	parameters: { layout: 'padded' },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

const spacingSteps = [
	{ step: '1', barClass: 'w-1' },
	{ step: '2', barClass: 'w-2' },
	{ step: '3', barClass: 'w-3' },
	{ step: '4', barClass: 'w-4' },
	{ step: '6', barClass: 'w-6' },
	{ step: '8', barClass: 'w-8' },
	{ step: '10', barClass: 'w-10' },
	{ step: '12', barClass: 'w-12' },
	{ step: '16', barClass: 'w-16' },
	{ step: '24', barClass: 'w-24' },
	{ step: '32', barClass: 'w-32' },
];

const pageWidths = [
	{ name: 'max-w-content', value: '1400px' },
	{ name: 'w-site-width', value: '94vw' },
];

// Tailwind defaults, except lg and 2xl (src/styles/theme.css)
const breakpoints = [
	{ name: 'sm:', value: '640px' },
	{ name: 'md:', value: '768px' },
	{ name: 'lg:', value: '1024px' },
	{ name: 'xl:', value: '1280px' },
	{ name: '2xl:', value: '1400px' },
];

const SpacingAndLayoutOverview = () => (
	<FoundationPage
		title="Spacing & Layout"
		description={
			<>
				One step is 4px. The same steps work for <Code>p-4</Code>, <Code>m-4</Code>, <Code>gap-4</Code>, <Code>w-4</Code> and{' '}
				<Code>h-4</Code>.
			</>
		}
	>
		<FoundationSection title="Spacing">
			<TokenTable>
				{spacingSteps.map(({ step, barClass }) => (
					<TokenRow key={step} name={step} previewClass={`bg-primary h-3 rounded-sm ${barClass}`} property="width" />
				))}
			</TokenTable>
		</FoundationSection>

		<FoundationSection title="Page width">
			<p className="text-muted-foreground text-sm">
				<Code>BlockWrapper</Code> applies both and spaces page sections.
			</p>
			<TokenTable>
				{pageWidths.map(({ name, value }) => (
					<TokenRow key={name} name={name} previewClass="" value={value} />
				))}
			</TokenTable>
		</FoundationSection>

		<FoundationSection title="Breakpoints">
			<p className="text-muted-foreground text-sm">Mobile first: a prefix applies from that width up.</p>
			<TokenTable>
				{breakpoints.map(({ name, value }) => (
					<TokenRow key={name} name={name} previewClass="" value={value} />
				))}
			</TokenTable>
		</FoundationSection>
	</FoundationPage>
);

export const Overview: Story = {
	render: () => <SpacingAndLayoutOverview />,
};
