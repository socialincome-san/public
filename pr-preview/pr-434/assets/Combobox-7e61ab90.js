import{j as y,a as oe,F as pe,c as _}from"./index-bf905c9d.js";import{r as p,R as ne}from"./index-ec8b93d8.js";import{l as D,g as he,o as O,S as be,D as B,T as Re,u as j,H as Oe,p as ie,c as Ce,d as re,e as Ie,b as Se,f as ye,R as we,X as H,I as G,y as Q,i as ue,s as Te,C as Pe,j as Ee,k as Ne,m as I,n as w,r as ke,q as fe,x as Fe,t as De,v as Me,$ as Le,w as _e}from"./ChevronDownIcon-76fe8021.js";function Ae({container:e,accept:o,walk:i,enabled:t=!0}){let l=p.useRef(o),s=p.useRef(i);p.useEffect(()=>{l.current=o,s.current=i},[o,i]),D(()=>{if(!e||!t)return;let n=he(e);if(!n)return;let x=l.current,v=s.current,d=Object.assign(C=>x(C),{acceptNode:x}),g=n.createTreeWalker(e,NodeFilter.SHOW_ELEMENT,d,!1);for(;g.nextNode();)v(g.currentNode)},[e,t,l,s])}function me(e,o){let i=p.useRef([]),t=O(e);p.useEffect(()=>{let l=[...i.current];for(let[s,n]of o.entries())if(i.current[s]!==n){let x=t(o,l);return i.current=o,x}},[t,...o])}function Ve(){return/iPhone/gi.test(window.navigator.platform)||/Mac/gi.test(window.navigator.platform)&&window.navigator.maxTouchPoints>0}function $e(){return/Android/gi.test(window.navigator.userAgent)}function qe(){return Ve()||$e()}var je=(e=>(e[e.Open=0]="Open",e[e.Closed=1]="Closed",e))(je||{}),Be=(e=>(e[e.Single=0]="Single",e[e.Multi=1]="Multi",e))(Be||{}),He=(e=>(e[e.Pointer=0]="Pointer",e[e.Other=1]="Other",e))(He||{}),Ue=(e=>(e[e.OpenCombobox=0]="OpenCombobox",e[e.CloseCombobox=1]="CloseCombobox",e[e.GoToOption=2]="GoToOption",e[e.RegisterOption=3]="RegisterOption",e[e.UnregisterOption=4]="UnregisterOption",e[e.RegisterLabel=5]="RegisterLabel",e))(Ue||{});function le(e,o=i=>i){let i=e.activeOptionIndex!==null?e.options[e.activeOptionIndex]:null,t=De(o(e.options.slice()),s=>s.dataRef.current.domRef.current),l=i?t.indexOf(i):null;return l===-1&&(l=null),{options:t,activeOptionIndex:l}}let Xe={[1](e){var o;return(o=e.dataRef.current)!=null&&o.disabled||e.comboboxState===1?e:{...e,activeOptionIndex:null,comboboxState:1}},[0](e){var o;if((o=e.dataRef.current)!=null&&o.disabled||e.comboboxState===0)return e;let i=e.activeOptionIndex;if(e.dataRef.current){let{isSelected:t}=e.dataRef.current,l=e.options.findIndex(s=>t(s.dataRef.current.value));l!==-1&&(i=l)}return{...e,comboboxState:0,activeOptionIndex:i}},[2](e,o){var i,t,l,s;if((i=e.dataRef.current)!=null&&i.disabled||(t=e.dataRef.current)!=null&&t.optionsRef.current&&!((l=e.dataRef.current)!=null&&l.optionsPropsRef.current.static)&&e.comboboxState===1)return e;let n=le(e);if(n.activeOptionIndex===null){let v=n.options.findIndex(d=>!d.dataRef.current.disabled);v!==-1&&(n.activeOptionIndex=v)}let x=Fe(o,{resolveItems:()=>n.options,resolveActiveIndex:()=>n.activeOptionIndex,resolveId:v=>v.id,resolveDisabled:v=>v.dataRef.current.disabled});return{...e,...n,activeOptionIndex:x,activationTrigger:(s=o.trigger)!=null?s:1}},[3]:(e,o)=>{var i,t;let l={id:o.id,dataRef:o.dataRef},s=le(e,x=>[...x,l]);e.activeOptionIndex===null&&(i=e.dataRef.current)!=null&&i.isSelected(o.dataRef.current.value)&&(s.activeOptionIndex=s.options.indexOf(l));let n={...e,...s,activationTrigger:1};return(t=e.dataRef.current)!=null&&t.__demoMode&&e.dataRef.current.value===void 0&&(n.activeOptionIndex=0),n},[4]:(e,o)=>{let i=le(e,t=>{let l=t.findIndex(s=>s.id===o.id);return l!==-1&&t.splice(l,1),t});return{...e,...i,activationTrigger:1}},[5]:(e,o)=>({...e,labelId:o.id})},se=p.createContext(null);se.displayName="ComboboxActionsContext";function W(e){let o=p.useContext(se);if(o===null){let i=new Error(`<${e} /> is missing a parent <Combobox /> component.`);throw Error.captureStackTrace&&Error.captureStackTrace(i,W),i}return o}let ce=p.createContext(null);ce.displayName="ComboboxDataContext";function U(e){let o=p.useContext(ce);if(o===null){let i=new Error(`<${e} /> is missing a parent <Combobox /> component.`);throw Error.captureStackTrace&&Error.captureStackTrace(i,U),i}return o}function Ke(e,o){return j(o.type,Xe,e,o)}let ze=p.Fragment;function Ge(e,o){let{value:i,defaultValue:t,onChange:l,form:s,name:n,by:x=(f,R)=>f===R,disabled:v=!1,__demoMode:d=!1,nullable:g=!1,multiple:C=!1,...r}=e,[a=C?[]:void 0,h]=Re(i,l,t),[c,m]=p.useReducer(Ke,{dataRef:p.createRef(),comboboxState:d?0:1,options:[],activeOptionIndex:null,activationTrigger:1,labelId:null}),T=p.useRef(!1),k=p.useRef({static:!1,hold:!1}),F=p.useRef(null),M=p.useRef(null),A=p.useRef(null),V=p.useRef(null),N=O(typeof x=="string"?(f,R)=>{let S=x;return(f==null?void 0:f[S])===(R==null?void 0:R[S])}:x),X=p.useCallback(f=>j(u.mode,{[1]:()=>a.some(R=>N(R,f)),[0]:()=>N(a,f)}),[a]),u=p.useMemo(()=>({...c,optionsPropsRef:k,labelRef:F,inputRef:M,buttonRef:A,optionsRef:V,value:a,defaultValue:t,disabled:v,mode:C?1:0,get activeOptionIndex(){if(T.current&&c.activeOptionIndex===null&&c.options.length>0){let f=c.options.findIndex(R=>!R.dataRef.current.disabled);if(f!==-1)return f}return c.activeOptionIndex},compare:N,isSelected:X,nullable:g,__demoMode:d}),[a,t,v,C,g,d,c]),P=p.useRef(u.activeOptionIndex!==null?u.options[u.activeOptionIndex]:null);p.useEffect(()=>{let f=u.activeOptionIndex!==null?u.options[u.activeOptionIndex]:null;P.current!==f&&(P.current=f)}),D(()=>{c.dataRef.current=u},[u]),Oe([u.buttonRef,u.inputRef,u.optionsRef],()=>ae.closeCombobox(),u.comboboxState===0);let $=p.useMemo(()=>({open:u.comboboxState===0,disabled:v,activeIndex:u.activeOptionIndex,activeOption:u.activeOptionIndex===null?null:u.options[u.activeOptionIndex].dataRef.current.value,value:a}),[u,v,a]),b=O(f=>{let R=u.options.find(S=>S.id===f);R&&z(R.dataRef.current.value)}),L=O(()=>{if(u.activeOptionIndex!==null){let{dataRef:f,id:R}=u.options[u.activeOptionIndex];z(f.current.value),ae.goToOption(I.Specific,R)}}),E=O(()=>{m({type:0}),T.current=!0}),K=O(()=>{m({type:1}),T.current=!1}),Z=O((f,R,S)=>(T.current=!1,f===I.Specific?m({type:2,focus:I.Specific,id:R,trigger:S}):m({type:2,focus:f,trigger:S}))),J=O((f,R)=>(m({type:3,id:f,dataRef:R}),()=>{var S;((S=P.current)==null?void 0:S.id)===f&&(T.current=!0),m({type:4,id:f})})),Y=O(f=>(m({type:5,id:f}),()=>m({type:5,id:null}))),z=O(f=>j(u.mode,{[0](){return h==null?void 0:h(f)},[1](){let R=u.value.slice(),S=R.findIndex(te=>N(te,f));return S===-1?R.push(f):R.splice(S,1),h==null?void 0:h(R)}})),ae=p.useMemo(()=>({onChange:z,registerOption:J,registerLabel:Y,goToOption:Z,closeCombobox:K,openCombobox:E,selectActiveOption:L,selectOption:b}),[]),xe=o===null?{}:{ref:o},ee=p.useRef(null),ge=ie();return p.useEffect(()=>{ee.current&&t!==void 0&&ge.addEventListener(ee.current,"reset",()=>{z(t)})},[ee,z]),ne.createElement(se.Provider,{value:ae},ne.createElement(ce.Provider,{value:u},ne.createElement(Ce,{value:j(u.comboboxState,{[0]:re.Open,[1]:re.Closed})},n!=null&&a!=null&&Ie({[n]:a}).map(([f,R],S)=>ne.createElement(Se,{features:ye.Hidden,ref:S===0?te=>{var de;ee.current=(de=te==null?void 0:te.closest("form"))!=null?de:null}:void 0,...we({key:f,as:"input",type:"hidden",hidden:!0,readOnly:!0,form:s,name:f,value:R})})),H({ourProps:xe,theirProps:r,slot:$,defaultTag:ze,name:"Combobox"}))))}let Qe="input";function We(e,o){var i,t,l,s;let n=G(),{id:x=`headlessui-combobox-input-${n}`,onChange:v,displayValue:d,type:g="text",...C}=e,r=U("Combobox.Input"),a=W("Combobox.Input"),h=Q(r.inputRef,o),c=p.useRef(!1),m=ie(),T=function(){var b;return typeof d=="function"&&r.value!==void 0?(b=d(r.value))!=null?b:"":typeof r.value=="string"?r.value:""}();me(([b,L],[E,K])=>{c.current||r.inputRef.current&&(K===0&&L===1||b!==E)&&(r.inputRef.current.value=b)},[T,r.comboboxState]),me(([b],[L])=>{if(b===0&&L===1){let E=r.inputRef.current;if(!E)return;let K=E.value,{selectionStart:Z,selectionEnd:J,selectionDirection:Y}=E;E.value="",E.value=K,Y!==null?E.setSelectionRange(Z,J,Y):E.setSelectionRange(Z,J)}},[r.comboboxState]);let k=p.useRef(!1),F=p.useRef(null),M=O(()=>{k.current=!0}),A=O(()=>{m.nextFrame(()=>{k.current=!1,F.current&&(a.openCombobox(),v==null||v(F.current),F.current=null)})}),V=O(b=>{switch(c.current=!0,b.key){case w.Backspace:case w.Delete:if(r.mode!==0||!r.nullable)return;let L=b.currentTarget;m.requestAnimationFrame(()=>{L.value===""&&(a.onChange(null),r.optionsRef.current&&(r.optionsRef.current.scrollTop=0),a.goToOption(I.Nothing))});break;case w.Enter:if(c.current=!1,r.comboboxState!==0||k.current)return;if(b.preventDefault(),b.stopPropagation(),r.activeOptionIndex===null){a.closeCombobox();return}a.selectActiveOption(),r.mode===0&&a.closeCombobox();break;case w.ArrowDown:return c.current=!1,b.preventDefault(),b.stopPropagation(),j(r.comboboxState,{[0]:()=>{a.goToOption(I.Next)},[1]:()=>{a.openCombobox()}});case w.ArrowUp:return c.current=!1,b.preventDefault(),b.stopPropagation(),j(r.comboboxState,{[0]:()=>{a.goToOption(I.Previous)},[1]:()=>{a.openCombobox(),m.nextFrame(()=>{r.value||a.goToOption(I.Last)})}});case w.Home:if(b.shiftKey)break;return c.current=!1,b.preventDefault(),b.stopPropagation(),a.goToOption(I.First);case w.PageUp:return c.current=!1,b.preventDefault(),b.stopPropagation(),a.goToOption(I.First);case w.End:if(b.shiftKey)break;return c.current=!1,b.preventDefault(),b.stopPropagation(),a.goToOption(I.Last);case w.PageDown:return c.current=!1,b.preventDefault(),b.stopPropagation(),a.goToOption(I.Last);case w.Escape:return c.current=!1,r.comboboxState!==0?void 0:(b.preventDefault(),r.optionsRef.current&&!r.optionsPropsRef.current.static&&b.stopPropagation(),a.closeCombobox());case w.Tab:if(c.current=!1,r.comboboxState!==0)return;r.mode===0&&a.selectActiveOption(),a.closeCombobox();break}}),N=O(b=>{if(k.current){F.current=b;return}a.openCombobox(),v==null||v(b)}),X=O(()=>{c.current=!1}),u=ue(()=>{if(r.labelId)return[r.labelId].join(" ")},[r.labelId]),P=p.useMemo(()=>({open:r.comboboxState===0,disabled:r.disabled}),[r]),$={ref:h,id:x,role:"combobox",type:g,"aria-controls":(i=r.optionsRef.current)==null?void 0:i.id,"aria-expanded":r.disabled?void 0:r.comboboxState===0,"aria-activedescendant":r.activeOptionIndex===null||(t=r.options[r.activeOptionIndex])==null?void 0:t.id,"aria-labelledby":u,"aria-autocomplete":"list",defaultValue:(s=(l=e.defaultValue)!=null?l:r.defaultValue!==void 0?d==null?void 0:d(r.defaultValue):null)!=null?s:r.defaultValue,disabled:r.disabled,onCompositionStart:M,onCompositionEnd:A,onKeyDown:V,onChange:N,onBlur:X};return H({ourProps:$,theirProps:C,slot:P,defaultTag:Qe,name:"Combobox.Input"})}let Ze="button";function Je(e,o){var i;let t=U("Combobox.Button"),l=W("Combobox.Button"),s=Q(t.buttonRef,o),n=G(),{id:x=`headlessui-combobox-button-${n}`,...v}=e,d=ie(),g=O(c=>{switch(c.key){case w.ArrowDown:return c.preventDefault(),c.stopPropagation(),t.comboboxState===1&&l.openCombobox(),d.nextFrame(()=>{var m;return(m=t.inputRef.current)==null?void 0:m.focus({preventScroll:!0})});case w.ArrowUp:return c.preventDefault(),c.stopPropagation(),t.comboboxState===1&&(l.openCombobox(),d.nextFrame(()=>{t.value||l.goToOption(I.Last)})),d.nextFrame(()=>{var m;return(m=t.inputRef.current)==null?void 0:m.focus({preventScroll:!0})});case w.Escape:return t.comboboxState!==0?void 0:(c.preventDefault(),t.optionsRef.current&&!t.optionsPropsRef.current.static&&c.stopPropagation(),l.closeCombobox(),d.nextFrame(()=>{var m;return(m=t.inputRef.current)==null?void 0:m.focus({preventScroll:!0})}));default:return}}),C=O(c=>{if(ke(c.currentTarget))return c.preventDefault();t.comboboxState===0?l.closeCombobox():(c.preventDefault(),l.openCombobox()),d.nextFrame(()=>{var m;return(m=t.inputRef.current)==null?void 0:m.focus({preventScroll:!0})})}),r=ue(()=>{if(t.labelId)return[t.labelId,x].join(" ")},[t.labelId,x]),a=p.useMemo(()=>({open:t.comboboxState===0,disabled:t.disabled,value:t.value}),[t]),h={ref:s,id:x,type:Te(e,t.buttonRef),tabIndex:-1,"aria-haspopup":"listbox","aria-controls":(i=t.optionsRef.current)==null?void 0:i.id,"aria-expanded":t.disabled?void 0:t.comboboxState===0,"aria-labelledby":r,disabled:t.disabled,onClick:C,onKeyDown:g};return H({ourProps:h,theirProps:v,slot:a,defaultTag:Ze,name:"Combobox.Button"})}let Ye="label";function et(e,o){let i=G(),{id:t=`headlessui-combobox-label-${i}`,...l}=e,s=U("Combobox.Label"),n=W("Combobox.Label"),x=Q(s.labelRef,o);D(()=>n.registerLabel(t),[t]);let v=O(()=>{var g;return(g=s.inputRef.current)==null?void 0:g.focus({preventScroll:!0})}),d=p.useMemo(()=>({open:s.comboboxState===0,disabled:s.disabled}),[s]);return H({ourProps:{ref:x,id:t,onClick:v},theirProps:l,slot:d,defaultTag:Ye,name:"Combobox.Label"})}let tt="ul",ot=be.RenderStrategy|be.Static;function nt(e,o){let i=G(),{id:t=`headlessui-combobox-options-${i}`,hold:l=!1,...s}=e,n=U("Combobox.Options"),x=Q(n.optionsRef,o),v=Pe(),d=(()=>v!==null?(v&re.Open)===re.Open:n.comboboxState===0)();D(()=>{var a;n.optionsPropsRef.current.static=(a=e.static)!=null?a:!1},[n.optionsPropsRef,e.static]),D(()=>{n.optionsPropsRef.current.hold=l},[n.optionsPropsRef,l]),Ae({container:n.optionsRef.current,enabled:n.comboboxState===0,accept(a){return a.getAttribute("role")==="option"?NodeFilter.FILTER_REJECT:a.hasAttribute("role")?NodeFilter.FILTER_SKIP:NodeFilter.FILTER_ACCEPT},walk(a){a.setAttribute("role","none")}});let g=ue(()=>{var a,h;return(h=n.labelId)!=null?h:(a=n.buttonRef.current)==null?void 0:a.id},[n.labelId,n.buttonRef.current]),C=p.useMemo(()=>({open:n.comboboxState===0}),[n]),r={"aria-labelledby":g,role:"listbox","aria-multiselectable":n.mode===1?!0:void 0,id:t,ref:x};return H({ourProps:r,theirProps:s,slot:C,defaultTag:tt,features:ot,visible:d,name:"Combobox.Options"})}let rt="li";function at(e,o){var i,t;let l=G(),{id:s=`headlessui-combobox-option-${l}`,disabled:n=!1,value:x,...v}=e,d=U("Combobox.Option"),g=W("Combobox.Option"),C=d.activeOptionIndex!==null?d.options[d.activeOptionIndex].id===s:!1,r=d.isSelected(x),a=p.useRef(null),h=Ee({disabled:n,value:x,domRef:a,textValue:(t=(i=a.current)==null?void 0:i.textContent)==null?void 0:t.toLowerCase()}),c=Q(o,a),m=O(()=>g.selectOption(s));D(()=>g.registerOption(s,h),[h,s]);let T=p.useRef(!d.__demoMode);D(()=>{if(!d.__demoMode)return;let u=fe();return u.requestAnimationFrame(()=>{T.current=!0}),u.dispose},[]),D(()=>{if(d.comboboxState!==0||!C||!T.current||d.activationTrigger===0)return;let u=fe();return u.requestAnimationFrame(()=>{var P,$;($=(P=a.current)==null?void 0:P.scrollIntoView)==null||$.call(P,{block:"nearest"})}),u.dispose},[a,C,d.comboboxState,d.activationTrigger,d.activeOptionIndex]);let k=O(u=>{if(n)return u.preventDefault();m(),d.mode===0&&g.closeCombobox(),qe()||requestAnimationFrame(()=>{var P;return(P=d.inputRef.current)==null?void 0:P.focus()})}),F=O(()=>{if(n)return g.goToOption(I.Nothing);g.goToOption(I.Specific,s)}),M=Ne(),A=O(u=>M.update(u)),V=O(u=>{M.wasMoved(u)&&(n||C||g.goToOption(I.Specific,s,0))}),N=O(u=>{M.wasMoved(u)&&(n||C&&(d.optionsPropsRef.current.hold||g.goToOption(I.Nothing)))}),X=p.useMemo(()=>({active:C,selected:r,disabled:n}),[C,r,n]);return H({ourProps:{id:s,ref:c,role:"option",tabIndex:n===!0?void 0:-1,"aria-disabled":n===!0?!0:void 0,"aria-selected":r,disabled:void 0,onClick:k,onFocus:F,onPointerEnter:A,onMouseEnter:A,onPointerMove:V,onMouseMove:V,onPointerLeave:N,onMouseLeave:N},theirProps:v,slot:X,defaultTag:rt,name:"Combobox.Option"})}let lt=B(Ge),it=B(Je),ut=B(We),st=B(et),ct=B(nt),dt=B(at),q=Object.assign(lt,{Input:ut,Button:it,Label:st,Options:ct,Option:dt});const mt=["base","xl"],ve=({label:e,options:o,name:i,size:t="base",value:l=o[0],openOnFocus:s=!0,block:n=!1,labelHidden:x=!1,...v})=>{const[d,g]=p.useState(""),C=d===""?o:o.filter(h=>h.label.toLowerCase().includes(d.toLowerCase())),r=h=>g(h.target.value),a=h=>(h==null?void 0:h.label)||l.label;return y(q,{...v,children:({open:h})=>oe(pe,{children:[y(q.Label,{className:_("block","font-medium","text-gray-700","mb-1",{"sr-only":x}),children:e}),oe("div",{className:_("relative","cursor-default","rounded-lg","border","inline-flex","items-center","border-gray-300","bg-white","text-left","transition","hover:shadow-lg","hover:shadow-gray-200",`text-${t}`,{"w-full":n}),children:[(l==null?void 0:l.image)&&y("img",{src:l.image.src,alt:"",className:"ml-3 h-6 w-6 flex-shrink-0 rounded-full object-cover"}),y(q.Input,{className:_("border-none","p-3","pl-3","pr-10","bg-transparent","text-gray-900","focus:ring-0",`text-${t}`,{"w-full":n}),displayValue:a,onChange:r}),y(q.Button,{className:"absolute inset-y-0 right-0 flex items-center pr-2",children:y(Me,{className:"h-5 w-5 text-gray-400","aria-hidden":"true"})})]}),y(Le,{show:h,as:p.Fragment,leave:"transition ease-in duration-100",leaveFrom:"opacity-100",leaveTo:"opacity-0",afterLeave:()=>g(""),children:y(q.Options,{static:!0,className:_("absolute","z-10","mt-1","max-h-56","overflow-auto","rounded-lg","bg-white","py-1","shadow-lg","ring-1","ring-black","ring-opacity-5","focus:outline-none",`text-${t}`,{"w-full":n}),children:C.length===0&&d!==""?y("div",{className:"relative cursor-default select-none py-2 px-4 text-gray-700",children:"Nothing found."}):C.map(c=>y(q.Option,{className:({active:m})=>_(m?"text-white bg-so-color-accent-2-primary-500":"text-gray-900","relative cursor-default select-none py-2 pl-3 pr-12"),value:c,children:({selected:m,active:T})=>oe(pe,{children:[oe("div",{className:"flex items-center",children:[(c==null?void 0:c.image)&&y("img",{src:c.image.src,alt:"",className:"h-6 w-6 flex-shrink-0 rounded-full object-cover"}),y("span",{className:_(T?"font-semibold":"font-normal","truncate",{"ml-3":l.image}),children:c.label})]}),m&&y("span",{className:_("absolute inset-y-0 right-0 flex items-center pr-4"),children:y(_e,{className:"h-5 w-5","aria-hidden":"true"})})]})},c.label))})})]})})};try{ve.displayName="SoCombobox",ve.__docgenInfo={description:"Comboboxes are the foundation of accessible autocompletes and command palettes, complete with robust support for keyboard navigation.\nUse the `SoCombobox` instead of the `SoSelect` whenever you have more than only a couple of options. The Combobox allows a more fine\ngrained search over all options compared to the select.",displayName:"SoCombobox",props:{label:{defaultValue:null,description:"The select's label elements",name:"label",required:!0,type:{name:"string"}},options:{defaultValue:null,description:"Options available for selection",name:"options",required:!0,type:{name:"SoComboboxItem[]"}},value:{defaultValue:{value:"options[0]"},description:"The selected/current value",name:"value",required:!1,type:{name:"SoComboboxItem"}},onChange:{defaultValue:null,description:"Emits the selected value on change",name:"onChange",required:!1,type:{name:"(value: SoComboboxItem) => void"}},openOnFocus:{defaultValue:{value:"true"},description:"If true, the options get visible when the user focuses the text field",name:"openOnFocus",required:!1,type:{name:"boolean"}},block:{defaultValue:{value:"false"},description:"Render full width",name:"block",required:!1,type:{name:"boolean"}},labelHidden:{defaultValue:{value:"false"},description:"If true, the label is visually hidden. It will still be available to screenreaders.",name:"labelHidden",required:!1,type:{name:"boolean"}},size:{defaultValue:{value:"base"},description:"Visual size of the button",name:"size",required:!1,type:{name:"enum",value:[{value:'"base"'},{value:'"xl"'}]}},disabled:{defaultValue:null,description:"",name:"disabled",required:!1,type:{name:"boolean"}},name:{defaultValue:null,description:"",name:"name",required:!1,type:{name:"string"}}}}}catch{}export{ve as S,mt as a};
//# sourceMappingURL=Combobox-7e61ab90.js.map
