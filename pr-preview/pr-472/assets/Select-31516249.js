import{j as I,a as P,F as te,c as C}from"./index-83d39615.js";import{r as c,R as z}from"./index-5ac02154.js";import{o as f,S as re,D as A,y as M,T as ye,u as E,l as H,H as Oe,h as Se,a as Re,p as U,c as Le,d as G,e as Ie,b as we,f as $e,R as Te,X as V,I as K,i as ie,s as De,C as ke,g as Ce,j as Pe,k as Ee,m as w,n as O,r as Fe,q as W,x as Ne,t as Ae,v as Me,$ as Ve,w as qe}from"./ChevronDownIcon-f0bef87d.js";let ae=/([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g;function ne(e){var a,i;let r=(a=e.innerText)!=null?a:"",l=e.cloneNode(!0);if(!(l instanceof HTMLElement))return r;let s=!1;for(let o of l.querySelectorAll('[hidden],[aria-hidden],[role="img"]'))o.remove(),s=!0;let t=s?(i=l.innerText)!=null?i:"":r;return ae.test(t)&&(t=t.replace(ae,"")),t}function je(e){let a=e.getAttribute("aria-label");if(typeof a=="string")return a.trim();let i=e.getAttribute("aria-labelledby");if(i){let r=i.split(" ").map(l=>{let s=document.getElementById(l);if(s){let t=s.getAttribute("aria-label");return typeof t=="string"?t.trim():ne(s).trim()}return null}).filter(Boolean);if(r.length>0)return r.join(", ")}return ne(e).trim()}function Be(e){let a=c.useRef(""),i=c.useRef("");return f(()=>{let r=e.current;if(!r)return"";let l=r.innerText;if(a.current===l)return i.current;let s=je(r).trim().toLowerCase();return a.current=l,i.current=s,s})}var Qe=(e=>(e[e.Open=0]="Open",e[e.Closed=1]="Closed",e))(Qe||{}),_e=(e=>(e[e.Single=0]="Single",e[e.Multi=1]="Multi",e))(_e||{}),ze=(e=>(e[e.Pointer=0]="Pointer",e[e.Other=1]="Other",e))(ze||{}),He=(e=>(e[e.OpenListbox=0]="OpenListbox",e[e.CloseListbox=1]="CloseListbox",e[e.GoToOption=2]="GoToOption",e[e.Search=3]="Search",e[e.ClearSearch=4]="ClearSearch",e[e.RegisterOption=5]="RegisterOption",e[e.UnregisterOption=6]="UnregisterOption",e[e.RegisterLabel=7]="RegisterLabel",e))(He||{});function J(e,a=i=>i){let i=e.activeOptionIndex!==null?e.options[e.activeOptionIndex]:null,r=Ae(a(e.options.slice()),s=>s.dataRef.current.domRef.current),l=i?r.indexOf(i):null;return l===-1&&(l=null),{options:r,activeOptionIndex:l}}let Ue={[1](e){return e.dataRef.current.disabled||e.listboxState===1?e:{...e,activeOptionIndex:null,listboxState:1}},[0](e){if(e.dataRef.current.disabled||e.listboxState===0)return e;let a=e.activeOptionIndex,{isSelected:i}=e.dataRef.current,r=e.options.findIndex(l=>i(l.dataRef.current.value));return r!==-1&&(a=r),{...e,listboxState:0,activeOptionIndex:a}},[2](e,a){var i;if(e.dataRef.current.disabled||e.listboxState===1)return e;let r=J(e),l=Ne(a,{resolveItems:()=>r.options,resolveActiveIndex:()=>r.activeOptionIndex,resolveId:s=>s.id,resolveDisabled:s=>s.dataRef.current.disabled});return{...e,...r,searchQuery:"",activeOptionIndex:l,activationTrigger:(i=a.trigger)!=null?i:1}},[3]:(e,a)=>{if(e.dataRef.current.disabled||e.listboxState===1)return e;let i=e.searchQuery!==""?0:1,r=e.searchQuery+a.value.toLowerCase(),l=(e.activeOptionIndex!==null?e.options.slice(e.activeOptionIndex+i).concat(e.options.slice(0,e.activeOptionIndex+i)):e.options).find(t=>{var o;return!t.dataRef.current.disabled&&((o=t.dataRef.current.textValue)==null?void 0:o.startsWith(r))}),s=l?e.options.indexOf(l):-1;return s===-1||s===e.activeOptionIndex?{...e,searchQuery:r}:{...e,searchQuery:r,activeOptionIndex:s,activationTrigger:1}},[4](e){return e.dataRef.current.disabled||e.listboxState===1||e.searchQuery===""?e:{...e,searchQuery:""}},[5]:(e,a)=>{let i={id:a.id,dataRef:a.dataRef},r=J(e,l=>[...l,i]);return e.activeOptionIndex===null&&e.dataRef.current.isSelected(a.dataRef.current.value)&&(r.activeOptionIndex=r.options.indexOf(i)),{...e,...r}},[6]:(e,a)=>{let i=J(e,r=>{let l=r.findIndex(s=>s.id===a.id);return l!==-1&&r.splice(l,1),r});return{...e,...i,activationTrigger:1}},[7]:(e,a)=>({...e,labelId:a.id})},Y=c.createContext(null);Y.displayName="ListboxActionsContext";function q(e){let a=c.useContext(Y);if(a===null){let i=new Error(`<${e} /> is missing a parent <Listbox /> component.`);throw Error.captureStackTrace&&Error.captureStackTrace(i,q),i}return a}let Z=c.createContext(null);Z.displayName="ListboxDataContext";function j(e){let a=c.useContext(Z);if(a===null){let i=new Error(`<${e} /> is missing a parent <Listbox /> component.`);throw Error.captureStackTrace&&Error.captureStackTrace(i,j),i}return a}function Ge(e,a){return E(a.type,Ue,e,a)}let Ke=c.Fragment;function Xe(e,a){let{value:i,defaultValue:r,form:l,name:s,onChange:t,by:o=(u,d)=>u===d,disabled:b=!1,horizontal:x=!1,multiple:h=!1,...S}=e;const T=x?"horizontal":"vertical";let $=M(a),[y=h?[]:void 0,g]=ye(i,t,r),[v,n]=c.useReducer(Ge,{dataRef:c.createRef(),listboxState:1,options:[],searchQuery:"",labelId:null,activeOptionIndex:null,activationTrigger:1}),p=c.useRef({static:!1,hold:!1}),k=c.useRef(null),B=c.useRef(null),X=c.useRef(null),R=f(typeof o=="string"?(u,d)=>{let L=o;return(u==null?void 0:u[L])===(d==null?void 0:d[L])}:o),D=c.useCallback(u=>E(m.mode,{[1]:()=>y.some(d=>R(d,u)),[0]:()=>R(y,u)}),[y]),m=c.useMemo(()=>({...v,value:y,disabled:b,mode:h?1:0,orientation:T,compare:R,isSelected:D,optionsPropsRef:p,labelRef:k,buttonRef:B,optionsRef:X}),[y,b,h,v]);H(()=>{v.dataRef.current=m},[m]),Oe([m.buttonRef,m.optionsRef],(u,d)=>{var L;n({type:1}),Se(d,Re.Loose)||(u.preventDefault(),(L=m.buttonRef.current)==null||L.focus())},m.listboxState===0);let oe=c.useMemo(()=>({open:m.listboxState===0,disabled:b,value:y}),[m,b,y]),se=f(u=>{let d=m.options.find(L=>L.id===u);d&&F(d.dataRef.current.value)}),ue=f(()=>{if(m.activeOptionIndex!==null){let{dataRef:u,id:d}=m.options[m.activeOptionIndex];F(u.current.value),n({type:2,focus:w.Specific,id:d})}}),ce=f(()=>n({type:0})),de=f(()=>n({type:1})),pe=f((u,d,L)=>u===w.Specific?n({type:2,focus:w.Specific,id:d,trigger:L}):n({type:2,focus:u,trigger:L})),fe=f((u,d)=>(n({type:5,id:u,dataRef:d}),()=>n({type:6,id:u}))),be=f(u=>(n({type:7,id:u}),()=>n({type:7,id:null}))),F=f(u=>E(m.mode,{[0](){return g==null?void 0:g(u)},[1](){let d=m.value.slice(),L=d.findIndex(_=>R(_,u));return L===-1?d.push(u):d.splice(L,1),g==null?void 0:g(d)}})),ve=f(u=>n({type:3,value:u})),me=f(()=>n({type:4})),xe=c.useMemo(()=>({onChange:F,registerOption:fe,registerLabel:be,goToOption:pe,closeListbox:de,openListbox:ce,selectActiveOption:ue,selectOption:se,search:ve,clearSearch:me}),[]),ge={ref:$},Q=c.useRef(null),he=U();return c.useEffect(()=>{Q.current&&r!==void 0&&he.addEventListener(Q.current,"reset",()=>{F(r)})},[Q,F]),z.createElement(Y.Provider,{value:xe},z.createElement(Z.Provider,{value:m},z.createElement(Le,{value:E(m.listboxState,{[0]:G.Open,[1]:G.Closed})},s!=null&&y!=null&&Ie({[s]:y}).map(([u,d],L)=>z.createElement(we,{features:$e.Hidden,ref:L===0?_=>{var ee;Q.current=(ee=_==null?void 0:_.closest("form"))!=null?ee:null}:void 0,...Te({key:u,as:"input",type:"hidden",hidden:!0,readOnly:!0,form:l,name:u,value:d})})),V({ourProps:ge,theirProps:S,slot:oe,defaultTag:Ke,name:"Listbox"}))))}let Je="button";function We(e,a){var i;let r=K(),{id:l=`headlessui-listbox-button-${r}`,...s}=e,t=j("Listbox.Button"),o=q("Listbox.Button"),b=M(t.buttonRef,a),x=U(),h=f(v=>{switch(v.key){case O.Space:case O.Enter:case O.ArrowDown:v.preventDefault(),o.openListbox(),x.nextFrame(()=>{t.value||o.goToOption(w.First)});break;case O.ArrowUp:v.preventDefault(),o.openListbox(),x.nextFrame(()=>{t.value||o.goToOption(w.Last)});break}}),S=f(v=>{switch(v.key){case O.Space:v.preventDefault();break}}),T=f(v=>{if(Fe(v.currentTarget))return v.preventDefault();t.listboxState===0?(o.closeListbox(),x.nextFrame(()=>{var n;return(n=t.buttonRef.current)==null?void 0:n.focus({preventScroll:!0})})):(v.preventDefault(),o.openListbox())}),$=ie(()=>{if(t.labelId)return[t.labelId,l].join(" ")},[t.labelId,l]),y=c.useMemo(()=>({open:t.listboxState===0,disabled:t.disabled,value:t.value}),[t]),g={ref:b,id:l,type:De(e,t.buttonRef),"aria-haspopup":"listbox","aria-controls":(i=t.optionsRef.current)==null?void 0:i.id,"aria-expanded":t.disabled?void 0:t.listboxState===0,"aria-labelledby":$,disabled:t.disabled,onKeyDown:h,onKeyUp:S,onClick:T};return V({ourProps:g,theirProps:s,slot:y,defaultTag:Je,name:"Listbox.Button"})}let Ye="label";function Ze(e,a){let i=K(),{id:r=`headlessui-listbox-label-${i}`,...l}=e,s=j("Listbox.Label"),t=q("Listbox.Label"),o=M(s.labelRef,a);H(()=>t.registerLabel(r),[r]);let b=f(()=>{var h;return(h=s.buttonRef.current)==null?void 0:h.focus({preventScroll:!0})}),x=c.useMemo(()=>({open:s.listboxState===0,disabled:s.disabled}),[s]);return V({ourProps:{ref:o,id:r,onClick:b},theirProps:l,slot:x,defaultTag:Ye,name:"Listbox.Label"})}let et="ul",tt=re.RenderStrategy|re.Static;function rt(e,a){var i;let r=K(),{id:l=`headlessui-listbox-options-${r}`,...s}=e,t=j("Listbox.Options"),o=q("Listbox.Options"),b=M(t.optionsRef,a),x=U(),h=U(),S=ke(),T=(()=>S!==null?(S&G.Open)===G.Open:t.listboxState===0)();c.useEffect(()=>{var n;let p=t.optionsRef.current;p&&t.listboxState===0&&p!==((n=Ce(p))==null?void 0:n.activeElement)&&p.focus({preventScroll:!0})},[t.listboxState,t.optionsRef]);let $=f(n=>{switch(h.dispose(),n.key){case O.Space:if(t.searchQuery!=="")return n.preventDefault(),n.stopPropagation(),o.search(n.key);case O.Enter:if(n.preventDefault(),n.stopPropagation(),t.activeOptionIndex!==null){let{dataRef:p}=t.options[t.activeOptionIndex];o.onChange(p.current.value)}t.mode===0&&(o.closeListbox(),W().nextFrame(()=>{var p;return(p=t.buttonRef.current)==null?void 0:p.focus({preventScroll:!0})}));break;case E(t.orientation,{vertical:O.ArrowDown,horizontal:O.ArrowRight}):return n.preventDefault(),n.stopPropagation(),o.goToOption(w.Next);case E(t.orientation,{vertical:O.ArrowUp,horizontal:O.ArrowLeft}):return n.preventDefault(),n.stopPropagation(),o.goToOption(w.Previous);case O.Home:case O.PageUp:return n.preventDefault(),n.stopPropagation(),o.goToOption(w.First);case O.End:case O.PageDown:return n.preventDefault(),n.stopPropagation(),o.goToOption(w.Last);case O.Escape:return n.preventDefault(),n.stopPropagation(),o.closeListbox(),x.nextFrame(()=>{var p;return(p=t.buttonRef.current)==null?void 0:p.focus({preventScroll:!0})});case O.Tab:n.preventDefault(),n.stopPropagation();break;default:n.key.length===1&&(o.search(n.key),h.setTimeout(()=>o.clearSearch(),350));break}}),y=ie(()=>{var n,p,k;return(k=(n=t.labelRef.current)==null?void 0:n.id)!=null?k:(p=t.buttonRef.current)==null?void 0:p.id},[t.labelRef.current,t.buttonRef.current]),g=c.useMemo(()=>({open:t.listboxState===0}),[t]),v={"aria-activedescendant":t.activeOptionIndex===null||(i=t.options[t.activeOptionIndex])==null?void 0:i.id,"aria-multiselectable":t.mode===1?!0:void 0,"aria-labelledby":y,"aria-orientation":t.orientation,id:l,onKeyDown:$,role:"listbox",tabIndex:0,ref:b};return V({ourProps:v,theirProps:s,slot:g,defaultTag:et,features:tt,visible:T,name:"Listbox.Options"})}let at="li";function nt(e,a){let i=K(),{id:r=`headlessui-listbox-option-${i}`,disabled:l=!1,value:s,...t}=e,o=j("Listbox.Option"),b=q("Listbox.Option"),x=o.activeOptionIndex!==null?o.options[o.activeOptionIndex].id===r:!1,h=o.isSelected(s),S=c.useRef(null),T=Be(S),$=Pe({disabled:l,value:s,domRef:S,get textValue(){return T()}}),y=M(a,S);H(()=>{if(o.listboxState!==0||!x||o.activationTrigger===0)return;let R=W();return R.requestAnimationFrame(()=>{var D,m;(m=(D=S.current)==null?void 0:D.scrollIntoView)==null||m.call(D,{block:"nearest"})}),R.dispose},[S,x,o.listboxState,o.activationTrigger,o.activeOptionIndex]),H(()=>b.registerOption(r,$),[$,r]);let g=f(R=>{if(l)return R.preventDefault();b.onChange(s),o.mode===0&&(b.closeListbox(),W().nextFrame(()=>{var D;return(D=o.buttonRef.current)==null?void 0:D.focus({preventScroll:!0})}))}),v=f(()=>{if(l)return b.goToOption(w.Nothing);b.goToOption(w.Specific,r)}),n=Ee(),p=f(R=>n.update(R)),k=f(R=>{n.wasMoved(R)&&(l||x||b.goToOption(w.Specific,r,0))}),B=f(R=>{n.wasMoved(R)&&(l||x&&b.goToOption(w.Nothing))}),X=c.useMemo(()=>({active:x,selected:h,disabled:l}),[x,h,l]);return V({ourProps:{id:r,ref:y,role:"option",tabIndex:l===!0?void 0:-1,"aria-disabled":l===!0?!0:void 0,"aria-selected":h,disabled:void 0,onClick:g,onFocus:v,onPointerEnter:p,onMouseEnter:p,onPointerMove:k,onMouseMove:k,onPointerLeave:B,onMouseLeave:B},theirProps:t,slot:X,defaultTag:at,name:"Listbox.Option"})}let lt=A(Xe),it=A(We),ot=A(Ze),st=A(rt),ut=A(nt),N=Object.assign(lt,{Button:it,Label:ot,Options:st,Option:ut});const ft=["base","xl"],le=({label:e,options:a,name:i,size:r="base",selected:l=Object.keys(a)[0],block:s=!1,labelHidden:t=!1,...o})=>I(N,{...o,children:({open:b})=>{var x,h,S,T,$;return P(te,{children:[I(N.Label,{className:C("block","font-medium","text-gray-700","mb-1",{"sr-only":t}),children:e}),P("div",{className:"relative",children:[P(N.Button,{className:C("relative","cursor-default","rounded-lg","border","border-gray-300","bg-white","p-3","pl-3","pr-10","text-left","transition","hover:shadow-lg","hover:shadow-gray-200",`text-${r}`,{"w-full":s}),children:[P("span",{className:"flex items-center",children:[((x=a[l])==null?void 0:x.image)&&I("img",{src:(S=(h=a[l])==null?void 0:h.image)==null?void 0:S.src,alt:"",className:"h-6 w-6 flex-shrink-0 rounded-full object-cover"}),I("span",{className:C({"ml-3":!!((T=a[l])!=null&&T.image)},"block","truncate"),children:($=a[l])==null?void 0:$.label})]}),I("span",{className:"pointer-events-none absolute inset-y-0 right-0 ml-2 flex items-center pr-2",children:I(Me,{className:"h-5 w-5 text-gray-400","aria-hidden":"true"})})]}),I(Ve,{show:b,as:c.Fragment,leave:"transition ease-in duration-100",leaveFrom:"opacity-100",leaveTo:"opacity-0",children:I(N.Options,{className:C("absolute","z-10","mt-1","max-h-56","overflow-auto","rounded-lg","bg-white","py-1","shadow-lg","ring-1","ring-black","ring-opacity-5","focus:outline-none",`text-${r}`,{"w-full":s}),children:Object.entries(a).map(([y,g],v)=>I(N.Option,{className:({active:n})=>C(n?"text-white bg-so-color-accent-2-primary-500":"text-gray-900","relative cursor-default select-none py-2 pl-3 pr-12"),value:y,children:({selected:n,active:p})=>P(te,{children:[P("div",{className:"flex items-center",children:[(g==null?void 0:g.image)&&I("img",{src:g.image.src,alt:"",className:"h-6 w-6 flex-shrink-0 rounded-full object-cover"}),I("span",{className:C(p?"font-semibold":"font-normal","truncate",{"ml-3":!!(g!=null&&g.image)}),children:g.label})]}),n&&I("span",{className:C("absolute inset-y-0 right-0 flex items-center pr-4"),children:I(qe,{className:"h-5 w-5","aria-hidden":"true"})})]})},v))})})]})]})}});try{le.displayName="SoSelect",le.__docgenInfo={description:"",displayName:"SoSelect",props:{label:{defaultValue:null,description:"The select's label elements",name:"label",required:!0,type:{name:"string"}},options:{defaultValue:null,description:"Options available for selection",name:"options",required:!0,type:{name:"Record<string, SoSelectItem>"}},selected:{defaultValue:{value:"Object.keys(options)[0]"},description:"The selected/current value",name:"selected",required:!1,type:{name:"string"}},block:{defaultValue:{value:"false"},description:"Render full width",name:"block",required:!1,type:{name:"boolean"}},labelHidden:{defaultValue:{value:"false"},description:"If true, the label is visually hidden. It will still be available to screenreaders.",name:"labelHidden",required:!1,type:{name:"boolean"}},size:{defaultValue:{value:"base"},description:"Visual size of the button",name:"size",required:!1,type:{name:"enum",value:[{value:'"base"'},{value:'"xl"'}]}},onChange:{defaultValue:null,description:"Emits the selected value on change",name:"onChange",required:!1,type:{name:"(value: string) => void"}},disabled:{defaultValue:null,description:"",name:"disabled",required:!1,type:{name:"boolean"}},name:{defaultValue:null,description:"",name:"name",required:!1,type:{name:"string"}},value:{defaultValue:null,description:"",name:"value",required:!1,type:{name:"unknown"}}}}}catch{}export{le as S,ft as a};
//# sourceMappingURL=Select-31516249.js.map
