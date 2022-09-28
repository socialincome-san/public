import { ComponentStory, ComponentMeta } from '@storybook/react';
import { SoTypography, SO_TYPOGRAPHY_SIZES } from './Typography';

export default {
	component: SoTypography,
	argTypes: {
		size: {
			options: SO_TYPOGRAPHY_SIZES,
			control: { type: 'select' },
		},
	},
} as ComponentMeta<typeof SoTypography>;

const Template: ComponentStory<typeof SoTypography> = ({ children, ...args }) => (
	<SoTypography {...args}>{children}</SoTypography>
);

export const Overview: typeof Template = Template.bind({});
Overview.args = {
	children: 'Text',
	element: 'h1',
	size: 'xl',
};
