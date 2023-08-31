import{j as I,a as oe,F as me,c as D}from"./index-83d39615.js";import{r as p,R as ne}from"./index-5ac02154.js";import{l as L,j as Ie,o as O,S as ve,D as H,T as Ee,u as j,h as Ne,p as ce,c as $e,d as ae,e as Ve,f as Fe,g as _e,R as Le,X as U,I as Z,y as Q,i as de,s as De,C as ke,k as Me,m as Ae,n as S,q as E,r as qe,t as xe,x as Be,v as je,w as He,z as Ue,A as Ke}from"./ChevronDownIcon-02a3726d.js";import"./_commonjsHelpers-725317a4.js";function ze({container:e,accept:o,walk:i,enabled:t=!0}){let a=p.useRef(o),u=p.useRef(i);p.useEffect(()=>{a.current=o,u.current=i},[o,i]),L(()=>{if(!e||!t)return;let r=Ie(e);if(!r)return;let v=a.current,x=u.current,c=Object.assign(R=>v(R),{acceptNode:v}),h=r.createTreeWalker(e,NodeFilter.SHOW_ELEMENT,c,!1);for(;h.nextNode();)x(h.currentNode)},[e,t,a,u])}function ge(e,o){let i=p.useRef([]),t=O(e);p.useEffect(()=>{let a=[...i.current];for(let[u,r]of o.entries())if(i.current[u]!==r){let v=t(o,a);return i.current=o,v}},[t,...o])}function We(){return/iPhone/gi.test(window.navigator.platform)||/Mac/gi.test(window.navigator.platform)&&window.navigator.maxTouchPoints>0}function Ge(){return/Android/gi.test(window.navigator.userAgent)}function Je(){return We()||Ge()}function Xe(...e){return p.useMemo(()=>Ie(...e),[...e])}var Ze=(e=>(e[e.Open=0]="Open",e[e.Closed=1]="Closed",e))(Ze||{}),Qe=(e=>(e[e.Single=0]="Single",e[e.Multi=1]="Multi",e))(Qe||{}),Ye=(e=>(e[e.Pointer=0]="Pointer",e[e.Other=1]="Other",e))(Ye||{}),et=(e=>(e[e.OpenCombobox=0]="OpenCombobox",e[e.CloseCombobox=1]="CloseCombobox",e[e.GoToOption=2]="GoToOption",e[e.RegisterOption=3]="RegisterOption",e[e.UnregisterOption=4]="UnregisterOption",e[e.RegisterLabel=5]="RegisterLabel",e))(et||{});function se(e,o=i=>i){let i=e.activeOptionIndex!==null?e.options[e.activeOptionIndex]:null,t=je(o(e.options.slice()),u=>u.dataRef.current.domRef.current),a=i?t.indexOf(i):null;return a===-1&&(a=null),{options:t,activeOptionIndex:a}}let tt={1(e){var o;return(o=e.dataRef.current)!=null&&o.disabled||e.comboboxState===1?e:{...e,activeOptionIndex:null,comboboxState:1}},0(e){var o;if((o=e.dataRef.current)!=null&&o.disabled||e.comboboxState===0)return e;let i=e.activeOptionIndex;if(e.dataRef.current){let{isSelected:t}=e.dataRef.current,a=e.options.findIndex(u=>t(u.dataRef.current.value));a!==-1&&(i=a)}return{...e,comboboxState:0,activeOptionIndex:i}},2(e,o){var i,t,a,u;if((i=e.dataRef.current)!=null&&i.disabled||(t=e.dataRef.current)!=null&&t.optionsRef.current&&!((a=e.dataRef.current)!=null&&a.optionsPropsRef.current.static)&&e.comboboxState===1)return e;let r=se(e);if(r.activeOptionIndex===null){let x=r.options.findIndex(c=>!c.dataRef.current.disabled);x!==-1&&(r.activeOptionIndex=x)}let v=Be(o,{resolveItems:()=>r.options,resolveActiveIndex:()=>r.activeOptionIndex,resolveId:x=>x.id,resolveDisabled:x=>x.dataRef.current.disabled});return{...e,...r,activeOptionIndex:v,activationTrigger:(u=o.trigger)!=null?u:1}},3:(e,o)=>{var i,t;let a={id:o.id,dataRef:o.dataRef},u=se(e,v=>[...v,a]);e.activeOptionIndex===null&&(i=e.dataRef.current)!=null&&i.isSelected(o.dataRef.current.value)&&(u.activeOptionIndex=u.options.indexOf(a));let r={...e,...u,activationTrigger:1};return(t=e.dataRef.current)!=null&&t.__demoMode&&e.dataRef.current.value===void 0&&(r.activeOptionIndex=0),r},4:(e,o)=>{let i=se(e,t=>{let a=t.findIndex(u=>u.id===o.id);return a!==-1&&t.splice(a,1),t});return{...e,...i,activationTrigger:1}},5:(e,o)=>({...e,labelId:o.id})},pe=p.createContext(null);pe.displayName="ComboboxActionsContext";function Y(e){let o=p.useContext(pe);if(o===null){let i=new Error(`<${e} /> is missing a parent <Combobox /> component.`);throw Error.captureStackTrace&&Error.captureStackTrace(i,Y),i}return o}let be=p.createContext(null);be.displayName="ComboboxDataContext";function K(e){let o=p.useContext(be);if(o===null){let i=new Error(`<${e} /> is missing a parent <Combobox /> component.`);throw Error.captureStackTrace&&Error.captureStackTrace(i,K),i}return o}function ot(e,o){return j(o.type,tt,e,o)}let nt=p.Fragment;function rt(e,o){let{value:i,defaultValue:t,onChange:a,form:u,name:r,by:v=(f,C)=>f===C,disabled:x=!1,__demoMode:c=!1,nullable:h=!1,multiple:R=!1,...n}=e,[l=R?[]:void 0,g]=Ee(i,a,t),[b,d]=p.useReducer(ot,{dataRef:p.createRef(),comboboxState:c?0:1,options:[],activeOptionIndex:null,activationTrigger:1,labelId:null}),w=p.useRef(!1),k=p.useRef({static:!1,hold:!1}),z=p.useRef(null),$=p.useRef(null),M=p.useRef(null),A=p.useRef(null),V=O(typeof v=="string"?(f,C)=>{let y=v;return(f==null?void 0:f[y])===(C==null?void 0:C[y])}:v),W=p.useCallback(f=>j(s.mode,{1:()=>l.some(C=>V(C,f)),0:()=>V(l,f)}),[l]),s=p.useMemo(()=>({...b,optionsPropsRef:k,labelRef:z,inputRef:$,buttonRef:M,optionsRef:A,value:l,defaultValue:t,disabled:x,mode:R?1:0,get activeOptionIndex(){if(w.current&&b.activeOptionIndex===null&&b.options.length>0){let f=b.options.findIndex(C=>!C.dataRef.current.disabled);if(f!==-1)return f}return b.activeOptionIndex},compare:V,isSelected:W,nullable:h,__demoMode:c}),[l,t,x,R,h,c,b]),T=p.useRef(s.activeOptionIndex!==null?s.options[s.activeOptionIndex]:null);p.useEffect(()=>{let f=s.activeOptionIndex!==null?s.options[s.activeOptionIndex]:null;T.current!==f&&(T.current=f)}),L(()=>{b.dataRef.current=s},[s]),Ne([s.buttonRef,s.inputRef,s.optionsRef],()=>ue.closeCombobox(),s.comboboxState===0);let q=p.useMemo(()=>({open:s.comboboxState===0,disabled:x,activeIndex:s.activeOptionIndex,activeOption:s.activeOptionIndex===null?null:s.options[s.activeOptionIndex].dataRef.current.value,value:l}),[s,x,l]),ie=O(f=>{let C=s.options.find(y=>y.id===f);C&&F(C.dataRef.current.value)}),m=O(()=>{if(s.activeOptionIndex!==null){let{dataRef:f,id:C}=s.options[s.activeOptionIndex];F(f.current.value),ue.goToOption(S.Specific,C)}}),G=O(()=>{d({type:0}),w.current=!0}),N=O(()=>{d({type:1}),w.current=!1}),J=O((f,C,y)=>(w.current=!1,f===S.Specific?d({type:2,focus:S.Specific,id:C,trigger:y}):d({type:2,focus:f,trigger:y}))),P=O((f,C)=>(d({type:3,id:f,dataRef:C}),()=>{var y;((y=T.current)==null?void 0:y.id)===f&&(w.current=!0),d({type:4,id:f})})),_=O(f=>(d({type:5,id:f}),()=>d({type:5,id:null}))),F=O(f=>j(s.mode,{0(){return g==null?void 0:g(f)},1(){let C=s.value.slice(),y=C.findIndex(te=>V(te,f));return y===-1?C.push(f):C.splice(y,1),g==null?void 0:g(C)}})),ue=p.useMemo(()=>({onChange:F,registerOption:P,registerLabel:_,goToOption:J,closeCombobox:N,openCombobox:G,selectActiveOption:m,selectOption:ie}),[]),Pe=o===null?{}:{ref:o},ee=p.useRef(null),Te=ce();return p.useEffect(()=>{ee.current&&t!==void 0&&Te.addEventListener(ee.current,"reset",()=>{g==null||g(t)})},[ee,g]),ne.createElement(pe.Provider,{value:ue},ne.createElement(be.Provider,{value:s},ne.createElement($e,{value:j(s.comboboxState,{0:ae.Open,1:ae.Closed})},r!=null&&l!=null&&Ve({[r]:l}).map(([f,C],y)=>ne.createElement(Fe,{features:_e.Hidden,ref:y===0?te=>{var fe;ee.current=(fe=te==null?void 0:te.closest("form"))!=null?fe:null}:void 0,...Le({key:f,as:"input",type:"hidden",hidden:!0,readOnly:!0,form:u,name:f,value:C})})),U({ourProps:Pe,theirProps:n,slot:q,defaultTag:nt,name:"Combobox"}))))}let at="input";function lt(e,o){var i,t,a,u;let r=Z(),{id:v=`headlessui-combobox-input-${r}`,onChange:x,displayValue:c,type:h="text",...R}=e,n=K("Combobox.Input"),l=Y("Combobox.Input"),g=Q(n.inputRef,o),b=Xe(n.inputRef),d=p.useRef(!1),w=ce(),k=O(()=>{l.onChange(null),n.optionsRef.current&&(n.optionsRef.current.scrollTop=0),l.goToOption(S.Nothing)}),z=function(){var m;return typeof c=="function"&&n.value!==void 0?(m=c(n.value))!=null?m:"":typeof n.value=="string"?n.value:""}();ge(([m,G],[N,J])=>{if(d.current)return;let P=n.inputRef.current;P&&((J===0&&G===1||m!==N)&&(P.value=m),requestAnimationFrame(()=>{if(d.current||!P||(b==null?void 0:b.activeElement)!==P)return;let{selectionStart:_,selectionEnd:F}=P;Math.abs((F??0)-(_??0))===0&&_===0&&P.setSelectionRange(P.value.length,P.value.length)}))},[z,n.comboboxState,b]),ge(([m],[G])=>{if(m===0&&G===1){if(d.current)return;let N=n.inputRef.current;if(!N)return;let J=N.value,{selectionStart:P,selectionEnd:_,selectionDirection:F}=N;N.value="",N.value=J,F!==null?N.setSelectionRange(P,_,F):N.setSelectionRange(P,_)}},[n.comboboxState]);let $=p.useRef(!1),M=O(()=>{$.current=!0}),A=O(()=>{w.nextFrame(()=>{$.current=!1})}),V=O(m=>{switch(d.current=!0,m.key){case E.Enter:if(d.current=!1,n.comboboxState!==0||$.current)return;if(m.preventDefault(),m.stopPropagation(),n.activeOptionIndex===null){l.closeCombobox();return}l.selectActiveOption(),n.mode===0&&l.closeCombobox();break;case E.ArrowDown:return d.current=!1,m.preventDefault(),m.stopPropagation(),j(n.comboboxState,{0:()=>{l.goToOption(S.Next)},1:()=>{l.openCombobox()}});case E.ArrowUp:return d.current=!1,m.preventDefault(),m.stopPropagation(),j(n.comboboxState,{0:()=>{l.goToOption(S.Previous)},1:()=>{l.openCombobox(),w.nextFrame(()=>{n.value||l.goToOption(S.Last)})}});case E.Home:if(m.shiftKey)break;return d.current=!1,m.preventDefault(),m.stopPropagation(),l.goToOption(S.First);case E.PageUp:return d.current=!1,m.preventDefault(),m.stopPropagation(),l.goToOption(S.First);case E.End:if(m.shiftKey)break;return d.current=!1,m.preventDefault(),m.stopPropagation(),l.goToOption(S.Last);case E.PageDown:return d.current=!1,m.preventDefault(),m.stopPropagation(),l.goToOption(S.Last);case E.Escape:return d.current=!1,n.comboboxState!==0?void 0:(m.preventDefault(),n.optionsRef.current&&!n.optionsPropsRef.current.static&&m.stopPropagation(),n.nullable&&n.mode===0&&n.value===null&&k(),l.closeCombobox());case E.Tab:if(d.current=!1,n.comboboxState!==0)return;n.mode===0&&l.selectActiveOption(),l.closeCombobox();break}}),W=O(m=>{x==null||x(m),n.nullable&&n.mode===0&&m.target.value===""&&k(),l.openCombobox()}),s=O(()=>{d.current=!1}),T=de(()=>{if(n.labelId)return[n.labelId].join(" ")},[n.labelId]),q=p.useMemo(()=>({open:n.comboboxState===0,disabled:n.disabled}),[n]),ie={ref:g,id:v,role:"combobox",type:h,"aria-controls":(i=n.optionsRef.current)==null?void 0:i.id,"aria-expanded":n.comboboxState===0,"aria-activedescendant":n.activeOptionIndex===null||(t=n.options[n.activeOptionIndex])==null?void 0:t.id,"aria-labelledby":T,"aria-autocomplete":"list",defaultValue:(u=(a=e.defaultValue)!=null?a:n.defaultValue!==void 0?c==null?void 0:c(n.defaultValue):null)!=null?u:n.defaultValue,disabled:n.disabled,onCompositionStart:M,onCompositionEnd:A,onKeyDown:V,onChange:W,onBlur:s};return U({ourProps:ie,theirProps:R,slot:q,defaultTag:at,name:"Combobox.Input"})}let it="button";function ut(e,o){var i;let t=K("Combobox.Button"),a=Y("Combobox.Button"),u=Q(t.buttonRef,o),r=Z(),{id:v=`headlessui-combobox-button-${r}`,...x}=e,c=ce(),h=O(b=>{switch(b.key){case E.ArrowDown:return b.preventDefault(),b.stopPropagation(),t.comboboxState===1&&a.openCombobox(),c.nextFrame(()=>{var d;return(d=t.inputRef.current)==null?void 0:d.focus({preventScroll:!0})});case E.ArrowUp:return b.preventDefault(),b.stopPropagation(),t.comboboxState===1&&(a.openCombobox(),c.nextFrame(()=>{t.value||a.goToOption(S.Last)})),c.nextFrame(()=>{var d;return(d=t.inputRef.current)==null?void 0:d.focus({preventScroll:!0})});case E.Escape:return t.comboboxState!==0?void 0:(b.preventDefault(),t.optionsRef.current&&!t.optionsPropsRef.current.static&&b.stopPropagation(),a.closeCombobox(),c.nextFrame(()=>{var d;return(d=t.inputRef.current)==null?void 0:d.focus({preventScroll:!0})}));default:return}}),R=O(b=>{if(qe(b.currentTarget))return b.preventDefault();t.comboboxState===0?a.closeCombobox():(b.preventDefault(),a.openCombobox()),c.nextFrame(()=>{var d;return(d=t.inputRef.current)==null?void 0:d.focus({preventScroll:!0})})}),n=de(()=>{if(t.labelId)return[t.labelId,v].join(" ")},[t.labelId,v]),l=p.useMemo(()=>({open:t.comboboxState===0,disabled:t.disabled,value:t.value}),[t]),g={ref:u,id:v,type:De(e,t.buttonRef),tabIndex:-1,"aria-haspopup":"listbox","aria-controls":(i=t.optionsRef.current)==null?void 0:i.id,"aria-expanded":t.comboboxState===0,"aria-labelledby":n,disabled:t.disabled,onClick:R,onKeyDown:h};return U({ourProps:g,theirProps:x,slot:l,defaultTag:it,name:"Combobox.Button"})}let st="label";function ct(e,o){let i=Z(),{id:t=`headlessui-combobox-label-${i}`,...a}=e,u=K("Combobox.Label"),r=Y("Combobox.Label"),v=Q(u.labelRef,o);L(()=>r.registerLabel(t),[t]);let x=O(()=>{var h;return(h=u.inputRef.current)==null?void 0:h.focus({preventScroll:!0})}),c=p.useMemo(()=>({open:u.comboboxState===0,disabled:u.disabled}),[u]);return U({ourProps:{ref:v,id:t,onClick:x},theirProps:a,slot:c,defaultTag:st,name:"Combobox.Label"})}let dt="ul",pt=ve.RenderStrategy|ve.Static;function bt(e,o){let i=Z(),{id:t=`headlessui-combobox-options-${i}`,hold:a=!1,...u}=e,r=K("Combobox.Options"),v=Q(r.optionsRef,o),x=ke(),c=(()=>x!==null?(x&ae.Open)===ae.Open:r.comboboxState===0)();L(()=>{var l;r.optionsPropsRef.current.static=(l=e.static)!=null?l:!1},[r.optionsPropsRef,e.static]),L(()=>{r.optionsPropsRef.current.hold=a},[r.optionsPropsRef,a]),ze({container:r.optionsRef.current,enabled:r.comboboxState===0,accept(l){return l.getAttribute("role")==="option"?NodeFilter.FILTER_REJECT:l.hasAttribute("role")?NodeFilter.FILTER_SKIP:NodeFilter.FILTER_ACCEPT},walk(l){l.setAttribute("role","none")}});let h=de(()=>{var l,g;return(g=r.labelId)!=null?g:(l=r.buttonRef.current)==null?void 0:l.id},[r.labelId,r.buttonRef.current]),R=p.useMemo(()=>({open:r.comboboxState===0}),[r]),n={"aria-labelledby":h,role:"listbox","aria-multiselectable":r.mode===1?!0:void 0,id:t,ref:v};return U({ourProps:n,theirProps:u,slot:R,defaultTag:dt,features:pt,visible:c,name:"Combobox.Options"})}let ft="li";function mt(e,o){var i,t;let a=Z(),{id:u=`headlessui-combobox-option-${a}`,disabled:r=!1,value:v,...x}=e,c=K("Combobox.Option"),h=Y("Combobox.Option"),R=c.activeOptionIndex!==null?c.options[c.activeOptionIndex].id===u:!1,n=c.isSelected(v),l=p.useRef(null),g=Me({disabled:r,value:v,domRef:l,textValue:(t=(i=l.current)==null?void 0:i.textContent)==null?void 0:t.toLowerCase()}),b=Q(o,l),d=O(()=>h.selectOption(u));L(()=>h.registerOption(u,g),[g,u]);let w=p.useRef(!c.__demoMode);L(()=>{if(!c.__demoMode)return;let s=xe();return s.requestAnimationFrame(()=>{w.current=!0}),s.dispose},[]),L(()=>{if(c.comboboxState!==0||!R||!w.current||c.activationTrigger===0)return;let s=xe();return s.requestAnimationFrame(()=>{var T,q;(q=(T=l.current)==null?void 0:T.scrollIntoView)==null||q.call(T,{block:"nearest"})}),s.dispose},[l,R,c.comboboxState,c.activationTrigger,c.activeOptionIndex]);let k=O(s=>{if(r)return s.preventDefault();d(),c.mode===0&&h.closeCombobox(),Je()||requestAnimationFrame(()=>{var T;return(T=c.inputRef.current)==null?void 0:T.focus()})}),z=O(()=>{if(r)return h.goToOption(S.Nothing);h.goToOption(S.Specific,u)}),$=Ae(),M=O(s=>$.update(s)),A=O(s=>{$.wasMoved(s)&&(r||R||h.goToOption(S.Specific,u,0))}),V=O(s=>{$.wasMoved(s)&&(r||R&&(c.optionsPropsRef.current.hold||h.goToOption(S.Nothing)))}),W=p.useMemo(()=>({active:R,selected:n,disabled:r}),[R,n,r]);return U({ourProps:{id:u,ref:b,role:"option",tabIndex:r===!0?void 0:-1,"aria-disabled":r===!0?!0:void 0,"aria-selected":n,disabled:void 0,onClick:k,onFocus:z,onPointerEnter:M,onMouseEnter:M,onPointerMove:A,onMouseMove:A,onPointerLeave:V,onMouseLeave:V},theirProps:x,slot:W,defaultTag:ft,name:"Combobox.Option"})}let vt=H(rt),xt=H(ut),gt=H(lt),ht=H(ct),Ot=H(bt),Ct=H(mt),B=Object.assign(vt,{Input:gt,Button:xt,Label:ht,Options:Ot,Option:Ct});const Rt=["base","xl"],le=({label:e,options:o,name:i,size:t="base",value:a=o[0],openOnFocus:u=!0,block:r=!1,labelHidden:v=!1,...x})=>{const[c,h]=p.useState(""),R=c===""?o:o.filter(g=>g.label.toLowerCase().includes(c.toLowerCase())),n=g=>h(g.target.value),l=g=>(g==null?void 0:g.label)||a.label;return I(B,{...x,children:({open:g})=>oe(me,{children:[I(B.Label,{className:D("block","font-medium","text-gray-700","mb-1",{"sr-only":v}),children:e}),oe("div",{className:D("relative","cursor-default","rounded-lg","border","inline-flex","items-center","border-gray-300","bg-white","text-left","transition","hover:shadow-lg","hover:shadow-gray-200",`text-${t}`,{"w-full":r}),children:[(a==null?void 0:a.image)&&I("img",{src:a.image.src,alt:"",className:"ml-3 h-6 w-6 flex-shrink-0 rounded-full object-cover"}),I(B.Input,{className:D("border-none","p-3","pl-3","pr-10","bg-transparent","text-gray-900","focus:ring-0",`text-${t}`,{"w-full":r}),displayValue:l,onChange:n}),I(B.Button,{className:"absolute inset-y-0 right-0 flex items-center pr-2",children:I(He,{className:"h-5 w-5 text-gray-400","aria-hidden":"true"})})]}),I(Ue,{show:g,as:p.Fragment,leave:"transition ease-in duration-100",leaveFrom:"opacity-100",leaveTo:"opacity-0",afterLeave:()=>h(""),children:I(B.Options,{static:!0,className:D("absolute","z-10","mt-1","max-h-56","overflow-auto","rounded-lg","bg-white","py-1","shadow-lg","ring-1","ring-black","ring-opacity-5","focus:outline-none",`text-${t}`,{"w-full":r}),children:R.length===0&&c!==""?I("div",{className:"relative cursor-default select-none px-4 py-2 text-gray-700",children:"Nothing found."}):R.map(b=>I(B.Option,{className:({active:d})=>D(d?"bg-so-color-accent-2-primary-500 text-white":"text-gray-900","relative cursor-default select-none py-2 pl-3 pr-12"),value:b,children:({selected:d,active:w})=>oe(me,{children:[oe("div",{className:"flex items-center",children:[(b==null?void 0:b.image)&&I("img",{src:b.image.src,alt:"",className:"h-6 w-6 flex-shrink-0 rounded-full object-cover"}),I("span",{className:D(w?"font-semibold":"font-normal","truncate",{"ml-3":!!a.image}),children:b.label})]}),d&&I("span",{className:D("absolute inset-y-0 right-0 flex items-center pr-4"),children:I(Ke,{className:"h-5 w-5","aria-hidden":"true"})})]})},b.label))})})]})})};try{le.displayName="SoCombobox",le.__docgenInfo={description:"Comboboxes are the foundation of accessible autocompletes and command palettes, complete with robust support for keyboard navigation.\nUse the `SoCombobox` instead of the `SoSelect` whenever you have more than only a couple of options. The Combobox allows a more fine\ngrained search over all options compared to the select.",displayName:"SoCombobox",props:{label:{defaultValue:null,description:"The select's label elements",name:"label",required:!0,type:{name:"string"}},options:{defaultValue:null,description:"Options available for selection",name:"options",required:!0,type:{name:"SoComboboxItem[]"}},value:{defaultValue:{value:"options[0]"},description:"The selected/current value",name:"value",required:!1,type:{name:"SoComboboxItem"}},openOnFocus:{defaultValue:{value:"true"},description:"If true, the options get visible when the user focuses the text field",name:"openOnFocus",required:!1,type:{name:"boolean"}},block:{defaultValue:{value:"false"},description:"Render full width",name:"block",required:!1,type:{name:"boolean"}},labelHidden:{defaultValue:{value:"false"},description:"If true, the label is visually hidden. It will still be available to screenreaders.",name:"labelHidden",required:!1,type:{name:"boolean"}},size:{defaultValue:{value:"base"},description:"Visual size of the button",name:"size",required:!1,type:{name:"enum",value:[{value:'"base"'},{value:'"xl"'}]}},onChange:{defaultValue:null,description:"Emits the selected value on change",name:"onChange",required:!1,type:{name:"(value: SoComboboxItem) => void"}},name:{defaultValue:null,description:"",name:"name",required:!1,type:{name:"string"}},disabled:{defaultValue:null,description:"",name:"disabled",required:!1,type:{name:"boolean"}}}}}catch{}const Pt={component:le,argTypes:{block:{defaultValue:!1,description:"If true, the control will be rendered with 100% width",control:{type:"boolean"}},labelHidden:{defaultValue:!1,description:"If true, the label is only available to screenreaders, but visually hidden.",control:{type:"boolean"}},size:{defaultValue:"base",options:Rt,control:{type:"select"}}}},we=e=>{const o=(e==null?void 0:e.options)||[{label:"Option 1"},{label:"Option 2"},{label:"Option 3"}],[i,t]=p.useState(o[0]),a={label:"Select Label",value:i,options:o,...e,onChange:u=>{t(u)}};return I(le,{...a})},re=we.bind({}),X=we.bind({});X.args={label:"Country Selector Example",options:[{label:"Option 1",image:{src:"ch.svg"}},{label:"Option 2",image:{src:"ch.svg"}},{label:"Option 3",image:{src:"ch.svg"}}]};var he,Oe,Ce;re.parameters={...re.parameters,docs:{...(he=re.parameters)==null?void 0:he.docs,source:{originalSource:`(args: Partial<SoComboboxProps>) => {
  const options: SoComboboxProps['options'] = args?.options || [{
    label: 'Option 1'
  }, {
    label: 'Option 2'
  }, {
    label: 'Option 3'
  }];
  const [value, setValue] = useState(options[0]);
  const props: SoComboboxProps = {
    label: 'Select Label',
    value,
    options,
    ...args,
    onChange: selectedItem => {
      setValue(selectedItem);
    }
  };
  return <SoCombobox {...props} />;
}`,...(Ce=(Oe=re.parameters)==null?void 0:Oe.docs)==null?void 0:Ce.source}}};var Re,Se,ye;X.parameters={...X.parameters,docs:{...(Re=X.parameters)==null?void 0:Re.docs,source:{originalSource:`(args: Partial<SoComboboxProps>) => {
  const options: SoComboboxProps['options'] = args?.options || [{
    label: 'Option 1'
  }, {
    label: 'Option 2'
  }, {
    label: 'Option 3'
  }];
  const [value, setValue] = useState(options[0]);
  const props: SoComboboxProps = {
    label: 'Select Label',
    value,
    options,
    ...args,
    onChange: selectedItem => {
      setValue(selectedItem);
    }
  };
  return <SoCombobox {...props} />;
}`,...(ye=(Se=X.parameters)==null?void 0:Se.docs)==null?void 0:ye.source}}};const Tt=["Standard","WithImages"];export{re as Standard,X as WithImages,Tt as __namedExportsOrder,Pt as default};
//# sourceMappingURL=Combobox.stories-c9cbc59f.js.map
