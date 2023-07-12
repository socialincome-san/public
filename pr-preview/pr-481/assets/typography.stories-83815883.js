import{a as i,F as g,j as e,c as f}from"./index-c5ffc9dc.js";/* empty css                */import"./button-f0fea27e.js";import{r as h}from"./index-c013ead5.js";import"./Combobox-ec528457.js";import"./dropdown-f91e9bc1.js";import"./input-4c9a4f03.js";import"./Select-e34b23c9.js";import{T as t}from"./typography-a64cbe09.js";import{M as b}from"./chunk-PCJTTTQV-72aa2a8d.js";import{u as x}from"./index-dc1d5b46.js";import"./_commonjsHelpers-725317a4.js";import"./ChevronDownIcon-1b0f3aff.js";import"./iframe-dde05c13.js";import"../sb-preview/runtime.js";import"./index-5bead293.js";import"./index-d475d2ea.js";import"./index-d37d4223.js";import"./index-356e4a49.js";const m=({title:r,children:a,description:n})=>i(g,{children:[e("figure",{className:"","aria-hidden":!0,children:a}),i("div",{children:[e("h2",{className:"font-bold",children:r}),n]})]});try{m.displayName="DocTypographyItem",m.__docgenInfo={description:"An util element for visual representation of Typography elements inside Storybook",displayName:"DocTypographyItem",props:{title:{defaultValue:null,description:"",name:"title",required:!0,type:{name:"string"}},description:{defaultValue:null,description:"",name:"description",required:!0,type:{name:"string"}}}}}catch{}const u=({items:r})=>e("div",{className:"grid gap-y-4 gap-x-8 rounded shadow-sm border p-10",children:r.map(({children:a,...n},o)=>e(m,{...n,children:a},o))});try{u.displayName="DocTypographyList",u.__docgenInfo={description:"",displayName:"DocTypographyList",props:{items:{defaultValue:null,description:"",name:"items",required:!0,type:{name:"DocTypographyItemProps[]"}}}}}catch{}function c({children:r,href:a,onClick:n}){switch(typeof r){case"string":return e("li",{children:e("a",{href:a,onClick:n,children:r})});default:return e("li",{children:r})}}try{c.displayName="CollapsibleMenuItem",c.__docgenInfo={description:"",displayName:"CollapsibleMenuItem",props:{href:{defaultValue:null,description:"",name:"href",required:!1,type:{name:"string"}},onClick:{defaultValue:null,description:"",name:"onClick",required:!1,type:{name:"() => void"}}}}}catch{}function p({children:r,...a}){return e("summary",{tabIndex:0,className:a.className,children:r})}try{p.displayName="CollapsibleMenuLabel",p.__docgenInfo={description:"",displayName:"CollapsibleMenuLabel",props:{className:{defaultValue:null,description:"",name:"className",required:!1,type:{name:"string"}}}}}catch{}function l({children:r,...a}){let n=null;const o=[];return h.Children.forEach(r,s=>{if(!h.isValidElement(s))throw new Error("Invalid child element");switch(s.type){case p:n=s;break;case c:o.push(s);break;default:throw new Error("Invalid child element")}}),e("ul",{className:f("menu menu-horizontal rounded-box",a.className),children:e("li",{children:i("details",{open:a.isOpen,children:[n,e("ul",{children:o})]})})})}l.Label=p;l.Item=c;try{l.displayName="CollapsibleMenu",l.__docgenInfo={description:"",displayName:"CollapsibleMenu",props:{isOpen:{defaultValue:null,description:"",name:"isOpen",required:!1,type:{name:"boolean"}},className:{defaultValue:null,description:"",name:"className",required:!1,type:{name:"string"}}}}}catch{}try{l.Label.displayName="CollapsibleMenu.Label",l.Label.__docgenInfo={description:"",displayName:"CollapsibleMenu.Label",props:{className:{defaultValue:null,description:"",name:"className",required:!1,type:{name:"string"}}}}}catch{}try{l.Item.displayName="CollapsibleMenu.Item",l.Item.__docgenInfo={description:"",displayName:"CollapsibleMenu.Item",props:{href:{defaultValue:null,description:"",name:"href",required:!1,type:{name:"string"}},onClick:{defaultValue:null,description:"",name:"onClick",required:!1,type:{name:"() => void"}}}}}catch{}function y({children:r,className:a}){return e("div",{className:a,children:e("div",{className:f("max-w-7xl mx-auto px-5"),children:r})})}try{y.displayName="BaseContainer",y.__docgenInfo={description:"",displayName:"BaseContainer",props:{className:{defaultValue:null,description:"",name:"className",required:!1,type:{name:"string"}}}}}catch{}function _(r){const a=Object.assign({h1:"h1",p:"p",a:"a",strong:"strong",code:"code"},x(),r.components);return i(g,{children:[e(b,{title:"Foundations/Typography"}),`
`,e(a.h1,{id:"typography",children:"Typography"}),`
`,i(a.p,{children:["Social Income uses the ",e(a.a,{href:"https://lineto.com/typefaces/unica77",target:"_blank",rel:"nofollow noopener noreferrer",children:"Unica77"}),`
font family. The font family is not open-source, therefore the fonts in
the source repository can only be used in the context of the Social
Income projects.`]}),`
`,i(a.p,{children:[`There is a React component to utilize the typography stack, see
`,e(a.strong,{children:"Components"})," > ",e(a.strong,{children:"Typography"}),"."]}),`
`,i(a.p,{children:[e(a.strong,{children:"Font:"})," Unica77 (",e(a.code,{children:"font-family: 'Unica77, sans-serif';"}),")"]}),`
`,i(a.p,{children:[e(a.strong,{children:"Weights:"})," 400(regular), 500(medium), 700(bold)"]}),`
`,e("div",{children:e(t,{size:"4xl",children:"Hello"})}),`
`,e(u,{items:[{size:"5xl",title:"Extra Large 5",children:e(t,{size:"5xl",children:"Extra large 5"})},{size:"4xl",title:"Extra Large 4",children:e(t,{size:"4xl",children:"4xl"})},{size:"3xl",title:"Extra Large 3",children:e(t,{size:"3xl",children:"3xl"})},{size:"2xl",title:"Extra Large 2",children:e(t,{size:"2xl",children:"2xl"})},{size:"xl",title:"Extra Large",children:e(t,{size:"xl",children:"xl"})},{size:"lg",title:"Large",children:e(t,{size:"lg",children:"lg"})},{size:"base",title:"Base",description:"Default size for body text",children:e(t,{size:"base",children:"base"})},{size:"sm",title:"Small",children:e(t,{size:"sm",children:"sm"})},{size:"xs",title:"Extra Small",children:e(t,{size:"xs",children:"xs"})}]})]})}function N(r={}){const{wrapper:a}=Object.assign({},x(),r.components);return a?e(a,{...r,children:e(_,{...r})}):_(r)}const C=()=>{throw new Error("Docs-only story")};C.parameters={docsOnly:!0};const d={title:"Foundations/Typography",tags:["stories-mdx"],includeStories:["__page"]};d.parameters=d.parameters||{};d.parameters.docs={...d.parameters.docs||{},page:N};const A=["__page"];export{A as __namedExportsOrder,C as __page,d as default};
//# sourceMappingURL=typography.stories-83815883.js.map
