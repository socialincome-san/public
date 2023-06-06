import"./Button-c9d58394.js";import"./Combobox-7e61ab90.js";import"./Select-fab1c7ad.js";import"./TextField-406067e0.js";import{S as r}from"./Typography-5f6bc92c.js";import{a as i,F as p,j as e}from"./index-bf905c9d.js";import{u as d}from"./index-3efccfcc.js";import{M as h}from"./index-a8e01844.js";import"./index-ec8b93d8.js";import"./_commonjsHelpers-042e6b4d.js";import"./ChevronDownIcon-76fe8021.js";import"./iframe-2b0c569c.js";import"../sb-preview/runtime.js";import"./index-d475d2ea.js";import"./index-a620515c.js";import"./index-d37d4223.js";import"./index-356e4a49.js";const{deprecate:m}=__STORYBOOK_MODULE_CLIENT_LOGGER__;m("Import from '@storybook/addon-docs/blocks' is deprecated. Please import from '@storybook/blocks' instead.");const a=({title:o,children:t,description:s})=>i(p,{children:[e("figure",{className:"so-docs-typography-item__example text-right","aria-hidden":!0,children:t}),i("div",{className:"so-docs-typography-item__text",children:[e("h2",{className:"so-docs-typography-item__title font-bold",children:o}),s]})]});try{a.displayName="DocTypographyItem",a.__docgenInfo={description:"An util element for visual representation of Typography elements inside Storybook",displayName:"DocTypographyItem",props:{title:{defaultValue:null,description:"",name:"title",required:!0,type:{name:"string"}},description:{defaultValue:null,description:"",name:"description",required:!0,type:{name:"string"}}}}}catch{}const l=({items:o})=>e("div",{className:"so-docs-typography-list grid gap-y-4 gap-x-8 rounded shadow-sm border p-10",children:o.map(({children:t,...s})=>e(a,{...s,children:t}))});try{l.displayName="DocTypographyList",l.__docgenInfo={description:"",displayName:"DocTypographyList",props:{items:{defaultValue:null,description:"",name:"items",required:!0,type:{name:"DocTypographyItemProps[]"}}}}}catch{}const y=[{size:"9xl",title:"Extra Large 9",children:e(r,{size:"9xl",children:"9xl"})},{size:"8xl",title:"Extra Large 8",children:e(r,{size:"8xl",children:"8xl"})},{size:"7xl",title:"Extra Large 7",children:e(r,{size:"7xl",children:"7xl"})},{size:"6xl",title:"Extra Large 6",children:e(r,{size:"6xl",children:"6xl"})},{size:"5xl",title:"Extra Large 5",children:e(r,{size:"5xl",children:"5xl"})},{size:"4xl",title:"Extra Large 4",children:e(r,{size:"4xl",children:"4xl"})},{size:"3xl",title:"Extra Large 3",children:e(r,{size:"3xl",children:"3xl"})},{size:"2xl",title:"Extra Large 2",children:e(r,{size:"2xl",children:"2xl"})},{size:"xl",title:"Extra Large",children:e(r,{size:"xl",children:"xl"})},{size:"lg",title:"Large",children:e(r,{size:"lg",children:"lg"})},{size:"base",title:"Base",description:"Default size for body text",children:e(r,{size:"base",children:"base"})},{size:"sm",title:"Small",children:e(r,{size:"sm",children:"sm"})},{size:"xs",title:"Extra Small",children:e(r,{size:"xs",children:"xs"})}];function c(o){const t=Object.assign({h1:"h1",p:"p",a:"a",strong:"strong",code:"code"},d(),o.components);return i(p,{children:[`
`,`
`,e(h,{title:"Foundations/Typography"}),`
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
`,e(l,{items:y})]})}function g(o={}){const{wrapper:t}=Object.assign({},d(),o.components);return t?e(t,{...o,children:e(c,{...o})}):c(o)}const x=()=>{throw new Error("Docs-only story")};x.parameters={docsOnly:!0};const n={title:"Foundations/Typography",tags:["stories-mdx"],includeStories:["__page"]};n.parameters=n.parameters||{};n.parameters.docs={...n.parameters.docs||{},page:g};const C=["typeScale","__page"];export{C as __namedExportsOrder,x as __page,n as default,y as typeScale};
//# sourceMappingURL=Typography.stories-3e1b075f.js.map
