import{j as u}from"./jsx-runtime.5d588d4f.js";import"./iframe.a1dd0c4a.js";var p={exports:{}};/*!
	Copyright (c) 2018 Jed Watson.
	Licensed under the MIT License (MIT), see
	http://jedwatson.github.io/classnames
*/(function(o){(function(){var l={}.hasOwnProperty;function n(){for(var e=[],a=0;a<arguments.length;a++){var t=arguments[a];if(!!t){var r=typeof t;if(r==="string"||r==="number")e.push(t);else if(Array.isArray(t)){if(t.length){var c=n.apply(null,t);c&&e.push(c)}}else if(r==="object"){if(t.toString!==Object.prototype.toString&&!t.toString.toString().includes("[native code]")){e.push(t.toString());continue}for(var d in t)l.call(t,d)&&t[d]&&e.push(d)}}}return e.join(" ")}o.exports?(n.default=n,o.exports=n):window.classNames=n})()})(p);const y=p.exports;const m=["primary","secondary","tertiary","outlined"],S=["base","xl"],i=({children:o,type:l="button",className:n="",variant:e="primary",size:a="default",href:t,...r})=>{const c=["so-c-button",`so-c-button--${e}`,`so-c-button--${a}`];return n=y(c,n),t&&{...r},u("button",{type:l,className:n,...r,children:o})};try{i.displayName="SoButton",i.__docgenInfo={description:"Primary UI component for user interaction",displayName:"SoButton",props:{variant:{defaultValue:{value:"primary"},description:"",name:"variant",required:!1,type:{name:"enum",value:[{value:'"primary"'},{value:'"secondary"'},{value:'"tertiary"'},{value:'"outlined"'}]}},size:{defaultValue:{value:"default"},description:"",name:"size",required:!1,type:{name:"string"}},href:{defaultValue:null,description:"",name:"href",required:!1,type:{name:"string"}}}},typeof STORYBOOK_REACT_CLASSES<"u"&&(STORYBOOK_REACT_CLASSES["src/Button.tsx#SoButton"]={docgenInfo:i.__docgenInfo,name:"SoButton",path:"src/Button.tsx#SoButton"})}catch{}const h={parameters:{storySource:{source:`// Button.stories.ts|tsx

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
`,locationsMap:{primary:{startLoc:{col:50,line:23},endLoc:{col:82,line:23},startBody:{col:50,line:23},endBody:{col:82,line:23}},secondary:{startLoc:{col:50,line:23},endLoc:{col:82,line:23},startBody:{col:50,line:23},endBody:{col:82,line:23}},tertiary:{startLoc:{col:50,line:23},endLoc:{col:82,line:23},startBody:{col:50,line:23},endBody:{col:82,line:23}},outlined:{startLoc:{col:50,line:23},endLoc:{col:82,line:23},startBody:{col:50,line:23},endBody:{col:82,line:23}},anchor:{startLoc:{col:50,line:23},endLoc:{col:82,line:23},startBody:{col:50,line:23},endBody:{col:82,line:23}}}}},component:i,argTypes:{variant:{options:m,control:{type:"select"}},size:{options:S,control:{type:"select"}}}},s=o=>u(i,{...o}),f=s.bind({});f.args={children:"Primary button",variant:"primary"};const B=s.bind({});B.args={children:"Secondary button",variant:"secondary"};const T=s.bind({});T.args={children:"Tertiary Button",variant:"tertiary"};const v=s.bind({});v.args={children:"Outlined button",variant:"outlined"};const b=s.bind({});b.args={children:"Secondary button",variant:"primary",href:"#"};const g=["Primary","Secondary","Tertiary","Outlined","Anchor"];export{b as Anchor,v as Outlined,f as Primary,B as Secondary,T as Tertiary,g as __namedExportsOrder,h as default};
//# sourceMappingURL=Button.stories.5d4ba618.js.map
