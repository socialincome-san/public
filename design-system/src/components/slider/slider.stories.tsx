import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { Slider } from './slider';

const meta = {
	title: 'Components/Slider',
	component: Slider,
	tags: ['autodocs'],
	parameters: {
		design: {
			type: 'figma',
			url: 'https://www.figma.com/design/IDEMMGr7QkVOY4Ksbgbc57/Social-Income---shadcn-UI-Kit?node-id=46-67&p=f&t=uDt5Wmo7FudNnpiF-0',
		},
	},
} satisfies Meta<typeof Slider>;

export default meta;

type Story = StoryObj<typeof meta>;

const renderSlider = (args: React.ComponentProps<typeof Slider>) => (
	<div className="w-80">
		<Slider {...args} />
	</div>
);

export const SingleValue: Story = {
	args: {
		defaultValue: [50],
	},
	render: renderSlider,
};

export const Range: Story = {
	args: {
		defaultValue: [25, 75],
	},
	render: renderSlider,
};

export const Disabled: Story = {
	args: {
		defaultValue: [50],
		disabled: true,
	},
	render: renderSlider,
};

export const CustomMinMax: Story = {
	args: {
		min: 10,
		max: 50,
		step: 5,
		defaultValue: [30],
	},
	render: renderSlider,
};
