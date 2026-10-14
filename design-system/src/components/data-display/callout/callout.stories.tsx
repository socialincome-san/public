import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Button } from '../../actions/button/button';
import { Callout } from './callout';

const meta = {
	title: 'Data Display/Callout',
	component: Callout,
	tags: ['autodocs'],
	decorators: [
		(Story) => (
			<div className="w-96">
				<Story />
			</div>
		),
	],
	args: {
		title: 'No account yet?',
		description: 'Make a donation and we’ll create your account automatically.',
		action: (
			<Button variant="outline" size="sm">
				Donate now
			</Button>
		),
	},
	parameters: {
		docs: {
			description: {
				component: 'A quiet, static note with an optional action, e.g. to point visitors to a next step.',
			},
		},
	},
} satisfies Meta<typeof Callout>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithoutAction: Story = {
	args: { action: undefined },
};

export const TitleOnly: Story = {
	args: { description: undefined, action: undefined },
};
