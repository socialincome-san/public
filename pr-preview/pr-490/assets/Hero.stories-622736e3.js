import{j as e,a as t}from"./jsx-runtime-dd758c57.js";import{R as y}from"./index-5ac02154.js";import{t as N}from"./tw-merge-1166cefb.js";import{B as h}from"./Button-8646499e.js";import{C as v}from"./index-4121803c.js";import{I as H}from"./index-8d44e70e.js";import{F as d}from"./index-c322af1d.js";import{L as S}from"./index-81d2c1db.js";import"./_commonjsHelpers-725317a4.js";import"./clsx.m-1229b3e0.js";import"./index-2e6426c2.js";const g=y.forwardRef(({dataTheme:a,className:n,children:o,...s},i)=>{const l=N("hero-content",n);return e("div",{...s,"data-theme":a,className:l,ref:i,children:o})}),j=g;try{g.displayName="HeroContent",g.__docgenInfo={description:"",displayName:"HeroContent",props:{dataTheme:{defaultValue:null,description:"",name:"dataTheme",required:!1,type:{name:"string"}}}}}catch{}const x=y.forwardRef(({dataTheme:a,className:n,children:o,...s},i)=>{const l=N("hero-overlay",n);return e("div",{...s,"data-theme":a,className:l,ref:i,children:o})}),Q=x;try{x.displayName="HeroOverlay",x.__docgenInfo={description:"",displayName:"HeroOverlay",props:{dataTheme:{defaultValue:null,description:"",name:"dataTheme",required:!1,type:{name:"string"}}}}}catch{}const f=y.forwardRef(({dataTheme:a,className:n,children:o,...s},i)=>{const l=N("hero",n);return e("div",{role:"banner",...s,"data-theme":a,className:l,ref:i,children:o})}),r=Object.assign(f,{Content:j,Overlay:Q});try{f.displayName="Hero",f.__docgenInfo={description:"",displayName:"Hero",props:{dataTheme:{defaultValue:null,description:"",name:"dataTheme",required:!1,type:{name:"string"}}}}}catch{}const J={title:"Layout/Hero",component:r,args:{className:"bg-base-200 "}},c=a=>t(r,{...a,children:[e(r.Overlay,{className:"bg-opacity-60"}),e(r.Content,{className:"text-center",children:t("div",{className:"max-w-md",children:[e("h1",{className:"text-5xl font-bold",children:"Hello there"}),e("p",{className:"py-6",children:"Provident cupiditate voluptatem et in. Quaerat fugiat ut assumenda excepturi exercitationem quasi. In deleniti eaque aut repudiandae et a id nisi."}),e(h,{color:"primary",children:"Get Started"})]})})]}),u=a=>e(r,{...a,children:t(r.Content,{children:[e("img",{src:"https://daisyui.com/images/stock/photo-1635805737707-575885ab0820.jpg",className:"max-w-sm rounded-lg shadow-2xl"}),t("div",{children:[e("h1",{className:"text-5xl font-bold",children:"Box Office News!"}),e("p",{className:"py-6",children:"Provident cupiditate voluptatem et in. Quaerat fugiat ut assumenda excepturi exercitationem quasi. In deleniti eaque aut repudiandae et a id nisi."}),e(h,{color:"primary",children:"Get Started"})]})]})}),p=a=>e(r,{...a,children:t(r.Content,{className:"flex-col lg:flex-row-reverse",children:[t("div",{className:"text-center lg:text-left",children:[e("h1",{className:"text-5xl font-bold",children:"Login now!"}),e("p",{className:"py-6",children:"Provident cupiditate voluptatem et in. Quaerat fugiat ut assumenda excepturi exercitationem quasi. In deleniti eaque aut repudiandae et a id nisi."})]}),e(v,{className:"flex-shrink-0 w-full max-w-sm shadow-2xl bg-base-100",children:t(v.Body,{children:[t(d,{children:[e(d.Label,{title:"Email"}),e(H,{type:"text",placeholder:"email",className:"input-bordered"})]}),t(d,{children:[e(d.Label,{title:"Password"}),e(H,{type:"text",placeholder:"password",className:"input-bordered"}),e("label",{className:"label",children:e(S,{href:"#",className:"label-text-alt",hover:!0,children:"Forgot password?"})})]}),e(d,{className:"mt-6",children:e(h,{children:"Login"})})]})})]})}),m=a=>t(r,{style:{backgroundImage:"url(https://daisyui.com/images/stock/photo-1507358522600-9f71e620c44e.jpg)"},children:[e(r.Overlay,{...a}),e(r.Content,{className:"text-center",children:t("div",{className:"max-w-md",children:[e("h1",{className:"text-5xl font-bold",children:"Hello there"}),e("p",{className:"py-6",children:"Provident cupiditate voluptatem et in. Quaerat fugiat ut assumenda excepturi exercitationem quasi. In deleniti eaque aut repudiandae et a id nisi."}),e(h,{color:"primary",children:"Get Started"})]})})]});m.args={className:"bg-opacity-60"};c.args={};var b,w,_;c.parameters={...c.parameters,docs:{...(b=c.parameters)==null?void 0:b.docs,source:{originalSource:`args => {
  return <Hero {...args}>
      <Hero.Overlay className="bg-opacity-60" />
      <Hero.Content className="text-center">
        <div className="max-w-md">
          <h1 className="text-5xl font-bold">Hello there</h1>
          <p className="py-6">
            Provident cupiditate voluptatem et in. Quaerat fugiat ut assumenda
            excepturi exercitationem quasi. In deleniti eaque aut repudiandae et
            a id nisi.
          </p>

          <Button color="primary">Get Started</Button>
        </div>
      </Hero.Content>
    </Hero>;
}`,...(_=(w=c.parameters)==null?void 0:w.docs)==null?void 0:_.source}}};var C,q,I;u.parameters={...u.parameters,docs:{...(C=u.parameters)==null?void 0:C.docs,source:{originalSource:`args => {
  return <Hero {...args}>
      <Hero.Content>
        <img src="https://daisyui.com/images/stock/photo-1635805737707-575885ab0820.jpg" className="max-w-sm rounded-lg shadow-2xl" />
        <div>
          <h1 className="text-5xl font-bold">Box Office News!</h1>
          <p className="py-6">
            Provident cupiditate voluptatem et in. Quaerat fugiat ut assumenda
            excepturi exercitationem quasi. In deleniti eaque aut repudiandae et
            a id nisi.
          </p>
          <Button color="primary">Get Started</Button>
        </div>
      </Hero.Content>
    </Hero>;
}`,...(I=(q=u.parameters)==null?void 0:q.docs)==null?void 0:I.source}}};var F,B,O;p.parameters={...p.parameters,docs:{...(F=p.parameters)==null?void 0:F.docs,source:{originalSource:`args => {
  return <Hero {...args}>
      <Hero.Content className="flex-col lg:flex-row-reverse">
        <div className="text-center lg:text-left">
          <h1 className="text-5xl font-bold">Login now!</h1>
          <p className="py-6">
            Provident cupiditate voluptatem et in. Quaerat fugiat ut assumenda
            excepturi exercitationem quasi. In deleniti eaque aut repudiandae et
            a id nisi.
          </p>
        </div>
        <Card className="flex-shrink-0 w-full max-w-sm shadow-2xl bg-base-100">
          <Card.Body>
            <Form>
              <Form.Label title="Email" />
              <Input type="text" placeholder="email" className="input-bordered" />
            </Form>
            <Form>
              <Form.Label title="Password" />
              <Input type="text" placeholder="password" className="input-bordered" />
              <label className="label">
                <Link href="#" className="label-text-alt" hover>
                  Forgot password?
                </Link>
              </label>
            </Form>
            <Form className="mt-6">
              <Button>Login</Button>
            </Form>
          </Card.Body>
        </Card>
      </Hero.Content>
    </Hero>;
}`,...(O=(B=p.parameters)==null?void 0:B.docs)==null?void 0:O.source}}};var L,k,P;m.parameters={...m.parameters,docs:{...(L=m.parameters)==null?void 0:L.docs,source:{originalSource:`args => {
  return <Hero style={{
    backgroundImage: 'url(https://daisyui.com/images/stock/photo-1507358522600-9f71e620c44e.jpg)'
  }}>
      <Hero.Overlay {...args} />
      <Hero.Content className="text-center">
        <div className="max-w-md">
          <h1 className="text-5xl font-bold">Hello there</h1>
          <p className="py-6">
            Provident cupiditate voluptatem et in. Quaerat fugiat ut assumenda
            excepturi exercitationem quasi. In deleniti eaque aut repudiandae et
            a id nisi.
          </p>

          <Button color="primary">Get Started</Button>
        </div>
      </Hero.Content>
    </Hero>;
}`,...(P=(k=m.parameters)==null?void 0:k.docs)==null?void 0:P.source}}};const K=["Default","HeroWithFigure","HeroWithForm","HeroWithOverlayImage"];export{c as Default,u as HeroWithFigure,p as HeroWithForm,m as HeroWithOverlayImage,K as __namedExportsOrder,J as default};
//# sourceMappingURL=Hero.stories-622736e3.js.map
