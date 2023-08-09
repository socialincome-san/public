import{j as e,a as r}from"./jsx-runtime-de33e161.js";import{r as A}from"./index-37ba2b57.js";import{c as B}from"./clsx.m-1229b3e0.js";import{t as M}from"./tw-merge-1166cefb.js";import{F as a}from"./index-9f249e55.js";import{I as o}from"./index-045c0beb.js";import{S as p}from"./index-547d9df9.js";import{B as V}from"./Button-fa961efe.js";import"./_commonjsHelpers-de833af9.js";import"./index-5b092858.js";const m=A.forwardRef(({children:t,size:u,vertical:L,dataTheme:T,className:j,..._},R)=>{const D=M("input-group",j,B({"input-group-lg":u==="lg","input-group-md":u==="md","input-group-sm":u==="sm","input-group-xs":u==="xs","input-group-vertical":L}));return e("label",{..._,"data-theme":T,className:D,ref:R,children:t})});m.displayName="InputGroup";const n=m;try{m.displayName="InputGroup",m.__docgenInfo={description:"",displayName:"InputGroup",props:{dataTheme:{defaultValue:null,description:"",name:"dataTheme",required:!1,type:{name:"string"}},size:{defaultValue:null,description:"",name:"size",required:!1,type:{name:"enum",value:[{value:'"xs"'},{value:'"sm"'},{value:'"md"'},{value:'"lg"'}]}},vertical:{defaultValue:null,description:"",name:"vertical",required:!1,type:{name:"boolean"}}}}}catch{}const J={title:"Layout/InputGroup (Deprecated)",component:n},s=t=>r(a,{children:[e(a.Label,{title:"Enter amount"}),r(n,{...t,children:[e("span",{children:"Price"}),e(o,{type:"text",placeholder:"10",bordered:!0}),e("span",{children:"USD"})]})]});s.args={};const i=t=>r(a,{children:[e(a.Label,{title:"Your Email"}),r(n,{...t,children:[e("span",{children:"Email"}),e(o,{type:"text",placeholder:"sample@email.com",bordered:!0})]})]}),l=t=>r(a,{children:[e(a.Label,{title:"Your Email"}),r(n,{...t,children:[e("span",{children:"Email"}),e(o,{type:"text",placeholder:"Email here",bordered:!0})]})]});l.args={vertical:!0};const c=t=>r("div",{className:"flex flex-col justify-center items-center",children:[e(a,{className:"my-1",children:r(n,{size:"lg",children:[e("span",{children:"LG"}),e(o,{type:"text",placeholder:"Type here",bordered:!0,size:"lg"})]})}),e(a,{className:"my-1",children:r(n,{size:"md",children:[e("span",{children:"MD"}),e(o,{type:"text",placeholder:"Type here",bordered:!0,size:"md"})]})})," ",e(a,{className:"my-1",children:r(n,{size:"sm",children:[e("span",{children:"SM"}),e(o,{type:"text",placeholder:"Type here",bordered:!0,size:"sm"})]})}),e(a,{className:"my-1",children:r(n,{size:"xs",children:[e("span",{children:"XS"}),e(o,{type:"text",placeholder:"Type here",bordered:!0,size:"xs"})]})})]}),d=t=>e(a,{children:r(n,{...t,children:[r(p,{bordered:!0,children:[e(p.Option,{value:void 0,disabled:!0,selected:!0,children:"Pick your favorite framework"}),e(p.Option,{value:"React",children:"React"}),e(p.Option,{value:"Nextjs",children:"Nextjs"}),e(p.Option,{value:"Remix",children:"Remix"}),e(p.Option,{value:"Solidjs",children:"Solidjs"})]}),e(V,{children:"Submit"})]})});var h,x,y;s.parameters={...s.parameters,docs:{...(h=s.parameters)==null?void 0:h.docs,source:{originalSource:`args => {
  return <Form>
      <Form.Label title="Enter amount"></Form.Label>

      <InputGroup {...args}>
        <span>Price</span>
        <Input type="text" placeholder="10" bordered />
        <span>USD</span>
      </InputGroup>
    </Form>;
}`,...(y=(x=s.parameters)==null?void 0:x.docs)==null?void 0:y.source}}};var I,S,g;i.parameters={...i.parameters,docs:{...(I=i.parameters)==null?void 0:I.docs,source:{originalSource:`args => {
  return <Form>
      <Form.Label title="Your Email" />

      <InputGroup {...args}>
        <span>Email</span>
        <Input type="text" placeholder="sample@email.com" bordered />
      </InputGroup>
    </Form>;
}`,...(g=(S=i.parameters)==null?void 0:S.docs)==null?void 0:g.source}}};var b,f,G;l.parameters={...l.parameters,docs:{...(b=l.parameters)==null?void 0:b.docs,source:{originalSource:`args => {
  return <Form>
      <Form.Label title="Your Email" />

      <InputGroup {...args}>
        <span>Email</span>
        <Input type="text" placeholder="Email here" bordered />
      </InputGroup>
    </Form>;
}`,...(G=(f=l.parameters)==null?void 0:f.docs)==null?void 0:G.source}}};var v,F,z;c.parameters={...c.parameters,docs:{...(v=c.parameters)==null?void 0:v.docs,source:{originalSource:`args => {
  return <div className="flex flex-col justify-center items-center">
      <Form className="my-1">
        <InputGroup size="lg">
          <span>LG</span>
          <Input type="text" placeholder="Type here" bordered size="lg" />
        </InputGroup>
      </Form>
      <Form className="my-1">
        <InputGroup size="md">
          <span>MD</span>
          <Input type="text" placeholder="Type here" bordered size="md" />
        </InputGroup>
      </Form>{' '}
      <Form className="my-1">
        <InputGroup size="sm">
          <span>SM</span>
          <Input type="text" placeholder="Type here" bordered size="sm" />
        </InputGroup>
      </Form>
      <Form className="my-1">
        <InputGroup size="xs">
          <span>XS</span>
          <Input type="text" placeholder="Type here" bordered size="xs" />
        </InputGroup>
      </Form>
    </div>;
}`,...(z=(F=c.parameters)==null?void 0:F.docs)==null?void 0:z.source}}};var N,O,E;d.parameters={...d.parameters,docs:{...(N=d.parameters)==null?void 0:N.docs,source:{originalSource:`args => {
  return <Form>
      <InputGroup {...args}>
        <Select bordered>
          <Select.Option value={undefined} disabled selected>
            Pick your favorite framework
          </Select.Option>
          <Select.Option value={'React'}>React</Select.Option>
          <Select.Option value={'Nextjs'}>Nextjs</Select.Option>
          <Select.Option value={'Remix'}>Remix</Select.Option>
          <Select.Option value={'Solidjs'}>Solidjs</Select.Option>
        </Select>
        <Button>Submit</Button>
      </InputGroup>
    </Form>;
}`,...(E=(O=d.parameters)==null?void 0:O.docs)==null?void 0:E.source}}};const K=["Default","HorizontalGroupLabelAndTextInput","VerticalGroupLabelAndTextInput","Sizes","GroupSelectAndButton"];export{s as Default,d as GroupSelectAndButton,i as HorizontalGroupLabelAndTextInput,c as Sizes,l as VerticalGroupLabelAndTextInput,K as __namedExportsOrder,J as default};
//# sourceMappingURL=InputGroup.stories-5a817196.js.map
