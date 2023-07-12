import { Meta, StoryFn } from '@storybook/react';
import { Input } from './input';

export default {
	component: Input,
} as Meta<typeof Input>;

const Template: StoryFn<typeof Input> = ({ ...args }) => <Input {...args} />;

export const Overview: typeof Template = Template.bind({});
Overview.args = {
	placeholder: 'Text',
};
