import{a as n,F as y,j as e,c as f}from"./index-c5ffc9dc.js";/* empty css                */import{B as M}from"./button-22a4ae0f.js";import{r as s}from"./index-c013ead5.js";import"./Combobox-1a44624a.js";import"./dropdown-a8fa2a47.js";import"./input-c4263e3f.js";import"./Select-50c43412.js";import{T as t}from"./typography-4637c7d4.js";import{M as C}from"./chunk-PCJTTTQV-bd2e06be.js";import{u as w}from"./index-dc1d5b46.js";import"./_commonjsHelpers-725317a4.js";import"./ChevronDownIcon-1b0f3aff.js";import"./iframe-fe803845.js";import"../sb-preview/runtime.js";import"./index-5bead293.js";import"./index-d475d2ea.js";import"./index-d37d4223.js";import"./index-356e4a49.js";const u=({title:r,children:a,description:l})=>n(y,{children:[e("figure",{className:"","aria-hidden":!0,children:a}),n("div",{children:[e("h2",{className:"font-bold",children:r}),l]})]});try{u.displayName="DocTypographyItem",u.__docgenInfo={description:"An util element for visual representation of Typography elements inside Storybook",displayName:"DocTypographyItem",props:{title:{defaultValue:null,description:"",name:"title",required:!0,type:{name:"string"}},description:{defaultValue:null,description:"",name:"description",required:!0,type:{name:"string"}}}}}catch{}const h=({items:r})=>e("div",{className:"grid gap-x-8 gap-y-4 rounded border p-10 shadow-sm",children:r.map(({children:a,...l},o)=>e(u,{...l,children:a},o))});try{h.displayName="DocTypographyList",h.__docgenInfo={description:"",displayName:"DocTypographyList",props:{items:{defaultValue:null,description:"",name:"items",required:!0,type:{name:"DocTypographyItemProps[]"}}}}}catch{}function d({children:r,href:a,onClick:l}){switch(typeof r){case"string":return e("li",{children:e("a",{href:a,onClick:l,children:r})});default:return e("li",{children:r})}}try{d.displayName="CollapsibleMenuItem",d.__docgenInfo={description:"",displayName:"CollapsibleMenuItem",props:{href:{defaultValue:null,description:"",name:"href",required:!1,type:{name:"string"}},onClick:{defaultValue:null,description:"",name:"onClick",required:!1,type:{name:"() => void"}}}}}catch{}function p({children:r,...a}){return e("summary",{tabIndex:0,className:a.className,children:r})}try{p.displayName="CollapsibleMenuLabel",p.__docgenInfo={description:"",displayName:"CollapsibleMenuLabel",props:{className:{defaultValue:null,description:"",name:"className",required:!1,type:{name:"string"}}}}}catch{}function c({children:r,...a}){let l=null;const o=[];return s.Children.forEach(r,i=>{if(!s.isValidElement(i))throw new Error("Invalid child element");switch(i.type){case p:l=i;break;case d:o.push(i);break;default:throw new Error("Invalid child element")}}),e("ul",{className:f("menu menu-horizontal rounded-box",a.className),children:e("li",{children:n("details",{open:a.isOpen,children:[l,e("ul",{children:o})]})})})}c.Label=p;c.Item=d;try{c.displayName="CollapsibleMenu",c.__docgenInfo={description:"",displayName:"CollapsibleMenu",props:{isOpen:{defaultValue:null,description:"",name:"isOpen",required:!1,type:{name:"boolean"}},className:{defaultValue:null,description:"",name:"className",required:!1,type:{name:"string"}}}}}catch{}try{c.Label.displayName="CollapsibleMenu.Label",c.Label.__docgenInfo={description:"",displayName:"CollapsibleMenu.Label",props:{className:{defaultValue:null,description:"",name:"className",required:!1,type:{name:"string"}}}}}catch{}try{c.Item.displayName="CollapsibleMenu.Item",c.Item.__docgenInfo={description:"",displayName:"CollapsibleMenu.Item",props:{href:{defaultValue:null,description:"",name:"href",required:!1,type:{name:"string"}},onClick:{defaultValue:null,description:"",name:"onClick",required:!1,type:{name:"() => void"}}}}}catch{}function b({children:r,className:a}){return e("div",{className:a,children:e("div",{className:f("mx-auto max-w-7xl px-5"),children:r})})}try{b.displayName="BaseContainer",b.__docgenInfo={description:"",displayName:"BaseContainer",props:{className:{defaultValue:null,description:"",name:"className",required:!1,type:{name:"string"}}}}}catch{}function I({title:r,titleId:a,...l},o){return s.createElement("svg",Object.assign({xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 20 20",fill:"currentColor","aria-hidden":"true",ref:o,"aria-labelledby":a},l),r?s.createElement("title",{id:a},r):null,s.createElement("path",{d:"M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z"}))}const z=s.forwardRef(I),L=z,v={regular:"",wide:"w-4/6",full:"w-11/12 max-w-7xl"};function x({children:r,showCloseButton:a=!1,isOpen:l,width:o="regular"}){const i=s.useRef(null);return s.useEffect(()=>{var g;return l&&((g=i.current)==null||g.showModal()),()=>{var _;return(_=i.current)==null?void 0:_.close()}},[i,l]),e(y,{children:n("dialog",{ref:i,className:"modal",children:[n("form",{method:"dialog",className:f("modal-box w-11/12",v[o]),children:[a&&e(M,{size:"sm",variant:"ghost",shape:"circle",className:"absolute right-2 top-2",children:e(L,{className:"h-4 w-4"})}),r]}),e("form",{method:"dialog",className:"modal-backdrop",children:e("button",{children:"close"})})]})})}try{x.displayName="Modal",x.__docgenInfo={description:"",displayName:"Modal",props:{isOpen:{defaultValue:null,description:"",name:"isOpen",required:!1,type:{name:"boolean"}},showCloseButton:{defaultValue:{value:"false"},description:"",name:"showCloseButton",required:!1,type:{name:"boolean"}},width:{defaultValue:{value:"regular"},description:"",name:"width",required:!1,type:{name:"enum",value:[{value:'"regular"'},{value:'"wide"'},{value:'"full"'}]}}}}}catch{}function N(r){const a=Object.assign({h1:"h1",p:"p",a:"a",strong:"strong",code:"code"},w(),r.components);return n(y,{children:[e(C,{title:"Foundations/Typography"}),`
`,e(a.h1,{id:"typography",children:"Typography"}),`
`,n(a.p,{children:["Social Income uses the ",e(a.a,{href:"https://lineto.com/typefaces/unica77",target:"_blank",rel:"nofollow noopener noreferrer",children:"Unica77"}),`
font family. The font family is not open-source, therefore the fonts in
the source repository can only be used in the context of the Social
Income projects.`]}),`
`,n(a.p,{children:[`There is a React component to utilize the typography stack, see
`,e(a.strong,{children:"Components"})," > ",e(a.strong,{children:"Typography"}),"."]}),`
`,n(a.p,{children:[e(a.strong,{children:"Font:"})," Unica77 (",e(a.code,{children:"font-family: 'Unica77, sans-serif';"}),")"]}),`
`,n(a.p,{children:[e(a.strong,{children:"Weights:"})," 400(regular), 500(medium), 700(bold)"]}),`
`,e("div",{children:e(t,{size:"4xl",children:"Hello"})}),`
`,e(h,{items:[{size:"5xl",title:"Extra Large 5",children:e(t,{size:"5xl",children:"Extra large 5"})},{size:"4xl",title:"Extra Large 4",children:e(t,{size:"4xl",children:"4xl"})},{size:"3xl",title:"Extra Large 3",children:e(t,{size:"3xl",children:"3xl"})},{size:"2xl",title:"Extra Large 2",children:e(t,{size:"2xl",children:"2xl"})},{size:"xl",title:"Extra Large",children:e(t,{size:"xl",children:"xl"})},{size:"lg",title:"Large",children:e(t,{size:"lg",children:"lg"})},{size:"base",title:"Base",description:"Default size for body text",children:e(t,{size:"base",children:"base"})},{size:"sm",title:"Small",children:e(t,{size:"sm",children:"sm"})},{size:"xs",title:"Extra Small",children:e(t,{size:"xs",children:"xs"})}]})]})}function E(r={}){const{wrapper:a}=Object.assign({},w(),r.components);return a?e(a,{...r,children:e(N,{...r})}):N(r)}const T=()=>{throw new Error("Docs-only story")};T.parameters={docsOnly:!0};const m={title:"Foundations/Typography",tags:["stories-mdx"],includeStories:["__page"]};m.parameters=m.parameters||{};m.parameters.docs={...m.parameters.docs||{},page:E};const K=["__page"];export{K as __namedExportsOrder,T as __page,m as default};
//# sourceMappingURL=typography.stories-cf9f20cd.js.map