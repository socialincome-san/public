import{c as u}from"./index.eb826ae0.js";import{j as r}from"./jsx-runtime.f65bf150.js";import"./iframe.3f014088.js";const y=["primary","secondary","tertiary","outlined"],p=["base","xl"],n=({children:t,type:c="button",className:e="",variant:l="primary",size:s="default",href:a,...i})=>{const d=["so-c-button",`so-c-button--${l}`,`so-c-button--${s}`];return e=u(d,e),a&&{...i},r("button",{type:c,className:e,...i,children:t})};try{n.displayName="SoButton",n.__docgenInfo={description:"Primary UI component for user interaction",displayName:"SoButton",props:{variant:{defaultValue:{value:"primary"},description:"",name:"variant",required:!1,type:{name:"enum",value:[{value:'"primary"'},{value:'"secondary"'},{value:'"tertiary"'},{value:'"outlined"'}]}},size:{defaultValue:{value:"default"},description:"",name:"size",required:!1,type:{name:"string"}},href:{defaultValue:null,description:"",name:"href",required:!1,type:{name:"string"}}}},typeof STORYBOOK_REACT_CLASSES<"u"&&(STORYBOOK_REACT_CLASSES["src/components/button/Button.tsx#SoButton"]={docgenInfo:n.__docgenInfo,name:"SoButton",path:"src/components/button/Button.tsx#SoButton"})}catch{}const v={parameters:{storySource:{source:`// Button.stories.ts|tsx

import React from 'react';

import { ComponentStory, ComponentMeta } from '@storybook/react';

import { SoButton, SoButtonProps, SO_BUTTON_SIZES, SO_BUTTON_VARIANTS } from './Button';

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
`,locationsMap:{primary:{startLoc:{col:50,line:23},endLoc:{col:82,line:23},startBody:{col:50,line:23},endBody:{col:82,line:23}},secondary:{startLoc:{col:50,line:23},endLoc:{col:82,line:23},startBody:{col:50,line:23},endBody:{col:82,line:23}},tertiary:{startLoc:{col:50,line:23},endLoc:{col:82,line:23},startBody:{col:50,line:23},endBody:{col:82,line:23}},outlined:{startLoc:{col:50,line:23},endLoc:{col:82,line:23},startBody:{col:50,line:23},endBody:{col:82,line:23}},anchor:{startLoc:{col:50,line:23},endLoc:{col:82,line:23},startBody:{col:50,line:23},endBody:{col:82,line:23}}}}},component:n,argTypes:{variant:{options:y,control:{type:"select"}},size:{options:p,control:{type:"select"}}}},o=t=>r(n,{...t}),m=o.bind({});m.args={children:"Primary button",variant:"primary"};const S=o.bind({});S.args={children:"Secondary button",variant:"secondary"};const B=o.bind({});B.args={children:"Tertiary Button",variant:"tertiary"};const T=o.bind({});T.args={children:"Outlined button",variant:"outlined"};const f=o.bind({});f.args={children:"Secondary button",variant:"primary",href:"#"};const g=["Primary","Secondary","Tertiary","Outlined","Anchor"];export{f as Anchor,T as Outlined,m as Primary,S as Secondary,B as Tertiary,g as __namedExportsOrder,v as default};
//# sourceMappingURL=Button.stories.cb81389b.js.map
