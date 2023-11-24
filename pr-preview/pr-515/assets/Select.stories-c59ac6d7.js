import{j as I,a as k,F as re,c as D}from"./index-cabaec6b.js";import{r as c,R as H}from"./index-37ba2b57.js";import{o as b,S as oe,D as A,y as M,T as $e,u as E,l as G,h as Ce,a as De,b as ke,p as K,c as Ee,d as W,e as Fe,f as Ne,g as Ve,R as Ae,X as q,I as J,i as fe,s as Me,C as qe,j as je,k as _e,m as Be,n as w,q as O,r as ze,t as ee,x as Qe,v as He,w as Ue,$ as Ge,z as Ke}from"./ChevronDownIcon-50d761f8.js";import"./_commonjsHelpers-de833af9.js";let le=/([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g;function ie(e){var a,l;let n=(a=e.innerText)!=null?a:"",r=e.cloneNode(!0);if(!(r instanceof HTMLElement))return n;let i=!1;for(let s of r.querySelectorAll('[hidden],[aria-hidden],[role="img"]'))s.remove(),i=!0;let t=i?(l=r.innerText)!=null?l:"":n;return le.test(t)&&(t=t.replace(le,"")),t}function We(e){let a=e.getAttribute("aria-label");if(typeof a=="string")return a.trim();let l=e.getAttribute("aria-labelledby");if(l){let n=l.split(" ").map(r=>{let i=document.getElementById(r);if(i){let t=i.getAttribute("aria-label");return typeof t=="string"?t.trim():ie(i).trim()}return null}).filter(Boolean);if(n.length>0)return n.join(", ")}return ie(e).trim()}function Xe(e){let a=c.useRef(""),l=c.useRef("");return b(()=>{let n=e.current;if(!n)return"";let r=n.innerText;if(a.current===r)return l.current;let i=We(n).trim().toLowerCase();return a.current=r,l.current=i,i})}var Je=(e=>(e[e.Open=0]="Open",e[e.Closed=1]="Closed",e))(Je||{}),Ye=(e=>(e[e.Single=0]="Single",e[e.Multi=1]="Multi",e))(Ye||{}),Ze=(e=>(e[e.Pointer=0]="Pointer",e[e.Other=1]="Other",e))(Ze||{}),et=(e=>(e[e.OpenListbox=0]="OpenListbox",e[e.CloseListbox=1]="CloseListbox",e[e.GoToOption=2]="GoToOption",e[e.Search=3]="Search",e[e.ClearSearch=4]="ClearSearch",e[e.RegisterOption=5]="RegisterOption",e[e.UnregisterOption=6]="UnregisterOption",e[e.RegisterLabel=7]="RegisterLabel",e))(et||{});function Z(e,a=l=>l){let l=e.activeOptionIndex!==null?e.options[e.activeOptionIndex]:null,n=He(a(e.options.slice()),i=>i.dataRef.current.domRef.current),r=l?n.indexOf(l):null;return r===-1&&(r=null),{options:n,activeOptionIndex:r}}let tt={1(e){return e.dataRef.current.disabled||e.listboxState===1?e:{...e,activeOptionIndex:null,listboxState:1}},0(e){if(e.dataRef.current.disabled||e.listboxState===0)return e;let a=e.activeOptionIndex,{isSelected:l}=e.dataRef.current,n=e.options.findIndex(r=>l(r.dataRef.current.value));return n!==-1&&(a=n),{...e,listboxState:0,activeOptionIndex:a}},2(e,a){var l;if(e.dataRef.current.disabled||e.listboxState===1)return e;let n=Z(e),r=Qe(a,{resolveItems:()=>n.options,resolveActiveIndex:()=>n.activeOptionIndex,resolveId:i=>i.id,resolveDisabled:i=>i.dataRef.current.disabled});return{...e,...n,searchQuery:"",activeOptionIndex:r,activationTrigger:(l=a.trigger)!=null?l:1}},3:(e,a)=>{if(e.dataRef.current.disabled||e.listboxState===1)return e;let l=e.searchQuery!==""?0:1,n=e.searchQuery+a.value.toLowerCase(),r=(e.activeOptionIndex!==null?e.options.slice(e.activeOptionIndex+l).concat(e.options.slice(0,e.activeOptionIndex+l)):e.options).find(t=>{var s;return!t.dataRef.current.disabled&&((s=t.dataRef.current.textValue)==null?void 0:s.startsWith(n))}),i=r?e.options.indexOf(r):-1;return i===-1||i===e.activeOptionIndex?{...e,searchQuery:n}:{...e,searchQuery:n,activeOptionIndex:i,activationTrigger:1}},4(e){return e.dataRef.current.disabled||e.listboxState===1||e.searchQuery===""?e:{...e,searchQuery:""}},5:(e,a)=>{let l={id:a.id,dataRef:a.dataRef},n=Z(e,r=>[...r,l]);return e.activeOptionIndex===null&&e.dataRef.current.isSelected(a.dataRef.current.value)&&(n.activeOptionIndex=n.options.indexOf(l)),{...e,...n}},6:(e,a)=>{let l=Z(e,n=>{let r=n.findIndex(i=>i.id===a.id);return r!==-1&&n.splice(r,1),n});return{...e,...l,activationTrigger:1}},7:(e,a)=>({...e,labelId:a.id})},te=c.createContext(null);te.displayName="ListboxActionsContext";function j(e){let a=c.useContext(te);if(a===null){let l=new Error(`<${e} /> is missing a parent <Listbox /> component.`);throw Error.captureStackTrace&&Error.captureStackTrace(l,j),l}return a}let ne=c.createContext(null);ne.displayName="ListboxDataContext";function _(e){let a=c.useContext(ne);if(a===null){let l=new Error(`<${e} /> is missing a parent <Listbox /> component.`);throw Error.captureStackTrace&&Error.captureStackTrace(l,_),l}return a}function nt(e,a){return E(a.type,tt,e,a)}let at=c.Fragment;function rt(e,a){let{value:l,defaultValue:n,form:r,name:i,onChange:t,by:s=(u,d)=>u===d,disabled:f=!1,horizontal:g=!1,multiple:h=!1,...y}=e;const P=g?"horizontal":"vertical";let T=M(a),[S=h?[]:void 0,x]=$e(l,t,n),[v,o]=c.useReducer(nt,{dataRef:c.createRef(),listboxState:1,options:[],searchQuery:"",labelId:null,activeOptionIndex:null,activationTrigger:1}),p=c.useRef({static:!1,hold:!1}),C=c.useRef(null),B=c.useRef(null),Y=c.useRef(null),R=b(typeof s=="string"?(u,d)=>{let L=s;return(u==null?void 0:u[L])===(d==null?void 0:d[L])}:s),$=c.useCallback(u=>E(m.mode,{1:()=>S.some(d=>R(d,u)),0:()=>R(S,u)}),[S]),m=c.useMemo(()=>({...v,value:S,disabled:f,mode:h?1:0,orientation:P,compare:R,isSelected:$,optionsPropsRef:p,labelRef:C,buttonRef:B,optionsRef:Y}),[S,f,h,v]);G(()=>{v.dataRef.current=m},[m]),Ce([m.buttonRef,m.optionsRef],(u,d)=>{var L;o({type:1}),De(d,ke.Loose)||(u.preventDefault(),(L=m.buttonRef.current)==null||L.focus())},m.listboxState===0);let me=c.useMemo(()=>({open:m.listboxState===0,disabled:f,value:S}),[m,f,S]),ge=b(u=>{let d=m.options.find(L=>L.id===u);d&&F(d.dataRef.current.value)}),xe=b(()=>{if(m.activeOptionIndex!==null){let{dataRef:u,id:d}=m.options[m.activeOptionIndex];F(u.current.value),o({type:2,focus:w.Specific,id:d})}}),he=b(()=>o({type:0})),Se=b(()=>o({type:1})),Oe=b((u,d,L)=>u===w.Specific?o({type:2,focus:w.Specific,id:d,trigger:L}):o({type:2,focus:u,trigger:L})),ye=b((u,d)=>(o({type:5,id:u,dataRef:d}),()=>o({type:6,id:u}))),Re=b(u=>(o({type:7,id:u}),()=>o({type:7,id:null}))),F=b(u=>E(m.mode,{0(){return x==null?void 0:x(u)},1(){let d=m.value.slice(),L=d.findIndex(Q=>R(Q,u));return L===-1?d.push(u):d.splice(L,1),x==null?void 0:x(d)}})),Le=b(u=>o({type:3,value:u})),Ie=b(()=>o({type:4})),we=c.useMemo(()=>({onChange:F,registerOption:ye,registerLabel:Re,goToOption:Oe,closeListbox:Se,openListbox:he,selectActiveOption:xe,selectOption:ge,search:Le,clearSearch:Ie}),[]),Te={ref:T},z=c.useRef(null),Pe=K();return c.useEffect(()=>{z.current&&n!==void 0&&Pe.addEventListener(z.current,"reset",()=>{F(n)})},[z,F]),H.createElement(te.Provider,{value:we},H.createElement(ne.Provider,{value:m},H.createElement(Ee,{value:E(m.listboxState,{0:W.Open,1:W.Closed})},i!=null&&S!=null&&Fe({[i]:S}).map(([u,d],L)=>H.createElement(Ne,{features:Ve.Hidden,ref:L===0?Q=>{var ae;z.current=(ae=Q==null?void 0:Q.closest("form"))!=null?ae:null}:void 0,...Ae({key:u,as:"input",type:"hidden",hidden:!0,readOnly:!0,form:r,name:u,value:d})})),q({ourProps:Te,theirProps:y,slot:me,defaultTag:at,name:"Listbox"}))))}let ot="button";function lt(e,a){var l;let n=J(),{id:r=`headlessui-listbox-button-${n}`,...i}=e,t=_("Listbox.Button"),s=j("Listbox.Button"),f=M(t.buttonRef,a),g=K(),h=b(v=>{switch(v.key){case O.Space:case O.Enter:case O.ArrowDown:v.preventDefault(),s.openListbox(),g.nextFrame(()=>{t.value||s.goToOption(w.First)});break;case O.ArrowUp:v.preventDefault(),s.openListbox(),g.nextFrame(()=>{t.value||s.goToOption(w.Last)});break}}),y=b(v=>{switch(v.key){case O.Space:v.preventDefault();break}}),P=b(v=>{if(ze(v.currentTarget))return v.preventDefault();t.listboxState===0?(s.closeListbox(),g.nextFrame(()=>{var o;return(o=t.buttonRef.current)==null?void 0:o.focus({preventScroll:!0})})):(v.preventDefault(),s.openListbox())}),T=fe(()=>{if(t.labelId)return[t.labelId,r].join(" ")},[t.labelId,r]),S=c.useMemo(()=>({open:t.listboxState===0,disabled:t.disabled,value:t.value}),[t]),x={ref:f,id:r,type:Me(e,t.buttonRef),"aria-haspopup":"listbox","aria-controls":(l=t.optionsRef.current)==null?void 0:l.id,"aria-expanded":t.listboxState===0,"aria-labelledby":T,disabled:t.disabled,onKeyDown:h,onKeyUp:y,onClick:P};return q({ourProps:x,theirProps:i,slot:S,defaultTag:ot,name:"Listbox.Button"})}let it="label";function st(e,a){let l=J(),{id:n=`headlessui-listbox-label-${l}`,...r}=e,i=_("Listbox.Label"),t=j("Listbox.Label"),s=M(i.labelRef,a);G(()=>t.registerLabel(n),[n]);let f=b(()=>{var h;return(h=i.buttonRef.current)==null?void 0:h.focus({preventScroll:!0})}),g=c.useMemo(()=>({open:i.listboxState===0,disabled:i.disabled}),[i]);return q({ourProps:{ref:s,id:n,onClick:f},theirProps:r,slot:g,defaultTag:it,name:"Listbox.Label"})}let ut="ul",ct=oe.RenderStrategy|oe.Static;function dt(e,a){var l;let n=J(),{id:r=`headlessui-listbox-options-${n}`,...i}=e,t=_("Listbox.Options"),s=j("Listbox.Options"),f=M(t.optionsRef,a),g=K(),h=K(),y=qe(),P=(()=>y!==null?(y&W.Open)===W.Open:t.listboxState===0)();c.useEffect(()=>{var o;let p=t.optionsRef.current;p&&t.listboxState===0&&p!==((o=je(p))==null?void 0:o.activeElement)&&p.focus({preventScroll:!0})},[t.listboxState,t.optionsRef]);let T=b(o=>{switch(h.dispose(),o.key){case O.Space:if(t.searchQuery!=="")return o.preventDefault(),o.stopPropagation(),s.search(o.key);case O.Enter:if(o.preventDefault(),o.stopPropagation(),t.activeOptionIndex!==null){let{dataRef:p}=t.options[t.activeOptionIndex];s.onChange(p.current.value)}t.mode===0&&(s.closeListbox(),ee().nextFrame(()=>{var p;return(p=t.buttonRef.current)==null?void 0:p.focus({preventScroll:!0})}));break;case E(t.orientation,{vertical:O.ArrowDown,horizontal:O.ArrowRight}):return o.preventDefault(),o.stopPropagation(),s.goToOption(w.Next);case E(t.orientation,{vertical:O.ArrowUp,horizontal:O.ArrowLeft}):return o.preventDefault(),o.stopPropagation(),s.goToOption(w.Previous);case O.Home:case O.PageUp:return o.preventDefault(),o.stopPropagation(),s.goToOption(w.First);case O.End:case O.PageDown:return o.preventDefault(),o.stopPropagation(),s.goToOption(w.Last);case O.Escape:return o.preventDefault(),o.stopPropagation(),s.closeListbox(),g.nextFrame(()=>{var p;return(p=t.buttonRef.current)==null?void 0:p.focus({preventScroll:!0})});case O.Tab:o.preventDefault(),o.stopPropagation();break;default:o.key.length===1&&(s.search(o.key),h.setTimeout(()=>s.clearSearch(),350));break}}),S=fe(()=>{var o,p,C;return(C=(o=t.labelRef.current)==null?void 0:o.id)!=null?C:(p=t.buttonRef.current)==null?void 0:p.id},[t.labelRef.current,t.buttonRef.current]),x=c.useMemo(()=>({open:t.listboxState===0}),[t]),v={"aria-activedescendant":t.activeOptionIndex===null||(l=t.options[t.activeOptionIndex])==null?void 0:l.id,"aria-multiselectable":t.mode===1?!0:void 0,"aria-labelledby":S,"aria-orientation":t.orientation,id:r,onKeyDown:T,role:"listbox",tabIndex:0,ref:f};return q({ourProps:v,theirProps:i,slot:x,defaultTag:ut,features:ct,visible:P,name:"Listbox.Options"})}let pt="li";function bt(e,a){let l=J(),{id:n=`headlessui-listbox-option-${l}`,disabled:r=!1,value:i,...t}=e,s=_("Listbox.Option"),f=j("Listbox.Option"),g=s.activeOptionIndex!==null?s.options[s.activeOptionIndex].id===n:!1,h=s.isSelected(i),y=c.useRef(null),P=Xe(y),T=_e({disabled:r,value:i,domRef:y,get textValue(){return P()}}),S=M(a,y);G(()=>{if(s.listboxState!==0||!g||s.activationTrigger===0)return;let R=ee();return R.requestAnimationFrame(()=>{var $,m;(m=($=y.current)==null?void 0:$.scrollIntoView)==null||m.call($,{block:"nearest"})}),R.dispose},[y,g,s.listboxState,s.activationTrigger,s.activeOptionIndex]),G(()=>f.registerOption(n,T),[T,n]);let x=b(R=>{if(r)return R.preventDefault();f.onChange(i),s.mode===0&&(f.closeListbox(),ee().nextFrame(()=>{var $;return($=s.buttonRef.current)==null?void 0:$.focus({preventScroll:!0})}))}),v=b(()=>{if(r)return f.goToOption(w.Nothing);f.goToOption(w.Specific,n)}),o=Be(),p=b(R=>o.update(R)),C=b(R=>{o.wasMoved(R)&&(r||g||f.goToOption(w.Specific,n,0))}),B=b(R=>{o.wasMoved(R)&&(r||g&&f.goToOption(w.Nothing))}),Y=c.useMemo(()=>({active:g,selected:h,disabled:r}),[g,h,r]);return q({ourProps:{id:n,ref:S,role:"option",tabIndex:r===!0?void 0:-1,"aria-disabled":r===!0?!0:void 0,"aria-selected":h,disabled:void 0,onClick:x,onFocus:v,onPointerEnter:p,onMouseEnter:p,onPointerMove:C,onMouseMove:C,onPointerLeave:B,onMouseLeave:B},theirProps:t,slot:Y,defaultTag:pt,name:"Listbox.Option"})}let ft=A(rt),vt=A(lt),mt=A(st),gt=A(dt),xt=A(bt),N=Object.assign(ft,{Button:vt,Label:mt,Options:gt,Option:xt});const ht=["base","xl"],X=({label:e,options:a,name:l,size:n="base",selected:r=Object.keys(a)[0],block:i=!1,labelHidden:t=!1,...s})=>I(N,{...s,children:({open:f})=>{var g,h,y,P,T;return k(re,{children:[I(N.Label,{className:D("block","font-medium","text-gray-700","mb-1",{"sr-only":t}),children:e}),k("div",{className:"relative",children:[k(N.Button,{className:D("relative","cursor-default","rounded-lg","border","border-gray-300","bg-white","p-3","pl-3","pr-10","text-left","transition","hover:shadow-lg","hover:shadow-gray-200",`text-${n}`,{"w-full":i}),children:[k("span",{className:"flex items-center",children:[((g=a[r])==null?void 0:g.image)&&I("img",{src:(y=(h=a[r])==null?void 0:h.image)==null?void 0:y.src,alt:"",className:"h-6 w-6 flex-shrink-0 rounded-full object-cover"}),I("span",{className:D({"ml-3":!!((P=a[r])!=null&&P.image)},"block","truncate"),children:(T=a[r])==null?void 0:T.label})]}),I("span",{className:"pointer-events-none absolute inset-y-0 right-0 ml-2 flex items-center pr-2",children:I(Ue,{className:"h-5 w-5 text-gray-400","aria-hidden":"true"})})]}),I(Ge,{show:f,as:c.Fragment,leave:"transition ease-in duration-100",leaveFrom:"opacity-100",leaveTo:"opacity-0",children:I(N.Options,{className:D("absolute","z-10","mt-1","max-h-56","overflow-auto","rounded-lg","bg-white","py-1","shadow-lg","ring-1","ring-black","ring-opacity-5","focus:outline-none",`text-${n}`,{"w-full":i}),children:Object.entries(a).map(([S,x],v)=>I(N.Option,{className:({active:o})=>D(o?"bg-so-color-accent-2-primary-500 text-white":"text-gray-900","relative cursor-default select-none py-2 pl-3 pr-12"),value:S,children:({selected:o,active:p})=>k(re,{children:[k("div",{className:"flex items-center",children:[(x==null?void 0:x.image)&&I("img",{src:x.image.src,alt:"",className:"h-6 w-6 flex-shrink-0 rounded-full object-cover"}),I("span",{className:D(p?"font-semibold":"font-normal","truncate",{"ml-3":!!(x!=null&&x.image)}),children:x.label})]}),o&&I("span",{className:D("absolute inset-y-0 right-0 flex items-center pr-4"),children:I(Ke,{className:"h-5 w-5","aria-hidden":"true"})})]})},v))})})]})]})}});try{X.displayName="SoSelect",X.__docgenInfo={description:"",displayName:"SoSelect",props:{label:{defaultValue:null,description:"The select's label elements",name:"label",required:!0,type:{name:"string"}},options:{defaultValue:null,description:"Options available for selection",name:"options",required:!0,type:{name:"Record<string, SoSelectItem>"}},selected:{defaultValue:{value:"Object.keys(options)[0]"},description:"The selected/current value",name:"selected",required:!1,type:{name:"string"}},block:{defaultValue:{value:"false"},description:"Render full width",name:"block",required:!1,type:{name:"boolean"}},labelHidden:{defaultValue:{value:"false"},description:"If true, the label is visually hidden. It will still be available to screenreaders.",name:"labelHidden",required:!1,type:{name:"boolean"}},size:{defaultValue:{value:"base"},description:"Visual size of the button",name:"size",required:!1,type:{name:"enum",value:[{value:'"base"'},{value:'"xl"'}]}},onChange:{defaultValue:null,description:"Emits the selected value on change",name:"onChange",required:!1,type:{name:"(value: string) => void"}},value:{defaultValue:null,description:"",name:"value",required:!1,type:{name:"unknown"}},disabled:{defaultValue:null,description:"",name:"disabled",required:!1,type:{name:"boolean"}},name:{defaultValue:null,description:"",name:"name",required:!1,type:{name:"string"}}}}}catch{}const Lt={component:X,argTypes:{block:{defaultValue:!1,description:"If true, the control will be rendered with 100% width",control:{type:"boolean"}},labelHidden:{defaultValue:!1,description:"If true, the label is only available to screenreaders, but visually hidden.",control:{type:"boolean"}},size:{defaultValue:"base",options:ht,control:{type:"select"}}}},ve=e=>{const a=(e==null?void 0:e.options)||{"option-1":{label:"Option 1",value:"option-1"},"option-2":{label:"Option 2",value:"option-2"},"option-3":{label:"Option 3",value:"option-3"}},[l,n]=c.useState("option-1"),r={label:"Select Label",selected:l,options:a,...e,onChange:i=>{n(i)}};return I(X,{...r})},U=ve.bind({}),V=ve.bind({});V.args={label:"Country Selector Example",options:{"option-1":{label:"Option 1",value:"option-1",image:{src:"ch.svg"}},"option-2":{label:"Option 2",value:"option-2",image:{src:"ch.svg"}},"option-3":{label:"Option 3",value:"option-3",image:{src:"ch.svg"}}}};var se,ue,ce;U.parameters={...U.parameters,docs:{...(se=U.parameters)==null?void 0:se.docs,source:{originalSource:`(args: Partial<SoSelectProps>) => {
  const options: SoSelectProps['options'] = args?.options || {
    'option-1': {
      label: 'Option 1',
      value: 'option-1'
    },
    'option-2': {
      label: 'Option 2',
      value: 'option-2'
    },
    'option-3': {
      label: 'Option 3',
      value: 'option-3'
    }
  };
  const [value, setValue] = useState('option-1');
  const props: SoSelectProps = {
    label: 'Select Label',
    selected: value,
    options,
    ...args,
    onChange: selectedItem => {
      setValue(selectedItem);
    }
  };
  return <SoSelect {...props} />;
}`,...(ce=(ue=U.parameters)==null?void 0:ue.docs)==null?void 0:ce.source}}};var de,pe,be;V.parameters={...V.parameters,docs:{...(de=V.parameters)==null?void 0:de.docs,source:{originalSource:`(args: Partial<SoSelectProps>) => {
  const options: SoSelectProps['options'] = args?.options || {
    'option-1': {
      label: 'Option 1',
      value: 'option-1'
    },
    'option-2': {
      label: 'Option 2',
      value: 'option-2'
    },
    'option-3': {
      label: 'Option 3',
      value: 'option-3'
    }
  };
  const [value, setValue] = useState('option-1');
  const props: SoSelectProps = {
    label: 'Select Label',
    selected: value,
    options,
    ...args,
    onChange: selectedItem => {
      setValue(selectedItem);
    }
  };
  return <SoSelect {...props} />;
}`,...(be=(pe=V.parameters)==null?void 0:pe.docs)==null?void 0:be.source}}};const It=["Standard","WithImages"];export{U as Standard,V as WithImages,It as __namedExportsOrder,Lt as default};
//# sourceMappingURL=Select.stories-c59ac6d7.js.map