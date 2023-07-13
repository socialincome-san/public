import{j as v}from"./index-c5ffc9dc.js";import{r as g}from"./index-c013ead5.js";import{S as r,a as O}from"./Select-50c43412.js";import"./_commonjsHelpers-725317a4.js";import"./ChevronDownIcon-1b0f3aff.js";const y={component:r,argTypes:{block:{defaultValue:!1,description:"If true, the control will be rendered with 100% width",control:{type:"boolean"}},labelHidden:{defaultValue:!1,description:"If true, the label is only available to screenreaders, but visually hidden.",control:{type:"boolean"}},size:{defaultValue:"base",options:O,control:{type:"select"}}}},c=o=>{const u=(o==null?void 0:o.options)||{"option-1":{label:"Option 1",value:"option-1"},"option-2":{label:"Option 2",value:"option-2"},"option-3":{label:"Option 3",value:"option-3"}},[d,S]=g.useState("option-1"),b={label:"Select Label",selected:d,options:u,...o,onChange:m=>{S(m)}};return v(r,{...b})},t=c.bind({}),e=c.bind({});e.args={label:"Country Selector Example",options:{"option-1":{label:"Option 1",value:"option-1",image:{src:"ch.svg"}},"option-2":{label:"Option 2",value:"option-2",image:{src:"ch.svg"}},"option-3":{label:"Option 3",value:"option-3",image:{src:"ch.svg"}}}};var n,l,a;t.parameters={...t.parameters,docs:{...(n=t.parameters)==null?void 0:n.docs,source:{originalSource:`(args: Partial<SoSelectProps>) => {
  const options: SoSelectProps['options'] = args?.options || {
    'option-1': {
      label: 'Option 1',
      value: 'option-1'
    },
    'option-2': {
      label: 'Option 2',
      value: 'option-2'
    },
    'option-3': {
      label: 'Option 3',
      value: 'option-3'
    }
  };
  const [value, setValue] = useState('option-1');
  const props: SoSelectProps = {
    label: 'Select Label',
    selected: value,
    options,
    ...args,
    onChange: selectedItem => {
      setValue(selectedItem);
    }
  };
  return <SoSelect {...props} />;
}`,...(a=(l=t.parameters)==null?void 0:l.docs)==null?void 0:a.source}}};var s,p,i;e.parameters={...e.parameters,docs:{...(s=e.parameters)==null?void 0:s.docs,source:{originalSource:`(args: Partial<SoSelectProps>) => {
  const options: SoSelectProps['options'] = args?.options || {
    'option-1': {
      label: 'Option 1',
      value: 'option-1'
    },
    'option-2': {
      label: 'Option 2',
      value: 'option-2'
    },
    'option-3': {
      label: 'Option 3',
      value: 'option-3'
    }
  };
  const [value, setValue] = useState('option-1');
  const props: SoSelectProps = {
    label: 'Select Label',
    selected: value,
    options,
    ...args,
    onChange: selectedItem => {
      setValue(selectedItem);
    }
  };
  return <SoSelect {...props} />;
}`,...(i=(p=e.parameters)==null?void 0:p.docs)==null?void 0:i.source}}};const E=["Standard","WithImages"];export{t as Standard,e as WithImages,E as __namedExportsOrder,y as default};
//# sourceMappingURL=Select.stories-9e70ad8d.js.map
