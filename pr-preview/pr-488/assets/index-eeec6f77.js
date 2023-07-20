import{j as n,a as D,F as g}from"./jsx-runtime-dd758c57.js";import{r as N,R as _}from"./index-5ac02154.js";import{c as I}from"./clsx.m-1229b3e0.js";import{B as q}from"./Button-dd984274.js";import{t as V}from"./tw-merge-1166cefb.js";const m=({children:e,color:a,size:l,button:r=!0,dataTheme:t,className:o,disabled:u,...d})=>n("label",{tabIndex:0,className:o,...d,children:r?n(q,{type:"button",dataTheme:t,color:a,size:l,disabled:u,children:e}):e}),c=N.forwardRef((e,a)=>n(q,{...e,ref:a,tag:"summary"})),T=m;try{c.displayName="Summary",c.__docgenInfo={description:"",displayName:"Summary",props:{color:{defaultValue:null,description:"",name:"color",required:!1,type:{name:"enum",value:[{value:'"primary"'},{value:'"secondary"'},{value:'"accent"'},{value:'"neutral"'},{value:'"info"'},{value:'"success"'},{value:'"warning"'},{value:'"error"'},{value:'"ghost"'}]}},shape:{defaultValue:null,description:"",name:"shape",required:!1,type:{name:"enum",value:[{value:'"circle"'},{value:'"square"'}]}},loading:{defaultValue:null,description:"",name:"loading",required:!1,type:{name:"boolean"}},size:{defaultValue:null,description:"",name:"size",required:!1,type:{name:"enum",value:[{value:'"xs"'},{value:'"sm"'},{value:'"md"'},{value:'"lg"'}]}},dataTheme:{defaultValue:null,description:"",name:"dataTheme",required:!1,type:{name:"string"}},variant:{defaultValue:null,description:"",name:"variant",required:!1,type:{name:"enum",value:[{value:'"link"'},{value:'"outline"'}]}},glass:{defaultValue:null,description:"",name:"glass",required:!1,type:{name:"boolean"}},startIcon:{defaultValue:null,description:"",name:"startIcon",required:!1,type:{name:"ReactNode"}},endIcon:{defaultValue:null,description:"",name:"endIcon",required:!1,type:{name:"ReactNode"}},wide:{defaultValue:null,description:"",name:"wide",required:!1,type:{name:"boolean"}},fullWidth:{defaultValue:null,description:"",name:"fullWidth",required:!1,type:{name:"boolean"}},responsive:{defaultValue:null,description:"",name:"responsive",required:!1,type:{name:"boolean"}},animation:{defaultValue:null,description:"",name:"animation",required:!1,type:{name:"boolean"}},active:{defaultValue:null,description:"",name:"active",required:!1,type:{name:"boolean"}}}}}catch{}try{m.displayName="DropdownToggle",m.__docgenInfo={description:"",displayName:"DropdownToggle",props:{dataTheme:{defaultValue:null,description:"",name:"dataTheme",required:!1,type:{name:"string"}},color:{defaultValue:null,description:"",name:"color",required:!1,type:{name:"enum",value:[{value:'"primary"'},{value:'"secondary"'},{value:'"accent"'},{value:'"neutral"'},{value:'"info"'},{value:'"success"'},{value:'"warning"'},{value:'"error"'},{value:'"ghost"'}]}},size:{defaultValue:null,description:"",name:"size",required:!1,type:{name:"enum",value:[{value:'"xs"'},{value:'"sm"'},{value:'"md"'},{value:'"lg"'}]}},button:{defaultValue:{value:"true"},description:"",name:"button",required:!1,type:{name:"boolean"}},disabled:{defaultValue:null,description:"",name:"disabled",required:!1,type:{name:"boolean"}}}}}catch{}const i=_.forwardRef(({children:e,className:a,horizontal:l,vertical:r,end:t,dataTheme:o,open:u,...d},p)=>n("details",{role:"listbox",...d,ref:p,"data-theme":o,className:s({className:a,horizontal:l,vertical:r,open:u,end:t}),open:u,children:e}));i.displayName="Details";const x=Object.assign(i,{Toggle:c});try{i.displayName="Details",i.__docgenInfo={description:"",displayName:"Details",props:{end:{defaultValue:null,description:"",name:"end",required:!1,type:{name:"boolean"}},open:{defaultValue:null,description:"",name:"open",required:!1,type:{name:"boolean"}},horizontal:{defaultValue:null,description:"",name:"horizontal",required:!1,type:{name:"enum",value:[{value:'"left"'},{value:'"right"'}]}},vertical:{defaultValue:null,description:"",name:"vertical",required:!1,type:{name:"enum",value:[{value:'"top"'},{value:'"bottom"'}]}},dataTheme:{defaultValue:null,description:"",name:"dataTheme",required:!1,type:{name:"string"}}}}}catch{}const f=({dataTheme:e,className:a,...l})=>{const r=V("dropdown-content menu p-2 shadow bg-base-100 rounded-box",a);return n("ul",{...l,tabIndex:0,"data-theme":e,className:r,role:"menu"})},z=f;try{f.displayName="DropdownMenu",f.__docgenInfo={description:"",displayName:"DropdownMenu",props:{dataTheme:{defaultValue:null,description:"",name:"dataTheme",required:!1,type:{name:"string"}}}}}catch{}const y=_.forwardRef(({className:e,...a},l)=>n("li",{className:e,role:"menuitem",children:n("a",{ref:l,...a})})),R=y;try{y.displayName="DropdownItem",y.__docgenInfo={description:"",displayName:"DropdownItem",props:{}}}catch{}const s=({className:e,horizontal:a,vertical:l,end:r,hover:t,open:o})=>V("dropdown",e,I({"dropdown-left":a==="left","dropdown-right":a==="right","dropdown-top":l==="top","dropdown-bottom":l==="bottom","dropdown-end":r,"dropdown-hover":t,"dropdown-open":o})),v=_.forwardRef(({children:e,className:a,item:l,horizontal:r,vertical:t,end:o,hover:u,open:d,dataTheme:p,...b},w)=>n("div",{role:"listbox",...b,ref:w,"data-theme":p,className:s({className:a,horizontal:r,vertical:t,end:o,hover:u,open:d}),children:l?D(g,{children:[n("label",{tabIndex:0,children:e}),n("ul",{className:"dropdown-content",children:l})]}):n(g,{children:e})})),h=Object.assign(v,{Details:x,Toggle:T,Menu:z,Item:R});try{s.displayName="classesFn",s.__docgenInfo={description:"",displayName:"classesFn",props:{end:{defaultValue:null,description:"",name:"end",required:!1,type:{name:"boolean"}},open:{defaultValue:null,description:"",name:"open",required:!1,type:{name:"boolean"}},horizontal:{defaultValue:null,description:"",name:"horizontal",required:!1,type:{name:"enum",value:[{value:'"left"'},{value:'"right"'}]}},vertical:{defaultValue:null,description:"",name:"vertical",required:!1,type:{name:"enum",value:[{value:'"top"'},{value:'"bottom"'}]}},hover:{defaultValue:null,description:"",name:"hover",required:!1,type:{name:"boolean"}}}}}catch{}try{v.displayName="Dropdown",v.__docgenInfo={description:"",displayName:"Dropdown",props:{dataTheme:{defaultValue:null,description:"",name:"dataTheme",required:!1,type:{name:"string"}},item:{defaultValue:null,description:"",name:"item",required:!1,type:{name:"ReactNode"}},horizontal:{defaultValue:null,description:"",name:"horizontal",required:!1,type:{name:"enum",value:[{value:'"left"'},{value:'"right"'}]}},vertical:{defaultValue:null,description:"",name:"vertical",required:!1,type:{name:"enum",value:[{value:'"top"'},{value:'"bottom"'}]}},end:{defaultValue:null,description:"",name:"end",required:!1,type:{name:"boolean"}},hover:{defaultValue:null,description:"",name:"hover",required:!1,type:{name:"boolean"}},open:{defaultValue:null,description:"",name:"open",required:!1,type:{name:"boolean"}}}}}catch{}try{h.displayName="Dropdown",h.__docgenInfo={description:"",displayName:"Dropdown",props:{dataTheme:{defaultValue:null,description:"",name:"dataTheme",required:!1,type:{name:"string"}},item:{defaultValue:null,description:"",name:"item",required:!1,type:{name:"ReactNode"}},horizontal:{defaultValue:null,description:"",name:"horizontal",required:!1,type:{name:"enum",value:[{value:'"left"'},{value:'"right"'}]}},vertical:{defaultValue:null,description:"",name:"vertical",required:!1,type:{name:"enum",value:[{value:'"top"'},{value:'"bottom"'}]}},end:{defaultValue:null,description:"",name:"end",required:!1,type:{name:"boolean"}},hover:{defaultValue:null,description:"",name:"hover",required:!1,type:{name:"boolean"}},open:{defaultValue:null,description:"",name:"open",required:!1,type:{name:"boolean"}}}}}catch{}export{h as D};
//# sourceMappingURL=index-eeec6f77.js.map
