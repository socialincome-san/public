import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { FoundationPage, FoundationSection, TokenRow, TokenTable } from './foundation-layout';

const meta = {
	title: 'Foundations/Shadows',
	parameters: { layout: 'padded' },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

// Literal class names, so Tailwind generates them
const scale = ['shadow-xs', 'shadow-sm', 'shadow-md', 'shadow-lg', 'shadow-xl'];

const named = [
	{ name: 'shadow-card', value: 'Cards, panels' },
	{ name: 'shadow-raised', value: 'Floating controls' },
	{ name: 'shadow-overlay', value: 'Flyouts' },
	{ name: 'shadow-dock', value: 'Bars pinned to the bottom' },
	{ name: 'shadow-backstage', value: 'Page slid aside over a backstage panel' },
];

const dropShadows = [
	{ name: 'drop-shadow-card', previewClass: 'drop-shadow-card bg-card h-12 w-32 rounded-lg', value: 'Shapes', sample: null },
	{
		name: 'drop-shadow-on-media',
		previewClass: 'drop-shadow-on-media text-2xl font-medium',
		value: 'Text on photos',
		sample: 'CHF 1’250',
	},
];

const ShadowsOverview = () => (
	<FoundationPage
		title="Shadows"
		description="Components use the scale, page sections the named shadows. Drop shadows follow the shape of the content."
	>
		<FoundationSection title="Scale">
			<TokenTable>
				{scale.map((shadow) => (
					<TokenRow key={shadow} name={shadow} previewClass={`bg-card h-12 w-32 rounded-lg ${shadow}`} />
				))}
			</TokenTable>
		</FoundationSection>

		<FoundationSection title="Named">
			<TokenTable>
				{named.map(({ name, value }) => (
					<TokenRow key={name} name={name} previewClass={`bg-card h-12 w-32 rounded-lg ${name}`} value={value} />
				))}
			</TokenTable>
		</FoundationSection>

		<FoundationSection title="Drop shadows">
			<TokenTable>
				{dropShadows.map(({ name, previewClass, value, sample }) => (
					<TokenRow key={name} name={name} previewClass={previewClass} value={value}>
						{sample}
					</TokenRow>
				))}
			</TokenTable>
		</FoundationSection>
	</FoundationPage>
);

export const Overview: Story = {
	render: () => <ShadowsOverview />,
};
