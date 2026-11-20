import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { LeadSection } from './lead-section';

const meta = {
	title: 'Layout/LeadSection',
	component: LeadSection,
	tags: ['autodocs'],
	parameters: {
		layout: 'padded',
		docs: {
			description: {
				component:
					'A large lead paragraph with a small label beside it (above it on small screens), e.g. the biography on a person page. The opening is set in the normal text color and the rest is muted.',
			},
		},
	},
	args: {
		label: 'About Aminata',
		children: 'Aminata leads the programs in Sierra Leone.',
		rest: (
			<>
				She joined in 2021 after years in community health and wrote{' '}
				<a href="https://www.socialincome.org/en/int/journal">how recipients are selected</a>. Today she coordinates the
				local teams and visits the communities every month. Outside of work she coaches a youth football team in Freetown.
			</>
		),
	},
} satisfies Meta<typeof LeadSection>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const ShortBio: Story = {
	args: { children: 'Founder of Social Income.', rest: undefined },
};
