import{j as N}from"./index-bf905c9d.js";import{r as x}from"./index-ec8b93d8.js";import{S as Q}from"./TextField-406067e0.js";import"./_commonjsHelpers-042e6b4d.js";function Z({title:a,titleId:m,...g},T){return x.createElement("svg",Object.assign({xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 24 24",fill:"currentColor","aria-hidden":"true",ref:T,"aria-labelledby":m},g),a?x.createElement("title",{id:m},a):null,x.createElement("path",{fillRule:"evenodd",d:"M18.685 19.097A9.723 9.723 0 0021.75 12c0-5.385-4.365-9.75-9.75-9.75S2.25 6.615 2.25 12a9.723 9.723 0 003.065 7.097A9.716 9.716 0 0012 21.75a9.716 9.716 0 006.685-2.653zm-12.54-1.285A7.486 7.486 0 0112 15a7.486 7.486 0 015.855 2.812A8.224 8.224 0 0112 20.25a8.224 8.224 0 01-5.855-2.438zM15.75 9a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z",clipRule:"evenodd"}))}const ee=x.forwardRef(Z),ae=ee,se={component:Q},e=a=>{const[m,g]=x.useState(a.value??""),T={label:"Text Field Label",...a,value:m,onChange:Y=>g(Y.target.value)};return N(Q,{...T})},t=e.bind({});t.args={id:"standard-text-field-example",label:"Standard Text Field"};const r=e.bind({});r.args={id:"standard-text-field-example",label:"Standard Text Field",value:"Hello World"};const n=e.bind({});n.args={id:"label-hidden-text-field-example",labelHidden:!0,value:"Hello World"};const l=e.bind({});l.args={id:"optional-label-hidden-field-example",label:"Optional Label Hidden Field",optionalLabelHidden:!0};const s=e.bind({});s.args={id:"info-text-field-example",help:"Hilfestellung und Informationen"};const o=e.bind({});o.args={id:"icon-text-field-example",iconLeft:N(ae,{})};const i=e.bind({});i.args={id:"placeholder-text-field-example",label:"Field with placeholder",placeholder:"XXX-XXXX-X",help:"Format: XXX-XXXX-X"};const d=e.bind({});d.args={id:"required-text-field-example",required:!0};const p=e.bind({});p.args={id:"invalid-text-field-example",error:!0,help:"Es ist ein Fehler aufgetreten"};const u=e.bind({});u.args={id:"disabled-text-field-example",disabled:!0,value:"Text Field Value"};const c=e.bind({});c.args={id:"multiline-text-field-example",multiline:!0,block:!0};var v,S,F;t.parameters={...t.parameters,docs:{...(v=t.parameters)==null?void 0:v.docs,source:{originalSource:`(args: Partial<SoTextFieldProps> & Pick<SoTextFieldProps, 'id'>) => {
  const [value, setValue] = useState(args.value ?? '');
  const props: SoTextFieldProps = {
    label: 'Text Field Label',
    ...args,
    value,
    onChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setValue(event.target.value)
  };
  return <SoTextField {...props} />;
}`,...(F=(S=t.parameters)==null?void 0:S.docs)==null?void 0:F.source}}};var P,b,L;r.parameters={...r.parameters,docs:{...(P=r.parameters)==null?void 0:P.docs,source:{originalSource:`(args: Partial<SoTextFieldProps> & Pick<SoTextFieldProps, 'id'>) => {
  const [value, setValue] = useState(args.value ?? '');
  const props: SoTextFieldProps = {
    label: 'Text Field Label',
    ...args,
    value,
    onChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setValue(event.target.value)
  };
  return <SoTextField {...props} />;
}`,...(L=(b=r.parameters)==null?void 0:b.docs)==null?void 0:L.source}}};var h,E,H;n.parameters={...n.parameters,docs:{...(h=n.parameters)==null?void 0:h.docs,source:{originalSource:`(args: Partial<SoTextFieldProps> & Pick<SoTextFieldProps, 'id'>) => {
  const [value, setValue] = useState(args.value ?? '');
  const props: SoTextFieldProps = {
    label: 'Text Field Label',
    ...args,
    value,
    onChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setValue(event.target.value)
  };
  return <SoTextField {...props} />;
}`,...(H=(E=n.parameters)==null?void 0:E.docs)==null?void 0:H.source}}};var f,C,M;l.parameters={...l.parameters,docs:{...(f=l.parameters)==null?void 0:f.docs,source:{originalSource:`(args: Partial<SoTextFieldProps> & Pick<SoTextFieldProps, 'id'>) => {
  const [value, setValue] = useState(args.value ?? '');
  const props: SoTextFieldProps = {
    label: 'Text Field Label',
    ...args,
    value,
    onChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setValue(event.target.value)
  };
  return <SoTextField {...props} />;
}`,...(M=(C=l.parameters)==null?void 0:C.docs)==null?void 0:M.source}}};var V,I,X;s.parameters={...s.parameters,docs:{...(V=s.parameters)==null?void 0:V.docs,source:{originalSource:`(args: Partial<SoTextFieldProps> & Pick<SoTextFieldProps, 'id'>) => {
  const [value, setValue] = useState(args.value ?? '');
  const props: SoTextFieldProps = {
    label: 'Text Field Label',
    ...args,
    value,
    onChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setValue(event.target.value)
  };
  return <SoTextField {...props} />;
}`,...(X=(I=s.parameters)==null?void 0:I.docs)==null?void 0:X.source}}};var A,k,w;o.parameters={...o.parameters,docs:{...(A=o.parameters)==null?void 0:A.docs,source:{originalSource:`(args: Partial<SoTextFieldProps> & Pick<SoTextFieldProps, 'id'>) => {
  const [value, setValue] = useState(args.value ?? '');
  const props: SoTextFieldProps = {
    label: 'Text Field Label',
    ...args,
    value,
    onChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setValue(event.target.value)
  };
  return <SoTextField {...props} />;
}`,...(w=(k=o.parameters)==null?void 0:k.docs)==null?void 0:w.source}}};var R,O,q;i.parameters={...i.parameters,docs:{...(R=i.parameters)==null?void 0:R.docs,source:{originalSource:`(args: Partial<SoTextFieldProps> & Pick<SoTextFieldProps, 'id'>) => {
  const [value, setValue] = useState(args.value ?? '');
  const props: SoTextFieldProps = {
    label: 'Text Field Label',
    ...args,
    value,
    onChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setValue(event.target.value)
  };
  return <SoTextField {...props} />;
}`,...(q=(O=i.parameters)==null?void 0:O.docs)==null?void 0:q.source}}};var W,j,z;d.parameters={...d.parameters,docs:{...(W=d.parameters)==null?void 0:W.docs,source:{originalSource:`(args: Partial<SoTextFieldProps> & Pick<SoTextFieldProps, 'id'>) => {
  const [value, setValue] = useState(args.value ?? '');
  const props: SoTextFieldProps = {
    label: 'Text Field Label',
    ...args,
    value,
    onChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setValue(event.target.value)
  };
  return <SoTextField {...props} />;
}`,...(z=(j=d.parameters)==null?void 0:j.docs)==null?void 0:z.source}}};var _,D,U;p.parameters={...p.parameters,docs:{...(_=p.parameters)==null?void 0:_.docs,source:{originalSource:`(args: Partial<SoTextFieldProps> & Pick<SoTextFieldProps, 'id'>) => {
  const [value, setValue] = useState(args.value ?? '');
  const props: SoTextFieldProps = {
    label: 'Text Field Label',
    ...args,
    value,
    onChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setValue(event.target.value)
  };
  return <SoTextField {...props} />;
}`,...(U=(D=p.parameters)==null?void 0:D.docs)==null?void 0:U.source}}};var y,B,$;u.parameters={...u.parameters,docs:{...(y=u.parameters)==null?void 0:y.docs,source:{originalSource:`(args: Partial<SoTextFieldProps> & Pick<SoTextFieldProps, 'id'>) => {
  const [value, setValue] = useState(args.value ?? '');
  const props: SoTextFieldProps = {
    label: 'Text Field Label',
    ...args,
    value,
    onChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setValue(event.target.value)
  };
  return <SoTextField {...props} />;
}`,...($=(B=u.parameters)==null?void 0:B.docs)==null?void 0:$.source}}};var G,J,K;c.parameters={...c.parameters,docs:{...(G=c.parameters)==null?void 0:G.docs,source:{originalSource:`(args: Partial<SoTextFieldProps> & Pick<SoTextFieldProps, 'id'>) => {
  const [value, setValue] = useState(args.value ?? '');
  const props: SoTextFieldProps = {
    label: 'Text Field Label',
    ...args,
    value,
    onChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setValue(event.target.value)
  };
  return <SoTextField {...props} />;
}`,...(K=(J=c.parameters)==null?void 0:J.docs)==null?void 0:K.source}}};const oe=["Standard","Prefilled","LabelHidden","OptionalLabelHidden","Info","WithIcon","Placeholder","Required","Invalid","Disabled","Multiline"];export{u as Disabled,s as Info,p as Invalid,n as LabelHidden,c as Multiline,l as OptionalLabelHidden,i as Placeholder,r as Prefilled,d as Required,t as Standard,o as WithIcon,oe as __namedExportsOrder,se as default};
//# sourceMappingURL=TextField.stories-e4d98da4.js.map
