import{S as o,a as n}from"./Typography.b4b1f686.js";import{j as r}from"./jsx-runtime.8660f128.js";import"./index.eb826ae0.js";import"./iframe.0b42a3ae.js";const c={parameters:{storySource:{source:`import { ComponentStory, ComponentMeta } from '@storybook/react';
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
`,locationsMap:{overview:{startLoc:{col:54,line:14},endLoc:{col:1,line:16},startBody:{col:54,line:14},endBody:{col:1,line:16}}}}},component:o,argTypes:{size:{options:n,control:{type:"select"}}}},p=({children:t,...e})=>r(o,{...e,children:t}),a=p.bind({});a.args={children:"Text",element:"h1",size:"xl"};const m=["Overview"];export{a as Overview,m as __namedExportsOrder,c as default};
//# sourceMappingURL=Typography.stories.558980f5.js.map
