import{a as c,F as g,j as i}from"./jsx-runtime.76791415.js";import{c as e,A as h,M as x}from"./Props.5b59fd03.js";import{k as T,d as u}from"./iframe.ad49238a.js";import"./utils.30012480.js";import{S as t}from"./Typography.ac2f2376.js";import"./string.3f120fc6.js";import"./es.map.constructor.85543a13.js";import"./es.number.to-fixed.90f12558.js";import"./make-decorator.6643f16d.js";import"./index.eb826ae0.js";const f=T(()=>{},u`
    Importing from '@storybook/addon-docs/blocks' is deprecated, import directly from '@storybook/addon-docs' instead:
    
    https://github.com/storybookjs/storybook/blob/next/MIGRATION.md#deprecated-scoped-blocks-imports
`);f();const s=({title:o,children:r,description:a})=>c(g,{children:[i("figure",{className:"so-docs-typography-item__example text-right","aria-hidden":!0,children:r}),c("div",{className:"so-docs-typography-item__text",children:[i("h2",{className:"so-docs-typography-item__title font-bold",children:o}),a]})]});try{s.displayName="DocTypographyItem",s.__docgenInfo={description:"An util element for visual representation of Typography elements inside Storybook",displayName:"DocTypographyItem",props:{title:{defaultValue:null,description:"",name:"title",required:!0,type:{name:"any"}},description:{defaultValue:null,description:"",name:"description",required:!0,type:{name:"any"}}}},typeof STORYBOOK_REACT_CLASSES<"u"&&(STORYBOOK_REACT_CLASSES["src/lib/util/documentation/components/TypographyItem.tsx#DocTypographyItem"]={docgenInfo:s.__docgenInfo,name:"DocTypographyItem",path:"src/lib/util/documentation/components/TypographyItem.tsx#DocTypographyItem"})}catch{}const n=({items:o})=>i("div",{className:"so-docs-typography-list grid gap-y-4 gap-x-8 rounded shadow-sm border p-10",children:o.map(({children:r,...a})=>i(s,{...a,children:r}))});try{n.displayName="DocTypographyList",n.__docgenInfo={description:"",displayName:"DocTypographyList",props:{items:{defaultValue:null,description:"",name:"items",required:!0,type:{name:"DocTypographyItemProps[]"}}}},typeof STORYBOOK_REACT_CLASSES<"u"&&(STORYBOOK_REACT_CLASSES["src/lib/util/documentation/components/TypographyList.tsx#DocTypographyList"]={docgenInfo:n.__docgenInfo,name:"DocTypographyList",path:"src/lib/util/documentation/components/TypographyList.tsx#DocTypographyList"})}catch{}function y(){return y=Object.assign?Object.assign.bind():function(o){for(var r=1;r<arguments.length;r++){var a=arguments[r];for(var l in a)Object.prototype.hasOwnProperty.call(a,l)&&(o[l]=a[l])}return o},y.apply(this,arguments)}const m=[{size:"9xl",title:"Extra Large 9",children:e(t,{size:"9xl",mdxType:"SoTypography"},"9xl")},{size:"8xl",title:"Extra Large 8",children:e(t,{size:"8xl",mdxType:"SoTypography"},"8xl")},{size:"7xl",title:"Extra Large 7",children:e(t,{size:"7xl",mdxType:"SoTypography"},"7xl")},{size:"6xl",title:"Extra Large 6",children:e(t,{size:"6xl",mdxType:"SoTypography"},"6xl")},{size:"5xl",title:"Extra Large 5",children:e(t,{size:"5xl",mdxType:"SoTypography"},"5xl")},{size:"4xl",title:"Extra Large 4",children:e(t,{size:"4xl",mdxType:"SoTypography"},"4xl")},{size:"3xl",title:"Extra Large 3",children:e(t,{size:"3xl",mdxType:"SoTypography"},"3xl")},{size:"2xl",title:"Extra Large 2",children:e(t,{size:"2xl",mdxType:"SoTypography"},"2xl")},{size:"xl",title:"Extra Large",children:e(t,{size:"xl",mdxType:"SoTypography"},"xl")},{size:"lg",title:"Large",children:e(t,{size:"lg",mdxType:"SoTypography"},"lg")},{size:"base",title:"Base",description:"Default size for body text",children:e(t,{size:"base",mdxType:"SoTypography"},"base")},{size:"sm",title:"Small",children:e(t,{size:"sm",mdxType:"SoTypography"},"sm")},{size:"xs",title:"Extra Small",children:e(t,{size:"xs",mdxType:"SoTypography"},"xs")}],S={typeScale:m},_="wrapper";function d({components:o,...r}){return e(_,y({},S,r,{components:o,mdxType:"MDXLayout"}),e(x,{title:"Foundations/Typography",mdxType:"Meta"}),e("h1",null,"Typography"),e("p",null,"Social Income uses the ",e("a",{parentName:"p",href:"https://lineto.com/typefaces/unica77"},"Unica77"),`
font family. The font family is not open-source, therefore the fonts in
the source repository can only be used in the context of the Social
Income projects.`),e("p",null,`There is a React component to utilize the typography stack, see
`,e("strong",{parentName:"p"},"Components")," > ",e("strong",{parentName:"p"},"Typography"),"."),e("p",null,e("strong",{parentName:"p"},"Font:")," Unica77 (",e("inlineCode",{parentName:"p"},"font-family: 'SoSans';"),")"),e("p",null,e("strong",{parentName:"p"},"Weights:")," 400(regular), 500(medium), 700(bold)"),e(n,{items:m,mdxType:"DocTypographyList"}))}d.isMDXComponent=!0;const z=()=>{throw new Error("Docs-only story")};z.parameters={docsOnly:!0};const p={title:"Foundations/Typography",includeStories:["__page"]},b={};p.parameters=p.parameters||{};p.parameters.docs={...p.parameters.docs||{},page:()=>e(h,{mdxStoryNameToKey:b,mdxComponentAnnotations:p},e(d,null))};const j=["typeScale","__page"];export{j as __namedExportsOrder,z as __page,p as default,m as typeScale};
//# sourceMappingURL=Typography.stories.a6d07726.js.map
