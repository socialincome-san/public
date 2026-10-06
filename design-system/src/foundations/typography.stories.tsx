import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { type HeadingSize } from '../components/layout/section-heading/heading-styles';
import { SectionHeading } from '../components/layout/section-heading/section-heading';
import { FoundationPage, FoundationSection, TokenName } from './foundation-layout';
import { useComputedStyle } from './measure';

const meta = {
	title: 'Foundations/Typography',
	parameters: { layout: 'padded' },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

type TypeStep = {
	name: string;
	// Literal class names so Tailwind generates them
	sizeClass: string;
	usage: string;
};

const typeScale: TypeStep[] = [
	{ name: 'text-2xs', sizeClass: 'text-2xs', usage: 'Tiny labels: small badges, field captions' },
	{ name: 'text-xs', sizeClass: 'text-xs', usage: 'Badges, captions, table meta' },
	{ name: 'text-sm', sizeClass: 'text-sm', usage: 'Controls, labels, dense UI' },
	{ name: 'text-base', sizeClass: 'text-base', usage: 'Body text' },
	{ name: 'text-lg', sizeClass: 'text-lg', usage: 'Lead text, CMS body' },
	{ name: 'text-xl', sizeClass: 'text-xl', usage: 'Dialog titles, small headings' },
	{ name: 'text-2xl', sizeClass: 'text-2xl', usage: 'Headings' },
	{ name: 'text-3xl', sizeClass: 'text-3xl', usage: 'Headings' },
	{ name: 'text-4xl', sizeClass: 'text-4xl', usage: 'Section headings' },
	{ name: 'text-5xl', sizeClass: 'text-5xl', usage: 'Page titles' },
	{ name: 'text-6xl', sizeClass: 'text-6xl', usage: 'Page titles (desktop)' },
	{ name: 'text-7xl', sizeClass: 'text-7xl', usage: 'Key figures (mobile)' },
	{ name: 'text-8xl', sizeClass: 'text-8xl', usage: 'Key figures (tablet)' },
	{ name: 'text-display', sizeClass: 'text-display', usage: 'Key figures, e.g. reserves total' },
	{ name: 'text-display-lg', sizeClass: 'text-display-lg', usage: 'Hero figure, e.g. donations total' },
];

const TypeStepRow = ({ name, sizeClass, usage }: TypeStep) => {
	const [ref, style] = useComputedStyle();

	return (
		<div className="border-border grid grid-cols-[8rem_1fr] items-baseline gap-4 border-b py-3 last:border-b-0 sm:grid-cols-[8rem_10rem_1fr]">
			<div className="flex flex-col gap-0.5">
				<TokenName>{name}</TokenName>
				<span className="text-muted-foreground font-mono text-xs">
					{style ? `${style.fontSize} / ${style.lineHeight}` : ''}
				</span>
			</div>
			<span className="text-muted-foreground hidden text-sm sm:block">{usage}</span>
			<span ref={ref} className={`truncate ${sizeClass}`}>
				Income for a better life
			</span>
		</div>
	);
};

const headingSizes: HeadingSize[] = [1, 2, 3, 4, 5, 6];

const weights = [
	{ name: 'font-normal', weightClass: 'font-normal', usage: 'Body text' },
	{ name: 'font-medium', weightClass: 'font-medium', usage: 'Headings, labels, buttons' },
	{ name: 'font-bold', weightClass: 'font-bold', usage: 'Emphasis, bold headings' },
];

const TypographyOverview = () => (
	<FoundationPage
		title="Typography"
		intro={
			<>
				<p>
					All text uses <TokenName>Unica77</TokenName> with the <TokenName>ss04</TokenName> stylistic set, loaded from{' '}
					<TokenName>src/styles/fonts.css</TokenName>. Sizes come from the Tailwind scale below; headings use{' '}
					<TokenName>SectionHeading</TokenName> (or <TokenName>headingStyles</TokenName> for CMS headings) so they scale down
					on small screens.
				</p>
				<p>
					Arbitrary sizes such as <TokenName>text-[10px]</TokenName> are not allowed; relative sizes like{' '}
					<TokenName>text-[0.45em]</TokenName> are. If a size is missing, add it to the scale. The{' '}
					<TokenName>no-arbitrary-design-values</TokenName> lint rule enforces this in both packages.
				</p>
			</>
		}
	>
		<FoundationSection title="Typeface">
			<div className="border-border flex flex-col gap-2 rounded-xl border p-6">
				<span className="text-5xl">Aa Bb Cc 0123</span>
				<span className="text-muted-foreground text-sm">
					abcdefghijklmnopqrstuvwxyz · ABCDEFGHIJKLMNOPQRSTUVWXYZ · 0123456789 · CHF 1&apos;250.–
				</span>
			</div>
		</FoundationSection>

		<FoundationSection title="Scale" description="Rendered size and line height as resolved by the browser.">
			<div className="flex flex-col">
				{typeScale.map((step) => (
					<TypeStepRow key={step.name} {...step} />
				))}
			</div>
		</FoundationSection>

		<FoundationSection
			title="Headings"
			description="SectionHeading sizes. Each steps down one size below the md breakpoint; resize the canvas to see it."
		>
			<div className="flex flex-col gap-6">
				{headingSizes.map((size) => (
					<div key={size} className="flex flex-col gap-1">
						<TokenName>{`size={${size}}`}</TokenName>
						<SectionHeading size={size} align="left">
							Where the money goes
						</SectionHeading>
					</div>
				))}
			</div>
		</FoundationSection>

		<FoundationSection
			title="Long-form text"
			description="CMS and journal text uses the prose class. Its colors come from the tokens (see src/styles/utilities.css)."
		>
			<div className="prose max-w-2xl">
				<h3>Why cash?</h3>
				<p>
					Direct cash transfers let people decide what they need most. <a href="#prose">Read the research</a> or see the{' '}
					<strong>numbers</strong>.
				</p>
				<blockquote>Every month, the money arrives on my phone.</blockquote>
				<ul>
					<li>Paid out monthly</li>
					<li>For three years</li>
				</ul>
			</div>
		</FoundationSection>

		<FoundationSection title="Weights">
			<div className="flex flex-col gap-3">
				{weights.map((weight) => (
					<div key={weight.name} className="flex items-baseline gap-4">
						<span className="w-32 shrink-0">
							<TokenName>{weight.name}</TokenName>
						</span>
						<span className={`text-2xl ${weight.weightClass}`}>Unconditional basic income</span>
						<span className="text-muted-foreground hidden text-sm sm:inline">{weight.usage}</span>
					</div>
				))}
			</div>
		</FoundationSection>
	</FoundationPage>
);

export const Overview: Story = {
	render: () => <TypographyOverview />,
};
