import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { ChevronRightIcon } from 'lucide-react';
import { Button } from '../../actions/button/button';
import { SuccessBanner } from './success-banner';

const meta = {
	title: 'Feedback/SuccessBanner',
	tags: ['autodocs'],
	argTypes: {
		action: {
			control: false,
		},
	},
	component: SuccessBanner,
} satisfies Meta<typeof SuccessBanner>;

export default meta;

type Story = StoryObj<typeof meta>;
export const TitleOnly: Story = {
	args: {
		title: 'Changes saved',
	},
};
export const TitleAndDescription: Story = {
	args: {
		title: 'Changes saved',
		description: 'Your changes have been saved successfully',
	},
};

export const WithAction: Story = {
	args: {
		title: 'Changes saved',
		description: 'Recipients were successfully assigned.',
	},
	render: (args) => (
		<SuccessBanner
			{...args}
			action={
				<Button variant="outline">
					View Recipients <ChevronRightIcon className="ml-2 h-4 w-4" />
				</Button>
			}
		/>
	),
};
