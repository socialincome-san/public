import { Meta, StoryFn } from '@storybook/react';

import { SO_BUTTON_SIZES, SO_BUTTON_VARIANTS, SoButton } from './Button';

export default {
	component: SoButton,
	argTypes: {
		variant: {
			options: SO_BUTTON_VARIANTS,
			control: { type: 'select' },
		},
		size: {
			options: SO_BUTTON_SIZES,
			control: { type: 'select' },
		},
	},
} as Meta<typeof SoButton>;

const Template: StoryFn<typeof SoButton> = (args) => <SoButton {...args} />;

export const Primary = Template.bind({});
Primary.args = {
	children: 'Primary button',
	variant: 'primary',
};

export const Secondary = Template.bind({});
Secondary.args = {
	children: 'Secondary button',
	variant: 'secondary',
};

export const Tertiary = Template.bind({});
Tertiary.args = {
	children: 'Tertiary Button',
	variant: 'tertiary',
};

export const Outlined = Template.bind({});
Outlined.args = {
	children: 'Outlined button',
	variant: 'outlined',
};

export const Anchor = Template.bind({});
Anchor.args = {
	children: 'Secondary button',
	variant: 'primary',
	href: '#',
};
