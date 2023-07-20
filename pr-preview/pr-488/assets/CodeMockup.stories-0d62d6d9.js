import{j as a,a as W}from"./jsx-runtime-dd758c57.js";import{r as $,R as C}from"./index-5ac02154.js";import{c as z}from"./clsx.m-1229b3e0.js";import{t as I}from"./tw-merge-1166cefb.js";import"./_commonjsHelpers-725317a4.js";const O=$.forwardRef(({dataPrefix:e,dataTheme:p,status:n,className:l,children:m,innerProps:M,innerRef:g,...L},f)=>{const k=I(z({"bg-info":n==="info","bg-success":n==="success","bg-warning":n==="warning","bg-error":n==="error","text-info-content":n==="info","text-success-content":n==="success","text-warning-content":n==="warning","text-error-content":n==="error"}),l),A={...L,className:k,...e!==!1&&{"data-prefix":e||">"}};return a("pre",{...A,"data-theme":p,className:k,ref:f,children:a("code",{...M,ref:g,children:m})})});O.displayName="CodeMockup.Line";try{CodeMockup.Line.displayName="CodeMockup.Line",CodeMockup.Line.__docgenInfo={description:"",displayName:"CodeMockup.Line",props:{dataTheme:{defaultValue:null,description:"",name:"dataTheme",required:!1,type:{name:"string"}},dataPrefix:{defaultValue:null,description:"",name:"dataPrefix",required:!1,type:{name:"string | boolean"}},status:{defaultValue:null,description:"",name:"status",required:!1,type:{name:"enum",value:[{value:'"info"'},{value:'"success"'},{value:'"warning"'},{value:'"error"'}]}},innerProps:{defaultValue:null,description:"",name:"innerProps",required:!1,type:{name:"HTMLAttributes<HTMLElement>"}},innerRef:{defaultValue:null,description:"",name:"innerRef",required:!1,type:{name:"Ref<HTMLElement>"}}}}}catch{}const u=$.forwardRef(({dataTheme:e,className:p,children:n,...l},m)=>{const M=I("mockup-code",p);return a("div",{"aria-label":"Code mockup",...l,"data-theme":e,className:M,ref:m,children:C.Children.map(n,(g,L)=>{const f=g;return C.cloneElement(f,{key:L})})})});u.displayName="CodeMockup";const r=Object.assign(u,{Line:O});try{u.displayName="CodeMockup",u.__docgenInfo={description:"",displayName:"CodeMockup",props:{dataTheme:{defaultValue:null,description:"",name:"dataTheme",required:!1,type:{name:"string"}}}}}catch{}const Q={title:"Mockup/CodeMockup",component:r,subcomponents:{"CodeMockup.Line":r.Line},parameters:{controls:{expanded:!0}}},o=e=>a(r,{...e,children:a(r.Line,{children:"yarn add daisyui react-daisyui"})}),i=e=>a(r,{...e,children:a(r.Line,{dataPrefix:"$",children:"yarn add daisyui react-daisyui"})}),s=e=>W(r,{...e,children:[a(r.Line,{children:"yarn add daisyui react-daisyui"}),a(r.Line,{className:"text-warning",children:"installing..."}),a(r.Line,{className:"text-success",children:"Done!"})]}),t=e=>W(r,{...e,children:[a(r.Line,{children:"yarn add daisyui react-daisyui"}),a(r.Line,{children:"installing..."}),a(r.Line,{status:"warning",children:"Error!"})]}),c=e=>a(r,{...e,children:a(r.Line,{dataPrefix:"~",children:"Magnam dolore beatae necessitatibus nemopsum itaque sit. Et porro quae qui et et dolore ratione."})}),d=e=>a(r,{...e,children:a(r.Line,{dataPrefix:!1,children:"without prefix"})});var y,h,x;o.parameters={...o.parameters,docs:{...(y=o.parameters)==null?void 0:y.docs,source:{originalSource:`args => {
  return <CodeMockup {...args}>
      <CodeMockup.Line>yarn add daisyui react-daisyui</CodeMockup.Line>
    </CodeMockup>;
}`,...(x=(h=o.parameters)==null?void 0:h.docs)==null?void 0:x.source}}};var _,w,N;i.parameters={...i.parameters,docs:{...(_=i.parameters)==null?void 0:_.docs,source:{originalSource:`args => {
  return <CodeMockup {...args}>
      <CodeMockup.Line dataPrefix="$">
        yarn add daisyui react-daisyui
      </CodeMockup.Line>
    </CodeMockup>;
}`,...(N=(w=i.parameters)==null?void 0:w.docs)==null?void 0:N.source}}};var P,b,q;s.parameters={...s.parameters,docs:{...(P=s.parameters)==null?void 0:P.docs,source:{originalSource:`args => {
  return <CodeMockup {...args}>
      <CodeMockup.Line>yarn add daisyui react-daisyui</CodeMockup.Line>
      <CodeMockup.Line className="text-warning">installing...</CodeMockup.Line>
      <CodeMockup.Line className="text-success">Done!</CodeMockup.Line>
    </CodeMockup>;
}`,...(q=(b=s.parameters)==null?void 0:b.docs)==null?void 0:q.source}}};var E,S,R;t.parameters={...t.parameters,docs:{...(E=t.parameters)==null?void 0:E.docs,source:{originalSource:`args => {
  return <CodeMockup {...args}>
      <CodeMockup.Line>yarn add daisyui react-daisyui</CodeMockup.Line>
      <CodeMockup.Line>installing...</CodeMockup.Line>
      <CodeMockup.Line status="warning">Error!</CodeMockup.Line>
    </CodeMockup>;
}`,...(R=(S=t.parameters)==null?void 0:S.docs)==null?void 0:R.source}}};var T,v,V;c.parameters={...c.parameters,docs:{...(T=c.parameters)==null?void 0:T.docs,source:{originalSource:`args => {
  return <CodeMockup {...args}>
      <CodeMockup.Line dataPrefix="~">
        Magnam dolore beatae necessitatibus nemopsum itaque sit. Et porro quae qui
        et et dolore ratione.
      </CodeMockup.Line>
    </CodeMockup>;
}`,...(V=(v=c.parameters)==null?void 0:v.docs)==null?void 0:V.source}}};var H,j,D;d.parameters={...d.parameters,docs:{...(H=d.parameters)==null?void 0:H.docs,source:{originalSource:`args => {
  return <CodeMockup {...args}>
      <CodeMockup.Line dataPrefix={false}>without prefix</CodeMockup.Line>
    </CodeMockup>;
}`,...(D=(j=d.parameters)==null?void 0:j.docs)==null?void 0:D.source}}};const U=["Default","LinePrefix","MultiLine","HighlightedLine","LongLineWithScroll","WithoutPrefix"];export{o as Default,t as HighlightedLine,i as LinePrefix,c as LongLineWithScroll,s as MultiLine,d as WithoutPrefix,U as __namedExportsOrder,Q as default};
//# sourceMappingURL=CodeMockup.stories-0d62d6d9.js.map
