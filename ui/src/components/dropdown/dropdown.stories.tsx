import { Meta, StoryFn } from '@storybook/react';
import { Dropdown } from './dropdown';

export default {
	component: Dropdown,
	argTypes: {
		// size: {
		// 	options: SO_TYPOGRAPHY_SIZES,
		// 	control: { type: 'select' },
		// },
	},
} as Meta<typeof Dropdown>;

const Template: StoryFn<typeof Dropdown> = ({ children, ...args }) => <Dropdown {...args} />;

export const Overview: typeof Template = Template.bind({});

Overview.args = {};
