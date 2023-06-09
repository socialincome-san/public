import{j as g}from"./index-bf905c9d.js";import{r as O}from"./index-ec8b93d8.js";import{S as i,a as h}from"./Select-fab1c7ad.js";import"./_commonjsHelpers-042e6b4d.js";import"./ChevronDownIcon-76fe8021.js";const y={component:i,argTypes:{block:{defaultValue:!1,description:"If true, the control will be rendered with 100% width",control:{type:"boolean"}},labelHidden:{defaultValue:!1,description:"If true, the label is only available to screenreaders, but visually hidden.",control:{type:"boolean"}},size:{defaultValue:"base",options:h,control:{type:"select"}}}},S=t=>{const n=(t==null?void 0:t.options)||[{label:"Option 1"},{label:"Option 2"},{label:"Option 3"}],[u,d]=O.useState(n[0]),b={label:"Select Label",value:u,options:n,...t,onChange:m=>{d(m)}};return g(i,{...b})},o=S.bind({}),e=S.bind({});e.args={label:"Country Selector Example",options:[{label:"Option 1",image:{src:"ch.svg"}},{label:"Option 2",image:{src:"ch.svg"}},{label:"Option 3",image:{src:"ch.svg"}}]};var s,a,l;o.parameters={...o.parameters,docs:{...(s=o.parameters)==null?void 0:s.docs,source:{originalSource:`(args: Partial<SoSelectProps>) => {
  const options: SoSelectProps['options'] = args?.options || [{
    label: 'Option 1'
  }, {
    label: 'Option 2'
  }, {
    label: 'Option 3'
  }];
  const [value, setValue] = useState(options[0]);
  const props: SoSelectProps = {
    label: 'Select Label',
    value,
    options,
    ...args,
    onChange: selectedItem => {
      setValue(selectedItem);
    }
  };
  return <SoSelect {...props} />;
}`,...(l=(a=o.parameters)==null?void 0:a.docs)==null?void 0:l.source}}};var r,p,c;e.parameters={...e.parameters,docs:{...(r=e.parameters)==null?void 0:r.docs,source:{originalSource:`(args: Partial<SoSelectProps>) => {
  const options: SoSelectProps['options'] = args?.options || [{
    label: 'Option 1'
  }, {
    label: 'Option 2'
  }, {
    label: 'Option 3'
  }];
  const [value, setValue] = useState(options[0]);
  const props: SoSelectProps = {
    label: 'Select Label',
    value,
    options,
    ...args,
    onChange: selectedItem => {
      setValue(selectedItem);
    }
  };
  return <SoSelect {...props} />;
}`,...(c=(p=e.parameters)==null?void 0:p.docs)==null?void 0:c.source}}};const E=["Standard","WithImages"];export{o as Standard,e as WithImages,E as __namedExportsOrder,y as default};
//# sourceMappingURL=Select.stories-1935ccb0.js.map
