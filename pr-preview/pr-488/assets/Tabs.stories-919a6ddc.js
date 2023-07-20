import{j as e,a as u}from"./jsx-runtime-dd758c57.js";import{R as x,r as O}from"./index-5ac02154.js";import{c as k}from"./clsx.m-1229b3e0.js";import{t as F}from"./tw-merge-1166cefb.js";import"./_commonjsHelpers-725317a4.js";const A=({children:n,value:r,activeValue:s,onClick:T,size:t,variant:m,disabled:f,className:g,style:h,...V},_)=>{const v=F("tab",g,k({"tab-active":r!=null&&r===s,"tab-disabled":f,"tab-lg":t==="lg","tab-md":t==="md","tab-sm":t==="sm","tab-xs":t==="xs","tab-bordered":m==="bordered","tab-lifted":m==="lifted"}));return e("a",{role:"tab",...V,className:v,style:h,onClick:()=>T&&T(r),children:n})},G=x.forwardRef(A),J=G,K=({children:n,value:r,onChange:s,variant:T,size:t,boxed:m,dataTheme:f,className:g,...h},V)=>{const _=F("tabs",g,k({"tabs-boxed":m}));return e("div",{ref:V,role:"tablist",...h,"data-theme":f,className:_,children:n.map((v,P)=>O.cloneElement(v,{key:v.props.value,variant:T,size:t,activeValue:r,onClick:H=>{s&&s(H)}}))})},y=x.forwardRef(K),l=Object.assign(y,{Tab:J});try{y.displayName="Tabs",y.__docgenInfo={description:"",displayName:"Tabs",props:{dataTheme:{defaultValue:null,description:"",name:"dataTheme",required:!1,type:{name:"string"}},value:{defaultValue:null,description:"",name:"value",required:!1,type:{name:"T"}},onChange:{defaultValue:null,description:"",name:"onChange",required:!1,type:{name:"(value: T) => void"}},variant:{defaultValue:null,description:"",name:"variant",required:!1,type:{name:"enum",value:[{value:'"bordered"'},{value:'"lifted"'}]}},size:{defaultValue:null,description:"",name:"size",required:!1,type:{name:"enum",value:[{value:'"xs"'},{value:'"sm"'},{value:'"md"'},{value:'"lg"'}]}},boxed:{defaultValue:null,description:"",name:"boxed",required:!1,type:{name:"boolean"}},ref:{defaultValue:null,description:"",name:"ref",required:!1,type:{name:"ForwardedRef<HTMLDivElement>"}}}}}catch{}try{l.displayName="Tabs",l.__docgenInfo={description:"",displayName:"Tabs",props:{dataTheme:{defaultValue:null,description:"",name:"dataTheme",required:!1,type:{name:"string"}},value:{defaultValue:null,description:"",name:"value",required:!1,type:{name:"T"}},onChange:{defaultValue:null,description:"",name:"onChange",required:!1,type:{name:"(value: T) => void"}},variant:{defaultValue:null,description:"",name:"variant",required:!1,type:{name:"enum",value:[{value:'"bordered"'},{value:'"lifted"'}]}},size:{defaultValue:null,description:"",name:"size",required:!1,type:{name:"enum",value:[{value:'"xs"'},{value:'"sm"'},{value:'"md"'},{value:'"lg"'}]}},boxed:{defaultValue:null,description:"",name:"boxed",required:!1,type:{name:"boolean"}},ref:{defaultValue:null,description:"",name:"ref",required:!1,type:{name:"ForwardedRef<HTMLDivElement>"}}}}}catch{}const{Tab:a}=l,Z={title:"Navigation/Tabs",component:l,parameters:{controls:{exclude:["ref"]}},args:{value:1}},p=n=>{const[r,s]=x.useState(0);return u(l,{...n,value:r,onChange:s,children:[e(a,{value:0,children:"Tab 1"}),e(a,{value:1,children:"Tab 2"}),e(a,{value:2,children:"Tab 3"})]})},d=p.bind({});d.args={};const o=p.bind({});o.args={variant:"bordered"};const i=p.bind({});i.args={variant:"lifted"};const b=p.bind({});b.args={boxed:!0};const c=({size:n,...r})=>u("div",{className:"flex flex-col gap-6 items-center",children:[u(l,{...r,size:"xs",children:[e(a,{value:0,children:"Tiny"}),e(a,{value:1,children:"Tiny"}),e(a,{value:2,children:"Tiny"})]}),u(l,{...r,size:"sm",children:[e(a,{value:0,children:"Small"}),e(a,{value:1,children:"Small"}),e(a,{value:2,children:"Small"})]}),u(l,{...r,size:"md",children:[e(a,{value:0,children:"Normal"}),e(a,{value:1,children:"Normal"}),e(a,{value:2,children:"Normal"})]}),u(l,{...r,size:"lg",children:[e(a,{value:0,children:"Large"}),e(a,{value:1,children:"Large"}),e(a,{value:2,children:"Large"})]})]});c.args={variant:"lifted"};var S,N,q;d.parameters={...d.parameters,docs:{...(S=d.parameters)==null?void 0:S.docs,source:{originalSource:`args => {
  const [tabValue, setTabValue] = React.useState(0);
  return <Tabs {...args} value={tabValue} onChange={setTabValue}>
      <Tab value={0}>Tab 1</Tab>
      <Tab value={1}>Tab 2</Tab>
      <Tab value={2}>Tab 3</Tab>
    </Tabs>;
}`,...(q=(N=d.parameters)==null?void 0:N.docs)==null?void 0:q.source}}};var z,L,R;o.parameters={...o.parameters,docs:{...(z=o.parameters)==null?void 0:z.docs,source:{originalSource:`args => {
  const [tabValue, setTabValue] = React.useState(0);
  return <Tabs {...args} value={tabValue} onChange={setTabValue}>
      <Tab value={0}>Tab 1</Tab>
      <Tab value={1}>Tab 2</Tab>
      <Tab value={2}>Tab 3</Tab>
    </Tabs>;
}`,...(R=(L=o.parameters)==null?void 0:L.docs)==null?void 0:R.source}}};var C,w,E;i.parameters={...i.parameters,docs:{...(C=i.parameters)==null?void 0:C.docs,source:{originalSource:`args => {
  const [tabValue, setTabValue] = React.useState(0);
  return <Tabs {...args} value={tabValue} onChange={setTabValue}>
      <Tab value={0}>Tab 1</Tab>
      <Tab value={1}>Tab 2</Tab>
      <Tab value={2}>Tab 3</Tab>
    </Tabs>;
}`,...(E=(w=i.parameters)==null?void 0:w.docs)==null?void 0:E.source}}};var j,B,D;b.parameters={...b.parameters,docs:{...(j=b.parameters)==null?void 0:j.docs,source:{originalSource:`args => {
  const [tabValue, setTabValue] = React.useState(0);
  return <Tabs {...args} value={tabValue} onChange={setTabValue}>
      <Tab value={0}>Tab 1</Tab>
      <Tab value={1}>Tab 2</Tab>
      <Tab value={2}>Tab 3</Tab>
    </Tabs>;
}`,...(D=(B=b.parameters)==null?void 0:B.docs)==null?void 0:D.source}}};var I,M,$;c.parameters={...c.parameters,docs:{...(I=c.parameters)==null?void 0:I.docs,source:{originalSource:`({
  size,
  ...args
}) => {
  return <div className="flex flex-col gap-6 items-center">
      <Tabs {...args} size="xs">
        <Tab value={0}>Tiny</Tab>
        <Tab value={1}>Tiny</Tab>
        <Tab value={2}>Tiny</Tab>
      </Tabs>
      <Tabs {...args} size="sm">
        <Tab value={0}>Small</Tab>
        <Tab value={1}>Small</Tab>
        <Tab value={2}>Small</Tab>
      </Tabs>
      <Tabs {...args} size="md">
        <Tab value={0}>Normal</Tab>
        <Tab value={1}>Normal</Tab>
        <Tab value={2}>Normal</Tab>
      </Tabs>
      <Tabs {...args} size="lg">
        <Tab value={0}>Large</Tab>
        <Tab value={1}>Large</Tab>
        <Tab value={2}>Large</Tab>
      </Tabs>
    </div>;
}`,...($=(M=c.parameters)==null?void 0:M.docs)==null?void 0:$.source}}};const ee=["Default","Bordered","Lifted","Boxed","Sizes"];export{o as Bordered,b as Boxed,d as Default,i as Lifted,c as Sizes,ee as __namedExportsOrder,Z as default};
//# sourceMappingURL=Tabs.stories-919a6ddc.js.map
