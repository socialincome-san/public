import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Code, FoundationPage, FoundationSection, TokenRow, TokenTable } from './foundation-layout';

const meta = {
	title: 'Foundations/Radius',
	parameters: { layout: 'padded' },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

// Literal class names, so Tailwind generates them
const radii = [
	'rounded-xs',
	'rounded-sm',
	'rounded-md',
	'rounded-lg',
	'rounded-xl',
	'rounded-2xl',
	'rounded-3xl',
	'rounded-4xl',
	'rounded-5xl',
	'rounded-full',
	'rounded-control',
];

// rounded-full resolves to an effectively infinite radius
const formatRadius = (radius: string) => (Number.parseFloat(radius) > 1000 ? 'full' : radius);

const RadiusOverview = () => (
	<FoundationPage
		title="Radius"
		description={
			<>
				Also per side or corner, e.g. <Code>rounded-t-3xl</Code> or <Code>rounded-bl-lg</Code>.
			</>
		}
	>
		<FoundationSection title="Scale">
			<TokenTable>
				{radii.map((radius) => (
					<TokenRow
						key={radius}
						name={radius}
						previewClass={`bg-muted border-border h-14 w-32 border ${radius}`}
						property="borderTopLeftRadius"
						formatValue={formatRadius}
					/>
				))}
			</TokenTable>
		</FoundationSection>
	</FoundationPage>
);

export const Overview: Story = {
	render: () => <RadiusOverview />,
};
