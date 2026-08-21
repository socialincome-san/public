import { Button } from '@/components/button/button';
import { SuccessBanner } from '@/components/success-banner/success-banner';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';

const meta = {
	title: 'Components/SuccessBanner',
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
		description: 'Your changes have been saved successfully.',
	},
	render: (args) => (
		<SuccessBanner
			{...args}
			action={
				<Button variant="confirmed" size="sm">
					View details
				</Button>
			}
		/>
	),
};
