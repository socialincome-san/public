import{j as e,a as o}from"./jsx-runtime-dd758c57.js";import{D as r}from"./index-6cf5406a.js";import{C as c}from"./index-9f1e100b.js";import{N as l}from"./index-9ba24228.js";import{B as y}from"./Button-dd984274.js";import"./index-5ac02154.js";import"./_commonjsHelpers-725317a4.js";import"./clsx.m-1229b3e0.js";import"./tw-merge-1166cefb.js";import"./index-82cf67a5.js";const H={title:"Actions/Dropdown",component:r,argTypes:{item:{control:!1}}},s=n=>e("div",{className:"my-32",children:o(r,{...n,children:[e(r.Toggle,{children:"Click"}),o(r.Menu,{className:"w-52",children:[e(r.Item,{children:"Item 1"}),e(r.Item,{children:"Item 2"})]})]})}),d=n=>e("div",{className:"my-32",children:o(r,{...n,children:[e(r.Toggle,{children:"Click"}),e(r.Menu,{className:"card card-compact w-64 p-2 shadow bg-primary text-primary-content m-1",children:o(c.Body,{children:[e(c.Title,{tag:"h3",children:"Card title!"}),e("p",{children:"you can use any element as a dropdown."})]})})]})}),a=({dataTheme:n,...v})=>o(l,{className:"my-32 px-2 font-sans bg-base-300 rounded-box",dataTheme:n,children:[e(l.Start,{className:"px-2 lg:flex-none",children:e("span",{className:"text-lg font-bold",children:"daisyUI"})}),o(l.End,{children:[e(y,{color:"ghost",dataTheme:n,children:"Button"}),o(r,{...v,dataTheme:n,children:[e(r.Toggle,{className:"btn btn-ghost rounded-btn",button:!1,children:"Dropdown"}),o(r.Menu,{className:"w-52 mt-4",children:[e(r.Item,{children:"Item 1"}),e(r.Item,{children:"Item 2"})]})]})]})]});a.args={end:!0};const t=n=>o("div",{className:"my-32 font-sans",children:["A normal text and a helper dropdown",o(r,{...n,children:[e(r.Toggle,{button:!1,className:"btn btn-circle btn-ghost btn-xs text-info",children:e("svg",{xmlns:"http://www.w3.org/2000/svg",fill:"none",viewBox:"0 0 24 24",className:"w-4 h-4 stroke-current",children:e("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:"2",d:"M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"})})}),e(r.Menu,{className:"card compact w-64 !p-0 shadow bg-base-100 rounded-box",children:o(c.Body,{children:[e(c.Title,{tag:"h2",children:"You needed more info?"}),e("p",{children:"Here is a description!"})]})})]})]});t.args={end:!0};var m,p,i;s.parameters={...s.parameters,docs:{...(m=s.parameters)==null?void 0:m.docs,source:{originalSource:`args => {
  return <div className="my-32">
      <Dropdown {...args}>
        <Dropdown.Toggle>Click</Dropdown.Toggle>
        <Dropdown.Menu className="w-52">
          <Dropdown.Item>Item 1</Dropdown.Item>
          <Dropdown.Item>Item 2</Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>
    </div>;
}`,...(i=(p=s.parameters)==null?void 0:p.docs)==null?void 0:i.source}}};var h,g,w;d.parameters={...d.parameters,docs:{...(h=d.parameters)==null?void 0:h.docs,source:{originalSource:`args => {
  return <div className="my-32">
      <Dropdown {...args}>
        <Dropdown.Toggle>Click</Dropdown.Toggle>
        <Dropdown.Menu className="card card-compact w-64 p-2 shadow bg-primary text-primary-content m-1">
          <Card.Body>
            <Card.Title tag={'h3'}>Card title!</Card.Title>
            <p>you can use any element as a dropdown.</p>
          </Card.Body>
        </Dropdown.Menu>
      </Dropdown>
    </div>;
}`,...(w=(g=d.parameters)==null?void 0:g.docs)==null?void 0:w.source}}};var u,b,D;a.parameters={...a.parameters,docs:{...(u=a.parameters)==null?void 0:u.docs,source:{originalSource:`({
  dataTheme,
  ...args
}) => {
  return <Navbar className="my-32 px-2 font-sans bg-base-300 rounded-box" dataTheme={dataTheme}>
      <Navbar.Start className="px-2 lg:flex-none">
        <span className="text-lg font-bold">daisyUI</span>
      </Navbar.Start>
      <Navbar.End>
        <Button color="ghost" dataTheme={dataTheme}>
          Button
        </Button>
        <Dropdown {...args} dataTheme={dataTheme}>
          <Dropdown.Toggle className="btn btn-ghost rounded-btn" button={false}>
            Dropdown
          </Dropdown.Toggle>
          <Dropdown.Menu className="w-52 mt-4">
            <Dropdown.Item>Item 1</Dropdown.Item>
            <Dropdown.Item>Item 2</Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </Navbar.End>
    </Navbar>;
}`,...(D=(b=a.parameters)==null?void 0:b.docs)==null?void 0:D.source}}};var N,x,f;t.parameters={...t.parameters,docs:{...(N=t.parameters)==null?void 0:N.docs,source:{originalSource:`args => {
  return <div className="my-32 font-sans">
      A normal text and a helper dropdown
      <Dropdown {...args}>
        <Dropdown.Toggle button={false} className="btn btn-circle btn-ghost btn-xs text-info">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="w-4 h-4 stroke-current">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
        </Dropdown.Toggle>
        <Dropdown.Menu className="card compact w-64 !p-0 shadow bg-base-100 rounded-box">
          <Card.Body>
            <Card.Title tag={'h2'}>You needed more info?</Card.Title>
            <p>Here is a description!</p>
          </Card.Body>
        </Dropdown.Menu>
      </Dropdown>
    </div>;
}`,...(f=(x=t.parameters)==null?void 0:x.docs)==null?void 0:f.source}}};const L=["Default","AsCard","InNavbar","Helper"];export{d as AsCard,s as Default,t as Helper,a as InNavbar,L as __namedExportsOrder,H as default};
//# sourceMappingURL=Dropdown.stories-8578e4b1.js.map
