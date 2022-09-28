import{S as o,a as n}from"./Typography.ac2f2376.js";import{j as r}from"./jsx-runtime.76791415.js";import"./index.eb826ae0.js";import"./iframe.ad49238a.js";const c={parameters:{storySource:{source:`import { ComponentStory, ComponentMeta } from '@storybook/react';
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
//# sourceMappingURL=Typography.stories.316059e5.js.map
