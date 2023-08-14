import{a,j as e}from"./jsx-runtime-de33e161.js";import{r as m}from"./index-37ba2b57.js";import{M as o}from"./index-85ebf563.js";import{B as i}from"./Button-fa961efe.js";import"./_commonjsHelpers-de833af9.js";import"./clsx.m-1229b3e0.js";import"./tw-merge-1166cefb.js";import"./index-5b092858.js";const T={title:"Actions/Modal/Legacy",component:o.Legacy},r=n=>{const[s,t]=m.useState(!1),l=()=>{t(!s)};return a("div",{className:"font-sans",children:[e(i,{onClick:l,children:"Open Modal"}),a(o.Legacy,{...n,open:s,children:[e(o.Header,{className:"font-bold",children:"Hello!"}),e(o.Body,{children:"This modal works with a legacy mode!"}),e(o.Actions,{children:e(i,{onClick:l,children:"Close"})})]})]})},d=n=>{const[s,t]=m.useState(!1),l=()=>{t(!s)};return a("div",{className:"font-sans",children:[e(i,{onClick:l,children:"Open Modal"}),a(o.Legacy,{...n,open:s,onClickBackdrop:l,children:[e(o.Header,{className:"font-bold",children:"Hello!"}),e(o.Body,{children:"Click outside to close"})]})]})},g=n=>{const[s,t]=m.useState(!1),l=()=>{t(!s)};return a("div",{className:"font-sans",children:[e(i,{onClick:l,children:"Open Modal"}),a(o.Legacy,{...n,open:s,children:[e(i,{size:"sm",color:"ghost",shape:"circle",className:"absolute right-2 top-2",onClick:l,children:"✕"}),e(o.Header,{className:"font-bold",children:"Hello!"}),e(o.Body,{children:"Click on X button to close"})]})]})},c=n=>{const[s,t]=m.useState(!1),l=()=>{t(!s)};return a("div",{className:"font-sans",children:[e(i,{onClick:l,children:"Open Modal"}),a(o.Legacy,{...n,open:s,children:[e(o.Header,{className:"font-bold",children:"Hello!"}),e(o.Body,{children:"This modal works with a legacy mode!"}),e(o.Actions,{children:e(i,{onClick:l,children:"Close"})})]})]})};c.args={className:"w-11/12 max-w-5xl"};var b,u,p;r.parameters={...r.parameters,docs:{...(b=r.parameters)==null?void 0:b.docs,source:{originalSource:`args => {
  const [visible, setVisible] = useState<boolean>(false);
  const toggleVisible = () => {
    setVisible(!visible);
  };
  return <div className="font-sans">
      <Button onClick={toggleVisible}>Open Modal</Button>
      <Modal.Legacy {...args} open={visible}>
        <Modal.Header className="font-bold">Hello!</Modal.Header>
        <Modal.Body>This modal works with a legacy mode!</Modal.Body>

        <Modal.Actions>
          <Button onClick={toggleVisible}>Close</Button>
        </Modal.Actions>
      </Modal.Legacy>
    </div>;
}`,...(p=(u=r.parameters)==null?void 0:u.docs)==null?void 0:p.source}}};var h,M,B;d.parameters={...d.parameters,docs:{...(h=d.parameters)==null?void 0:h.docs,source:{originalSource:`args => {
  const [visible, setVisible] = useState<boolean>(false);
  const toggleVisible = () => {
    setVisible(!visible);
  };
  return <div className="font-sans">
      <Button onClick={toggleVisible}>Open Modal</Button>
      <Modal.Legacy {...args} open={visible} onClickBackdrop={toggleVisible}>
        <Modal.Header className="font-bold">Hello!</Modal.Header>
        <Modal.Body>Click outside to close</Modal.Body>
      </Modal.Legacy>
    </div>;
}`,...(B=(M=d.parameters)==null?void 0:M.docs)==null?void 0:B.source}}};var f,y,C;g.parameters={...g.parameters,docs:{...(f=g.parameters)==null?void 0:f.docs,source:{originalSource:`args => {
  const [visible, setVisible] = useState<boolean>(false);
  const toggleVisible = () => {
    setVisible(!visible);
  };
  return <div className="font-sans">
      <Button onClick={toggleVisible}>Open Modal</Button>
      <Modal.Legacy {...args} open={visible}>
        <Button size="sm" color="ghost" shape="circle" className="absolute right-2 top-2" onClick={toggleVisible}>
          ✕
        </Button>
        <Modal.Header className="font-bold">Hello!</Modal.Header>
        <Modal.Body>Click on X button to close</Modal.Body>
      </Modal.Legacy>
    </div>;
}`,...(C=(y=g.parameters)==null?void 0:y.docs)==null?void 0:C.source}}};var k,v,V;c.parameters={...c.parameters,docs:{...(k=c.parameters)==null?void 0:k.docs,source:{originalSource:`args => {
  const [visible, setVisible] = useState<boolean>(false);
  const toggleVisible = () => {
    setVisible(!visible);
  };
  return <div className="font-sans">
      <Button onClick={toggleVisible}>Open Modal</Button>
      <Modal.Legacy {...args} open={visible}>
        <Modal.Header className="font-bold">Hello!</Modal.Header>
        <Modal.Body>This modal works with a legacy mode!</Modal.Body>
        <Modal.Actions>
          <Button onClick={toggleVisible}>Close</Button>
        </Modal.Actions>
      </Modal.Legacy>
    </div>;
}`,...(V=(v=c.parameters)==null?void 0:v.docs)==null?void 0:V.source}}};const j=["Default","ClickedOutside","CloseButton","CustomWidth"];export{d as ClickedOutside,g as CloseButton,c as CustomWidth,r as Default,j as __namedExportsOrder,T as default};
//# sourceMappingURL=ModalLegacy.stories-384e2517.js.map
