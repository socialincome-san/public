import { Meta, StoryFn } from '@storybook/react';
import { Typography } from './typography';
import React from 'react';

export default {
	component: Typography,
} as Meta<typeof Typography>;

const Template: StoryFn<typeof Typography> = ({ children, ...args }) => <Typography {...args}>{children}</Typography>;

export const Overview: typeof Template = Template.bind({});
Overview.args = {
	children: 'Text',
	as: 'h1',
	size: 'xl',
};
