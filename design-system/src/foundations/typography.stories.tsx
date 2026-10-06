import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { type HeadingSize } from '../components/layout/section-heading/heading-styles';
import { SectionHeading } from '../components/layout/section-heading/section-heading';
import { Code, FoundationPage, FoundationSection, TokenRow, TokenTable } from './foundation-layout';

const meta = {
	title: 'Foundations/Typography',
	parameters: { layout: 'padded' },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

// Literal class names, so Tailwind generates them
const sizes = [
	'text-2xs',
	'text-xs',
	'text-sm',
	'text-base',
	'text-lg',
	'text-xl',
	'text-2xl',
	'text-3xl',
	'text-4xl',
	'text-5xl',
	'text-6xl',
	'text-7xl',
	'text-8xl',
	'text-display',
	'text-display-lg',
];

const weights = ['font-normal', 'font-medium', 'font-bold'];

const headingSizes: HeadingSize[] = [1, 2, 3, 4, 5, 6];

const TypographyOverview = () => (
	<FoundationPage
		title="Typography"
		description={
			<>
				Font: Unica77 (<Code>font-sans</Code>, the default). Headings use <Code>SectionHeading</Code>, which scales down on
				small screens.
			</>
		}
	>
		<FoundationSection title="Sizes">
			<TokenTable>
				{sizes.map((size) => (
					<TokenRow key={size} name={size} previewClass={`truncate leading-tight ${size}`} property="fontSize">
						Social Income
					</TokenRow>
				))}
			</TokenTable>
		</FoundationSection>

		<FoundationSection title="Weights">
			<TokenTable>
				{weights.map((weight) => (
					<TokenRow key={weight} name={weight} previewClass={`text-xl ${weight}`}>
						Social Income
					</TokenRow>
				))}
			</TokenTable>
		</FoundationSection>

		<FoundationSection title="Headings">
			<TokenTable>
				{headingSizes.map((size) => (
					<div key={size} className="grid grid-cols-[11rem_1fr] items-center gap-4 overflow-hidden px-4 py-3">
						<span>
							<Code>{`<SectionHeading size={${size}}>`}</Code>
						</span>
						<SectionHeading size={size} align="left">
							Social Income
						</SectionHeading>
					</div>
				))}
			</TokenTable>
		</FoundationSection>

		<FoundationSection title="Long-form text">
			<TokenTable>
				<div className="grid grid-cols-[11rem_1fr] gap-4 px-4 py-3">
					<span>
						<Code>prose</Code>
					</span>
					<div className="prose">
						<h3>Why cash?</h3>
						<p>
							Direct cash transfers let people decide what they need most. <a href="#prose">Read the research</a>.
						</p>
						<blockquote>Every month, the money arrives on my phone.</blockquote>
						<ul>
							<li>Paid out monthly</li>
							<li>For three years</li>
						</ul>
					</div>
				</div>
			</TokenTable>
		</FoundationSection>
	</FoundationPage>
);

export const Overview: Story = {
	render: () => <TypographyOverview />,
};
