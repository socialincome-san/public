import{j as O}from"./index-c5ffc9dc.js";import{r as g}from"./index-c013ead5.js";import{S as c,a as x}from"./Combobox-1a44624a.js";import"./_commonjsHelpers-725317a4.js";import"./ChevronDownIcon-1b0f3aff.js";const P={component:c,argTypes:{block:{defaultValue:!1,description:"If true, the control will be rendered with 100% width",control:{type:"boolean"}},labelHidden:{defaultValue:!1,description:"If true, the label is only available to screenreaders, but visually hidden.",control:{type:"boolean"}},size:{defaultValue:"base",options:x,control:{type:"select"}}}},b=e=>{const n=(e==null?void 0:e.options)||[{label:"Option 1"},{label:"Option 2"},{label:"Option 3"}],[m,u]=g.useState(n[0]),d={label:"Select Label",value:m,options:n,...e,onChange:S=>{u(S)}};return O(c,{...d})},t=b.bind({}),o=b.bind({});o.args={label:"Country Selector Example",options:[{label:"Option 1",image:{src:"ch.svg"}},{label:"Option 2",image:{src:"ch.svg"}},{label:"Option 3",image:{src:"ch.svg"}}]};var s,a,l;t.parameters={...t.parameters,docs:{...(s=t.parameters)==null?void 0:s.docs,source:{originalSource:`(args: Partial<SoComboboxProps>) => {
  const options: SoComboboxProps['options'] = args?.options || [{
    label: 'Option 1'
  }, {
    label: 'Option 2'
  }, {
    label: 'Option 3'
  }];
  const [value, setValue] = useState(options[0]);
  const props: SoComboboxProps = {
    label: 'Select Label',
    value,
    options,
    ...args,
    onChange: selectedItem => {
      setValue(selectedItem);
    }
  };
  return <SoCombobox {...props} />;
}`,...(l=(a=t.parameters)==null?void 0:a.docs)==null?void 0:l.source}}};var r,p,i;o.parameters={...o.parameters,docs:{...(r=o.parameters)==null?void 0:r.docs,source:{originalSource:`(args: Partial<SoComboboxProps>) => {
  const options: SoComboboxProps['options'] = args?.options || [{
    label: 'Option 1'
  }, {
    label: 'Option 2'
  }, {
    label: 'Option 3'
  }];
  const [value, setValue] = useState(options[0]);
  const props: SoComboboxProps = {
    label: 'Select Label',
    value,
    options,
    ...args,
    onChange: selectedItem => {
      setValue(selectedItem);
    }
  };
  return <SoCombobox {...props} />;
}`,...(i=(p=o.parameters)==null?void 0:p.docs)==null?void 0:i.source}}};const V=["Standard","WithImages"];export{t as Standard,o as WithImages,V as __namedExportsOrder,P as default};
//# sourceMappingURL=Combobox.stories-2319b541.js.map
