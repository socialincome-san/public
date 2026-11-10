import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Button } from '../../actions/button/button';
import { PageIntro } from './page-intro';

const meta = {
	title: 'Layout/PageIntro',
	component: PageIntro,
	tags: ['autodocs'],
	args: {
		title: 'Our programs',
		description:
			'Each program pays an unconditional basic income to people living in poverty, together with a local partner.',
	},
	parameters: {
		layout: 'padded',
		docs: {
			description: {
				component:
					'An introduction for a page or section, with an optional eyebrow. Optionally shows an illustration and actions. The landing variant sets the title in the regular weight and bolds only the words wrapped in `<strong>`. Renders nothing without content.',
			},
		},
	},
} satisfies Meta<typeof PageIntro>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const TitleOnly: Story = {
	args: { description: undefined },
};

export const Section: Story = {
	args: { variant: 'section', eyebrow: 'Country office', title: 'Liberia' },
};

export const SectionTitleOnly: Story = {
	args: { variant: 'section', title: 'Liberia', description: undefined },
};

export const SectionLongText: Story = {
	args: {
		variant: 'section',
		eyebrow: 'Our local country office team',
		title: 'Democratic Republic of the Congo',
	},
};

export const Landing: Story = {
	args: {
		variant: 'landing',
		title: (
			<>
				<strong>Donate 1 %</strong> of your income.
			</>
		),
		description:
			'Give 1 % of your income, monthly or once. 88 % of every contribution reaches people living in extreme poverty directly.',
		illustrationSrc: '/assets/storybook/illustration-bike.png',
		actions: <Button>Donate now</Button>,
	},
};
