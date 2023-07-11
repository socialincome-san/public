import { Meta, StoryFn } from '@storybook/react';
import { Button } from './button';

export default {
	component: Button,
} as Meta<typeof Button>;

const Template: StoryFn<typeof Button> = (args) => <Button {...args} />;

export const Primary = Template.bind({});
Primary.args = {
	children: 'Primary button',
	color: 'primary',
};

export const Secondary = Template.bind({});
Secondary.args = {
	children: 'Secondary button',
	color: 'secondary',
};

export const Accent = Template.bind({});
Accent.args = {
	children: 'Accent Button',
	color: 'accent',
};
