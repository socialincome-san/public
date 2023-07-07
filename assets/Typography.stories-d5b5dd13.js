import"./Button-fd1860f7.js";import{j as e,c as x,a as i,F as g}from"./index-83d39615.js";import{r as h}from"./index-5ac02154.js";import"./Combobox-2efe91b2.js";import"./dropdown-d1eff73e.js";import"./Select-31516249.js";import{S as a}from"./Typography-2bccde87.js";import{u as f}from"./index-4d21328b.js";import{M as b}from"./index-a2a559e5.js";import"./_commonjsHelpers-725317a4.js";import"./ChevronDownIcon-f0bef87d.js";import"./iframe-ce9ca624.js";import"../sb-preview/runtime.js";import"./index-d475d2ea.js";import"./index-b4c6cb00.js";import"./index-d37d4223.js";import"./index-356e4a49.js";const{deprecate:N}=__STORYBOOK_MODULE_CLIENT_LOGGER__;N("Import from '@storybook/addon-docs/blocks' is deprecated. Please import from '@storybook/blocks' instead.");function s({children:r,href:t,onClick:l}){switch(typeof r){case"string":return e("li",{children:e("a",{href:t,onClick:l,children:r})});default:return e("li",{children:r})}}try{s.displayName="CollapsibleMenuItem",s.__docgenInfo={description:"",displayName:"CollapsibleMenuItem",props:{href:{defaultValue:null,description:"",name:"href",required:!1,type:{name:"string"}},onClick:{defaultValue:null,description:"",name:"onClick",required:!1,type:{name:"() => void"}}}}}catch{}function c({children:r,...t}){return e("summary",{tabIndex:0,className:t.className,children:r})}try{c.displayName="CollapsibleMenuLabel",c.__docgenInfo={description:"",displayName:"CollapsibleMenuLabel",props:{className:{defaultValue:null,description:"",name:"className",required:!1,type:{name:"string"}}}}}catch{}function n({children:r,...t}){let l=null;const u=[];return h.Children.forEach(r,o=>{if(!h.isValidElement(o))throw new Error("Invalid child element");switch(o.type){case c:l=o;break;case s:u.push(o);break;default:throw new Error("Invalid child element")}}),e("ul",{className:x("menu menu-horizontal rounded-box",t.className),children:e("li",{children:i("details",{open:t.isOpen,children:[l,e("ul",{children:u})]})})})}n.Label=c;n.Item=s;try{n.displayName="CollapsibleMenu",n.__docgenInfo={description:"",displayName:"CollapsibleMenu",props:{isOpen:{defaultValue:null,description:"",name:"isOpen",required:!1,type:{name:"boolean"}},className:{defaultValue:null,description:"",name:"className",required:!1,type:{name:"string"}}}}}catch{}try{n.Label.displayName="CollapsibleMenu.Label",n.Label.__docgenInfo={description:"",displayName:"CollapsibleMenu.Label",props:{className:{defaultValue:null,description:"",name:"className",required:!1,type:{name:"string"}}}}}catch{}try{n.Item.displayName="CollapsibleMenu.Item",n.Item.__docgenInfo={description:"",displayName:"CollapsibleMenu.Item",props:{href:{defaultValue:null,description:"",name:"href",required:!1,type:{name:"string"}},onClick:{defaultValue:null,description:"",name:"onClick",required:!1,type:{name:"() => void"}}}}}catch{}function y({children:r,...t}){return e("div",{className:"max-w-3xl mx-auto",...t,children:r})}try{y.displayName="SoContainer",y.__docgenInfo={description:"",displayName:"SoContainer",props:{}}}catch{}const d=({title:r,children:t,description:l})=>i(g,{children:[e("figure",{className:"so-docs-typography-item__example text-right","aria-hidden":!0,children:t}),i("div",{className:"so-docs-typography-item__text",children:[e("h2",{className:"so-docs-typography-item__title font-bold",children:r}),l]})]});try{d.displayName="DocTypographyItem",d.__docgenInfo={description:"An util element for visual representation of Typography elements inside Storybook",displayName:"DocTypographyItem",props:{title:{defaultValue:null,description:"",name:"title",required:!0,type:{name:"string"}},description:{defaultValue:null,description:"",name:"description",required:!0,type:{name:"string"}}}}}catch{}const m=({items:r})=>e("div",{className:"so-docs-typography-list grid gap-y-4 gap-x-8 rounded shadow-sm border p-10",children:r.map(({children:t,...l})=>e(d,{...l,children:t}))});try{m.displayName="DocTypographyList",m.__docgenInfo={description:"",displayName:"DocTypographyList",props:{items:{defaultValue:null,description:"",name:"items",required:!0,type:{name:"DocTypographyItemProps[]"}}}}}catch{}const z=[{size:"9xl",title:"Extra Large 9",children:e(a,{size:"9xl",children:"9xl"})},{size:"8xl",title:"Extra Large 8",children:e(a,{size:"8xl",children:"8xl"})},{size:"7xl",title:"Extra Large 7",children:e(a,{size:"7xl",children:"7xl"})},{size:"6xl",title:"Extra Large 6",children:e(a,{size:"6xl",children:"6xl"})},{size:"5xl",title:"Extra Large 5",children:e(a,{size:"5xl",children:"5xl"})},{size:"4xl",title:"Extra Large 4",children:e(a,{size:"4xl",children:"4xl"})},{size:"3xl",title:"Extra Large 3",children:e(a,{size:"3xl",children:"3xl"})},{size:"2xl",title:"Extra Large 2",children:e(a,{size:"2xl",children:"2xl"})},{size:"xl",title:"Extra Large",children:e(a,{size:"xl",children:"xl"})},{size:"lg",title:"Large",children:e(a,{size:"lg",children:"lg"})},{size:"base",title:"Base",description:"Default size for body text",children:e(a,{size:"base",children:"base"})},{size:"sm",title:"Small",children:e(a,{size:"sm",children:"sm"})},{size:"xs",title:"Extra Small",children:e(a,{size:"xs",children:"xs"})}];function _(r){const t=Object.assign({h1:"h1",p:"p",a:"a",strong:"strong",code:"code"},f(),r.components);return i(g,{children:[`
`,`
`,e(b,{title:"Foundations/Typography"}),`
`,e(t.h1,{id:"typography",children:"Typography"}),`
`,i(t.p,{children:["Social Income uses the ",e(t.a,{href:"https://lineto.com/typefaces/unica77",target:"_blank",rel:"nofollow noopener noreferrer",children:"Unica77"}),`
font family. The font family is not open-source, therefore the fonts in
the source repository can only be used in the context of the Social
Income projects.`]}),`
`,i(t.p,{children:[`There is a React component to utilize the typography stack, see
`,e(t.strong,{children:"Components"})," > ",e(t.strong,{children:"Typography"}),"."]}),`
`,i(t.p,{children:[e(t.strong,{children:"Font:"})," Unica77 (",e(t.code,{children:"font-family: 'SoSans';"}),")"]}),`
`,i(t.p,{children:[e(t.strong,{children:"Weights:"})," 400(regular), 500(medium), 700(bold)"]}),`
`,`
`,e(m,{items:z})]})}function I(r={}){const{wrapper:t}=Object.assign({},f(),r.components);return t?e(t,{...r,children:e(_,{...r})}):_(r)}const C=()=>{throw new Error("Docs-only story")};C.parameters={docsOnly:!0};const p={title:"Foundations/Typography",tags:["stories-mdx"],includeStories:["__page"]};p.parameters=p.parameters||{};p.parameters.docs={...p.parameters.docs||{},page:I};const B=["typeScale","__page"];export{B as __namedExportsOrder,C as __page,p as default,z as typeScale};
//# sourceMappingURL=Typography.stories-d5b5dd13.js.map