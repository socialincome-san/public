// Button.stories.ts|tsx

import { ComponentMeta, ComponentStory } from '@storybook/react';

import { SoButton, SO_BUTTON_SIZES, SO_BUTTON_VARIANTS } from './Button';

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
} as ComponentMeta<typeof SoButton>;

const Template: ComponentStory<typeof SoButton> = (args) => <SoButton {...args} />;

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
