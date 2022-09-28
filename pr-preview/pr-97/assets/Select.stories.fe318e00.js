import{r as s,R as N,j as g,F as pe,a as A}from"./jsx-runtime.303ac1f4.js";import{c as V}from"./index.eb826ae0.js";import"./iframe.c7c45402.js";const Te=typeof window>"u"||typeof document>"u";let T=Te?s.exports.useEffect:s.exports.useLayoutEffect;function j(e){let t=s.exports.useRef(e);return T(()=>{t.current=e},[e]),t}function Ce(e,t){let[r,n]=s.exports.useState(e),o=j(e);return T(()=>n(o.current),[o,n,...t]),r}function We(e){typeof queueMicrotask=="function"?queueMicrotask(e):Promise.resolve().then(e).catch(t=>setTimeout(()=>{throw t}))}function q(){let e=[],t=[],r={enqueue(n){t.push(n)},addEventListener(n,o,i,l){return n.addEventListener(o,i,l),r.add(()=>n.removeEventListener(o,i,l))},requestAnimationFrame(...n){let o=requestAnimationFrame(...n);return r.add(()=>cancelAnimationFrame(o))},nextFrame(...n){return r.requestAnimationFrame(()=>r.requestAnimationFrame(...n))},setTimeout(...n){let o=setTimeout(...n);return r.add(()=>clearTimeout(o))},microTask(...n){let o={current:!0};return We(()=>{o.current&&n[0]()}),r.add(()=>{o.current=!1})},add(n){return e.push(n),()=>{let o=e.indexOf(n);if(o>=0){let[i]=e.splice(o,1);i()}}},dispose(){for(let n of e.splice(0))n()},async workQueue(){for(let n of t.splice(0))await n()}};return r}function K(){let[e]=s.exports.useState(q);return s.exports.useEffect(()=>()=>e.dispose(),[e]),e}let w=function(e){let t=j(e);return N.useCallback((...r)=>t.current(...r),[t])},ie={serverHandoffComplete:!1};function be(){let[e,t]=s.exports.useState(ie.serverHandoffComplete);return s.exports.useEffect(()=>{e!==!0&&t(!0)},[e]),s.exports.useEffect(()=>{ie.serverHandoffComplete===!1&&(ie.serverHandoffComplete=!0)},[]),e}var ye;let Qe=0;function we(){return++Qe}let ee=(ye=N.useId)!=null?ye:function(){let e=be(),[t,r]=N.useState(e?we:null);return T(()=>{t===null&&r(we())},[t]),t!=null?""+t:void 0};function y(e,t,...r){if(e in t){let o=t[e];return typeof o=="function"?o(...r):o}let n=new Error(`Tried to handle "${e}" but there is no handler defined. Only defined handlers are: ${Object.keys(t).map(o=>`"${o}"`).join(", ")}.`);throw Error.captureStackTrace&&Error.captureStackTrace(n,y),n}function Le(e){return Te?null:e instanceof Node?e.ownerDocument:e!=null&&e.hasOwnProperty("current")&&e.current instanceof Node?e.current.ownerDocument:document}let Oe=["[contentEditable=true]","[tabindex]","a[href]","area[href]","button:not([disabled])","iframe","input:not([disabled])","select:not([disabled])","textarea:not([disabled])"].map(e=>`${e}:not([tabindex='-1'])`).join(",");var Ke=(e=>(e[e.First=1]="First",e[e.Previous=2]="Previous",e[e.Next=4]="Next",e[e.Last=8]="Last",e[e.WrapAround=16]="WrapAround",e[e.NoScroll=32]="NoScroll",e))(Ke||{}),Ge=(e=>(e[e.Error=0]="Error",e[e.Overflow=1]="Overflow",e[e.Success=2]="Success",e[e.Underflow=3]="Underflow",e))(Ge||{}),Ye=(e=>(e[e.Previous=-1]="Previous",e[e.Next=1]="Next",e))(Ye||{}),he=(e=>(e[e.Strict=0]="Strict",e[e.Loose=1]="Loose",e))(he||{});function Ie(e,t=0){var r;return e===((r=Le(e))==null?void 0:r.body)?!1:y(t,{[0](){return e.matches(Oe)},[1](){let n=e;for(;n!==null;){if(n.matches(Oe))return!0;n=n.parentElement}return!1}})}function Ze(e,t=r=>r){return e.slice().sort((r,n)=>{let o=t(r),i=t(n);if(o===null||i===null)return 0;let l=o.compareDocumentPosition(i);return l&Node.DOCUMENT_POSITION_FOLLOWING?-1:l&Node.DOCUMENT_POSITION_PRECEDING?1:0})}function ae(e,t,r){let n=j(t);s.exports.useEffect(()=>{function o(i){n.current(i)}return document.addEventListener(e,o,r),()=>document.removeEventListener(e,o,r)},[e,r])}function Je(e,t,r=!0){let n=s.exports.useRef(!1);s.exports.useEffect(()=>{requestAnimationFrame(()=>{n.current=r})},[r]);function o(l,a){if(!n.current||l.defaultPrevented)return;let p=function f(m){return typeof m=="function"?f(m()):Array.isArray(m)||m instanceof Set?m:[m]}(e),u=a(l);if(u!==null&&!!u.ownerDocument.documentElement.contains(u)){for(let f of p){if(f===null)continue;let m=f instanceof HTMLElement?f:f.current;if(m!=null&&m.contains(u))return}return!Ie(u,he.Loose)&&u.tabIndex!==-1&&l.preventDefault(),t(l,u)}}let i=s.exports.useRef(null);ae("mousedown",l=>{n.current&&(i.current=l.target)},!0),ae("click",l=>{!i.current||(o(l,()=>i.current),i.current=null)},!0),ae("blur",l=>o(l,()=>window.document.activeElement instanceof HTMLIFrameElement?window.document.activeElement:null),!0)}function Ee(e){var t;if(e.type)return e.type;let r=(t=e.as)!=null?t:"button";if(typeof r=="string"&&r.toLowerCase()==="button")return"button"}function Xe(e,t){let[r,n]=s.exports.useState(()=>Ee(e));return T(()=>{n(Ee(e))},[e.type,e.as]),T(()=>{r||!t.current||t.current instanceof HTMLButtonElement&&!t.current.hasAttribute("type")&&n("button")},[r,t]),r}let et=Symbol();function B(...e){let t=s.exports.useRef(e);s.exports.useEffect(()=>{t.current=e},[e]);let r=w(n=>{for(let o of t.current)o!=null&&(typeof o=="function"?o(n):o.current=n)});return e.every(n=>n==null||(n==null?void 0:n[et]))?void 0:r}function tt(e){throw new Error("Unexpected object: "+e)}var $=(e=>(e[e.First=0]="First",e[e.Previous=1]="Previous",e[e.Next=2]="Next",e[e.Last=3]="Last",e[e.Specific=4]="Specific",e[e.Nothing=5]="Nothing",e))($||{});function nt(e,t){let r=t.resolveItems();if(r.length<=0)return null;let n=t.resolveActiveIndex(),o=n!=null?n:-1,i=(()=>{switch(e.focus){case 0:return r.findIndex(l=>!t.resolveDisabled(l));case 1:{let l=r.slice().reverse().findIndex((a,p,u)=>o!==-1&&u.length-p-1>=o?!1:!t.resolveDisabled(a));return l===-1?l:r.length-1-l}case 2:return r.findIndex((l,a)=>a<=o?!1:!t.resolveDisabled(l));case 3:{let l=r.slice().reverse().findIndex(a=>!t.resolveDisabled(a));return l===-1?l:r.length-1-l}case 4:return r.findIndex(l=>t.resolveId(l)===e.id);case 5:return null;default:tt(e)}})();return i===-1?n:i}var X=(e=>(e[e.None=0]="None",e[e.RenderStrategy=1]="RenderStrategy",e[e.Static=2]="Static",e))(X||{}),F=(e=>(e[e.Unmount=0]="Unmount",e[e.Hidden=1]="Hidden",e))(F||{});function H({ourProps:e,theirProps:t,slot:r,defaultTag:n,features:o,visible:i=!0,name:l}){let a=Pe(t,e);if(i)return J(a,r,n,l);let p=o!=null?o:0;if(p&2){let{static:u=!1,...f}=a;if(u)return J(f,r,n,l)}if(p&1){let{unmount:u=!0,...f}=a;return y(u?0:1,{[0](){return null},[1](){return J({...f,hidden:!0,style:{display:"none"}},r,n,l)}})}return J(a,r,n,l)}function J(e,t={},r,n){let{as:o=r,children:i,refName:l="ref",...a}=se(e,["unmount","static"]),p=e.ref!==void 0?{[l]:e.ref}:{},u=typeof i=="function"?i(t):i;a.className&&typeof a.className=="function"&&(a.className=a.className(t));let f={};if(t){let m=!1,x=[];for(let[h,c]of Object.entries(t))typeof c=="boolean"&&(m=!0),c===!0&&x.push(h);m&&(f["data-headlessui-state"]=x.join(" "))}if(o===s.exports.Fragment&&Object.keys(fe(a)).length>0){if(!s.exports.isValidElement(u)||Array.isArray(u)&&u.length>1)throw new Error(['Passing props on "Fragment"!',"",`The current component <${n} /> is rendering a "Fragment".`,"However we need to passthrough the following props:",Object.keys(a).map(m=>`  - ${m}`).join(`
`),"","You can apply a few solutions:",['Add an `as="..."` prop, to ensure that we render an actual element instead of a "Fragment".',"Render a single element as the child so that we can forward the props onto that element."].map(m=>`  - ${m}`).join(`
`)].join(`
`));return s.exports.cloneElement(u,Object.assign({},Pe(u.props,fe(se(a,["ref"]))),f,p,rt(u.ref,p.ref)))}return s.exports.createElement(o,Object.assign({},se(a,["ref"]),o!==s.exports.Fragment&&p,o!==s.exports.Fragment&&f),u)}function rt(...e){return{ref:e.every(t=>t==null)?void 0:t=>{for(let r of e)r!=null&&(typeof r=="function"?r(t):r.current=t)}}}function Pe(...e){if(e.length===0)return{};if(e.length===1)return e[0];let t={},r={};for(let n of e)for(let o in n)o.startsWith("on")&&typeof n[o]=="function"?(r[o]!=null||(r[o]=[]),r[o].push(n[o])):t[o]=n[o];if(t.disabled||t["aria-disabled"])return Object.assign(t,Object.fromEntries(Object.keys(r).map(n=>[n,void 0])));for(let n in r)Object.assign(t,{[n](o,...i){let l=r[n];for(let a of l){if((o instanceof Event||(o==null?void 0:o.nativeEvent)instanceof Event)&&o.defaultPrevented)return;a(o,...i)}}});return t}function D(e){var t;return Object.assign(s.exports.forwardRef(e),{displayName:(t=e.displayName)!=null?t:e.name})}function fe(e){let t=Object.assign({},e);for(let r in t)t[r]===void 0&&delete t[r];return t}function se(e,t=[]){let r=Object.assign({},e);for(let n of t)n in r&&delete r[n];return r}function ot(e){let t=e.parentElement,r=null;for(;t&&!(t instanceof HTMLFieldSetElement);)t instanceof HTMLLegendElement&&(r=t),t=t.parentElement;let n=(t==null?void 0:t.getAttribute("disabled"))==="";return n&&lt(r)?!1:n}function lt(e){if(!e)return!1;let t=e.previousElementSibling;for(;t!==null;){if(t instanceof HTMLLegendElement)return!1;t=t.previousElementSibling}return!0}function $e(e={},t=null,r=[]){for(let[n,o]of Object.entries(e))Fe(r,Ne(t,n),o);return r}function Ne(e,t){return e?e+"["+t+"]":t}function Fe(e,t,r){if(Array.isArray(r))for(let[n,o]of r.entries())Fe(e,Ne(t,n.toString()),o);else r instanceof Date?e.push([t,r.toISOString()]):typeof r=="boolean"?e.push([t,r?"1":"0"]):typeof r=="string"?e.push([t,r]):typeof r=="number"?e.push([t,`${r}`]):r==null?e.push([t,""]):$e(r,t,e)}let it="div";var De=(e=>(e[e.None=1]="None",e[e.Focusable=2]="Focusable",e[e.Hidden=4]="Hidden",e))(De||{});let at=D(function(e,t){let{features:r=1,...n}=e,o={ref:t,"aria-hidden":(r&2)===2?!0:void 0,style:{position:"fixed",top:1,left:1,width:1,height:0,padding:0,margin:-1,overflow:"hidden",clip:"rect(0, 0, 0, 0)",whiteSpace:"nowrap",borderWidth:"0",...(r&4)===4&&(r&2)!==2&&{display:"none"}}};return H({ourProps:o,theirProps:n,slot:{},defaultTag:it,name:"Hidden"})}),xe=s.exports.createContext(null);xe.displayName="OpenClosedContext";var M=(e=>(e[e.Open=0]="Open",e[e.Closed=1]="Closed",e))(M||{});function ge(){return s.exports.useContext(xe)}function ke({value:e,children:t}){return N.createElement(xe.Provider,{value:e},t)}var E=(e=>(e.Space=" ",e.Enter="Enter",e.Escape="Escape",e.Backspace="Backspace",e.Delete="Delete",e.ArrowLeft="ArrowLeft",e.ArrowUp="ArrowUp",e.ArrowRight="ArrowRight",e.ArrowDown="ArrowDown",e.Home="Home",e.End="End",e.PageUp="PageUp",e.PageDown="PageDown",e.Tab="Tab",e))(E||{});function st(e,t,r){let[n,o]=s.exports.useState(r),i=e!==void 0;return[i?e:n,w(l=>(i||o(l),t==null?void 0:t(l)))]}function Ae(){let e=s.exports.useRef(!1);return T(()=>(e.current=!0,()=>{e.current=!1}),[]),e}var ut=(e=>(e[e.Open=0]="Open",e[e.Closed=1]="Closed",e))(ut||{}),ct=(e=>(e[e.Single=0]="Single",e[e.Multi=1]="Multi",e))(ct||{}),dt=(e=>(e[e.Pointer=0]="Pointer",e[e.Other=1]="Other",e))(dt||{}),pt=(e=>(e[e.OpenListbox=0]="OpenListbox",e[e.CloseListbox=1]="CloseListbox",e[e.SetDisabled=2]="SetDisabled",e[e.SetOrientation=3]="SetOrientation",e[e.GoToOption=4]="GoToOption",e[e.Search=5]="Search",e[e.ClearSearch=6]="ClearSearch",e[e.RegisterOption=7]="RegisterOption",e[e.UnregisterOption=8]="UnregisterOption",e))(pt||{});function ue(e,t=r=>r){let r=e.activeOptionIndex!==null?e.options[e.activeOptionIndex]:null,n=Ze(t(e.options.slice()),i=>i.dataRef.current.domRef.current),o=r?n.indexOf(r):null;return o===-1&&(o=null),{options:n,activeOptionIndex:o}}let ft={[1](e){return e.disabled||e.listboxState===1?e:{...e,activeOptionIndex:null,listboxState:1}},[0](e){if(e.disabled||e.listboxState===0)return e;let t=e.activeOptionIndex,{value:r,mode:n,compare:o}=e.propsRef.current,i=e.options.findIndex(l=>{let a=l.dataRef.current.value;return y(n,{[1]:()=>r.some(p=>o(p,a)),[0]:()=>o(r,a)})});return i!==-1&&(t=i),{...e,listboxState:0,activeOptionIndex:t}},[2](e,t){return e.disabled===t.disabled?e:{...e,disabled:t.disabled}},[3](e,t){return e.orientation===t.orientation?e:{...e,orientation:t.orientation}},[4](e,t){var r;if(e.disabled||e.listboxState===1)return e;let n=ue(e),o=nt(t,{resolveItems:()=>n.options,resolveActiveIndex:()=>n.activeOptionIndex,resolveId:i=>i.id,resolveDisabled:i=>i.dataRef.current.disabled});return{...e,...n,searchQuery:"",activeOptionIndex:o,activationTrigger:(r=t.trigger)!=null?r:1}},[5]:(e,t)=>{if(e.disabled||e.listboxState===1)return e;let r=e.searchQuery!==""?0:1,n=e.searchQuery+t.value.toLowerCase(),o=(e.activeOptionIndex!==null?e.options.slice(e.activeOptionIndex+r).concat(e.options.slice(0,e.activeOptionIndex+r)):e.options).find(l=>{var a;return!l.dataRef.current.disabled&&((a=l.dataRef.current.textValue)==null?void 0:a.startsWith(n))}),i=o?e.options.indexOf(o):-1;return i===-1||i===e.activeOptionIndex?{...e,searchQuery:n}:{...e,searchQuery:n,activeOptionIndex:i,activationTrigger:1}},[6](e){return e.disabled||e.listboxState===1||e.searchQuery===""?e:{...e,searchQuery:""}},[7]:(e,t)=>{let r={id:t.id,dataRef:t.dataRef},n=ue(e,o=>[...o,r]);if(e.activeOptionIndex===null){let{value:o,mode:i,compare:l}=e.propsRef.current,a=t.dataRef.current.value;y(i,{[1]:()=>o.some(p=>l(p,a)),[0]:()=>l(o,a)})&&(n.activeOptionIndex=n.options.indexOf(r))}return{...e,...n}},[8]:(e,t)=>{let r=ue(e,n=>{let o=n.findIndex(i=>i.id===t.id);return o!==-1&&n.splice(o,1),n});return{...e,...r,activationTrigger:1}}},Se=s.exports.createContext(null);Se.displayName="ListboxContext";function G(e){let t=s.exports.useContext(Se);if(t===null){let r=new Error(`<${e} /> is missing a parent <Listbox /> component.`);throw Error.captureStackTrace&&Error.captureStackTrace(r,G),r}return t}function mt(e,t){return y(t.type,ft,e,t)}let vt=s.exports.Fragment,bt=D(function(e,t){let{value:r,defaultValue:n,name:o,onChange:i,by:l=(S,O)=>S===O,disabled:a=!1,horizontal:p=!1,multiple:u=!1,...f}=e;const m=p?"horizontal":"vertical";let x=B(t),[h,c]=st(r,i,n),b=s.exports.useReducer(mt,{listboxState:1,propsRef:{current:{value:h,onChange:c,mode:u?1:0,compare:w(typeof l=="string"?(S,O)=>{let P=l;return(S==null?void 0:S[P])===(O==null?void 0:O[P])}:l)}},labelRef:s.exports.createRef(),buttonRef:s.exports.createRef(),optionsRef:s.exports.createRef(),disabled:a,orientation:m,options:[],searchQuery:"",activeOptionIndex:null,activationTrigger:1}),[{listboxState:d,propsRef:v,optionsRef:R,buttonRef:_},L]=b;v.current.value=h,v.current.mode=u?1:0,T(()=>{v.current.onChange=S=>y(v.current.mode,{[0](){return c(S)},[1](){let O=v.current.value.slice(),{compare:P}=v.current,Y=O.findIndex(z=>P(z,S));return Y===-1?O.push(S):O.splice(Y,1),c(O)}})},[c,v]),T(()=>L({type:2,disabled:a}),[a]),T(()=>L({type:3,orientation:m}),[m]),Je([_,R],(S,O)=>{var P;L({type:1}),Ie(O,he.Loose)||(S.preventDefault(),(P=_.current)==null||P.focus())},d===0);let C=s.exports.useMemo(()=>({open:d===0,disabled:a,value:h}),[d,a,h]),I={ref:x};return N.createElement(Se.Provider,{value:b},N.createElement(ke,{value:y(d,{[0]:M.Open,[1]:M.Closed})},o!=null&&h!=null&&$e({[o]:h}).map(([S,O])=>N.createElement(at,{features:De.Hidden,...fe({key:S,as:"input",type:"hidden",hidden:!0,readOnly:!0,name:S,value:O})})),H({ourProps:I,theirProps:f,slot:C,defaultTag:vt,name:"Listbox"})))}),ht="button",xt=D(function(e,t){var r;let[n,o]=G("Listbox.Button"),i=B(n.buttonRef,t),l=`headlessui-listbox-button-${ee()}`,a=K(),p=w(b=>{switch(b.key){case E.Space:case E.Enter:case E.ArrowDown:b.preventDefault(),o({type:0}),a.nextFrame(()=>{n.propsRef.current.value||o({type:4,focus:$.First})});break;case E.ArrowUp:b.preventDefault(),o({type:0}),a.nextFrame(()=>{n.propsRef.current.value||o({type:4,focus:$.Last})});break}}),u=w(b=>{switch(b.key){case E.Space:b.preventDefault();break}}),f=w(b=>{if(ot(b.currentTarget))return b.preventDefault();n.listboxState===0?(o({type:1}),a.nextFrame(()=>{var d;return(d=n.buttonRef.current)==null?void 0:d.focus({preventScroll:!0})})):(b.preventDefault(),o({type:0}))}),m=Ce(()=>{if(n.labelRef.current)return[n.labelRef.current.id,l].join(" ")},[n.labelRef.current,l]),x=s.exports.useMemo(()=>({open:n.listboxState===0,disabled:n.disabled,value:n.propsRef.current.value}),[n]),h=e,c={ref:i,id:l,type:Xe(e,n.buttonRef),"aria-haspopup":!0,"aria-controls":(r=n.optionsRef.current)==null?void 0:r.id,"aria-expanded":n.disabled?void 0:n.listboxState===0,"aria-labelledby":m,disabled:n.disabled,onKeyDown:p,onKeyUp:u,onClick:f};return H({ourProps:c,theirProps:h,slot:x,defaultTag:ht,name:"Listbox.Button"})}),gt="label",St=D(function(e,t){let[r]=G("Listbox.Label"),n=`headlessui-listbox-label-${ee()}`,o=B(r.labelRef,t),i=w(()=>{var a;return(a=r.buttonRef.current)==null?void 0:a.focus({preventScroll:!0})}),l=s.exports.useMemo(()=>({open:r.listboxState===0,disabled:r.disabled}),[r]);return H({ourProps:{ref:o,id:n,onClick:i},theirProps:e,slot:l,defaultTag:gt,name:"Listbox.Label"})}),yt="ul",wt=X.RenderStrategy|X.Static,Ot=D(function(e,t){var r;let[n,o]=G("Listbox.Options"),i=B(n.optionsRef,t),l=`headlessui-listbox-options-${ee()}`,a=K(),p=K(),u=ge(),f=(()=>u!==null?u===M.Open:n.listboxState===0)();s.exports.useEffect(()=>{var d;let v=n.optionsRef.current;!v||n.listboxState===0&&v!==((d=Le(v))==null?void 0:d.activeElement)&&v.focus({preventScroll:!0})},[n.listboxState,n.optionsRef]);let m=w(d=>{switch(p.dispose(),d.key){case E.Space:if(n.searchQuery!=="")return d.preventDefault(),d.stopPropagation(),o({type:5,value:d.key});case E.Enter:if(d.preventDefault(),d.stopPropagation(),n.activeOptionIndex!==null){let{dataRef:v}=n.options[n.activeOptionIndex];n.propsRef.current.onChange(v.current.value)}n.propsRef.current.mode===0&&(o({type:1}),q().nextFrame(()=>{var v;return(v=n.buttonRef.current)==null?void 0:v.focus({preventScroll:!0})}));break;case y(n.orientation,{vertical:E.ArrowDown,horizontal:E.ArrowRight}):return d.preventDefault(),d.stopPropagation(),o({type:4,focus:$.Next});case y(n.orientation,{vertical:E.ArrowUp,horizontal:E.ArrowLeft}):return d.preventDefault(),d.stopPropagation(),o({type:4,focus:$.Previous});case E.Home:case E.PageUp:return d.preventDefault(),d.stopPropagation(),o({type:4,focus:$.First});case E.End:case E.PageDown:return d.preventDefault(),d.stopPropagation(),o({type:4,focus:$.Last});case E.Escape:return d.preventDefault(),d.stopPropagation(),o({type:1}),a.nextFrame(()=>{var v;return(v=n.buttonRef.current)==null?void 0:v.focus({preventScroll:!0})});case E.Tab:d.preventDefault(),d.stopPropagation();break;default:d.key.length===1&&(o({type:5,value:d.key}),p.setTimeout(()=>o({type:6}),350));break}}),x=Ce(()=>{var d,v,R;return(R=(d=n.labelRef.current)==null?void 0:d.id)!=null?R:(v=n.buttonRef.current)==null?void 0:v.id},[n.labelRef.current,n.buttonRef.current]),h=s.exports.useMemo(()=>({open:n.listboxState===0}),[n]),c=e,b={"aria-activedescendant":n.activeOptionIndex===null||(r=n.options[n.activeOptionIndex])==null?void 0:r.id,"aria-multiselectable":n.propsRef.current.mode===1?!0:void 0,"aria-labelledby":x,"aria-orientation":n.orientation,id:l,onKeyDown:m,role:"listbox",tabIndex:0,ref:i};return H({ourProps:b,theirProps:c,slot:h,defaultTag:yt,features:wt,visible:f,name:"Listbox.Options"})}),Et="li",Rt=D(function(e,t){let{disabled:r=!1,value:n,...o}=e,[i,l]=G("Listbox.Option"),a=`headlessui-listbox-option-${ee()}`,p=i.activeOptionIndex!==null?i.options[i.activeOptionIndex].id===a:!1,{value:u,compare:f}=i.propsRef.current,m=y(i.propsRef.current.mode,{[1]:()=>u.some(C=>f(C,n)),[0]:()=>f(u,n)}),x=s.exports.useRef(null),h=B(t,x);T(()=>{if(i.listboxState!==0||!p||i.activationTrigger===0)return;let C=q();return C.requestAnimationFrame(()=>{var I,S;(S=(I=x.current)==null?void 0:I.scrollIntoView)==null||S.call(I,{block:"nearest"})}),C.dispose},[x,p,i.listboxState,i.activationTrigger,i.activeOptionIndex]);let c=s.exports.useRef({disabled:r,value:n,domRef:x});T(()=>{c.current.disabled=r},[c,r]),T(()=>{c.current.value=n},[c,n]),T(()=>{var C,I;c.current.textValue=(I=(C=x.current)==null?void 0:C.textContent)==null?void 0:I.toLowerCase()},[c,x]);let b=w(()=>i.propsRef.current.onChange(n));T(()=>(l({type:7,id:a,dataRef:c}),()=>l({type:8,id:a})),[c,a]);let d=w(C=>{if(r)return C.preventDefault();b(),i.propsRef.current.mode===0&&(l({type:1}),q().nextFrame(()=>{var I;return(I=i.buttonRef.current)==null?void 0:I.focus({preventScroll:!0})}))}),v=w(()=>{if(r)return l({type:4,focus:$.Nothing});l({type:4,focus:$.Specific,id:a})}),R=w(()=>{r||p||l({type:4,focus:$.Specific,id:a,trigger:0})}),_=w(()=>{r||!p||l({type:4,focus:$.Nothing})}),L=s.exports.useMemo(()=>({active:p,selected:m,disabled:r}),[p,m,r]);return H({ourProps:{id:a,ref:h,role:"option",tabIndex:r===!0?void 0:-1,"aria-disabled":r===!0?!0:void 0,"aria-selected":m,disabled:void 0,onClick:d,onFocus:v,onPointerMove:R,onMouseMove:R,onPointerLeave:_,onMouseLeave:_},theirProps:o,slot:L,defaultTag:Et,name:"Listbox.Option"})}),W=Object.assign(bt,{Button:xt,Label:St,Options:Ot,Option:Rt});function Tt(e){let t={called:!1};return(...r)=>{if(!t.called)return t.called=!0,e(...r)}}function ce(e,...t){e&&t.length>0&&e.classList.add(...t)}function de(e,...t){e&&t.length>0&&e.classList.remove(...t)}var me=(e=>(e.Ended="ended",e.Cancelled="cancelled",e))(me||{});function Ct(e,t){let r=q();if(!e)return r.dispose;let{transitionDuration:n,transitionDelay:o}=getComputedStyle(e),[i,l]=[n,o].map(a=>{let[p=0]=a.split(",").filter(Boolean).map(u=>u.includes("ms")?parseFloat(u):parseFloat(u)*1e3).sort((u,f)=>f-u);return p});if(i+l!==0){let a=[];a.push(r.addEventListener(e,"transitionrun",p=>{p.target===p.currentTarget&&(a.splice(0).forEach(u=>u()),a.push(r.addEventListener(e,"transitionend",u=>{u.target===u.currentTarget&&(t("ended"),a.splice(0).forEach(f=>f()))}),r.addEventListener(e,"transitioncancel",u=>{u.target===u.currentTarget&&(t("cancelled"),a.splice(0).forEach(f=>f()))})))}))}else t("ended");return r.add(()=>t("cancelled")),r.dispose}function Lt(e,t,r,n){let o=r?"enter":"leave",i=q(),l=n!==void 0?Tt(n):()=>{};o==="enter"&&(e.removeAttribute("hidden"),e.style.display="");let a=y(o,{enter:()=>t.enter,leave:()=>t.leave}),p=y(o,{enter:()=>t.enterTo,leave:()=>t.leaveTo}),u=y(o,{enter:()=>t.enterFrom,leave:()=>t.leaveFrom});return de(e,...t.enter,...t.enterTo,...t.enterFrom,...t.leave,...t.leaveFrom,...t.leaveTo,...t.entered),ce(e,...a,...u),i.nextFrame(()=>{de(e,...u),ce(e,...p),Ct(e,f=>(f==="ended"&&(de(e,...a),ce(e,...t.entered)),l(f)))}),i.dispose}function It({container:e,direction:t,classes:r,onStart:n,onStop:o}){let i=Ae(),l=K(),a=j(t);T(()=>{let p=q();l.add(p.dispose);let u=e.current;if(!!u&&a.current!=="idle"&&!!i.current)return p.dispose(),n.current(a.current),p.add(Lt(u,r.current,a.current==="enter",f=>{p.dispose(),y(f,{[me.Ended](){o.current(a.current)},[me.Cancelled]:()=>{}})})),p.dispose},[t])}function U(e=""){return e.split(" ").filter(t=>t.trim().length>1)}let te=s.exports.createContext(null);te.displayName="TransitionContext";var Pt=(e=>(e.Visible="visible",e.Hidden="hidden",e))(Pt||{});function $t(){let e=s.exports.useContext(te);if(e===null)throw new Error("A <Transition.Child /> is used but it is missing a parent <Transition /> or <Transition.Root />.");return e}function Nt(){let e=s.exports.useContext(ne);if(e===null)throw new Error("A <Transition.Child /> is used but it is missing a parent <Transition /> or <Transition.Root />.");return e}let ne=s.exports.createContext(null);ne.displayName="NestingContext";function re(e){return"children"in e?re(e.children):e.current.filter(({el:t})=>t.current!==null).filter(({state:t})=>t==="visible").length>0}function je(e,t){let r=j(e),n=s.exports.useRef([]),o=Ae(),i=K(),l=w((h,c=F.Hidden)=>{let b=n.current.findIndex(({el:d})=>d===h);b!==-1&&(y(c,{[F.Unmount](){n.current.splice(b,1)},[F.Hidden](){n.current[b].state="hidden"}}),i.microTask(()=>{var d;!re(n)&&o.current&&((d=r.current)==null||d.call(r))}))}),a=w(h=>{let c=n.current.find(({el:b})=>b===h);return c?c.state!=="visible"&&(c.state="visible"):n.current.push({el:h,state:"visible"}),()=>l(h,F.Unmount)}),p=s.exports.useRef([]),u=s.exports.useRef(Promise.resolve()),f=s.exports.useRef({enter:[],leave:[],idle:[]}),m=w((h,c,b)=>{p.current.splice(0),t&&(t.chains.current[c]=t.chains.current[c].filter(([d])=>d!==h)),t==null||t.chains.current[c].push([h,new Promise(d=>{p.current.push(d)})]),t==null||t.chains.current[c].push([h,new Promise(d=>{Promise.all(f.current[c].map(([v,R])=>R)).then(()=>d())})]),c==="enter"?u.current=u.current.then(()=>t==null?void 0:t.wait.current).then(()=>b(c)):b(c)}),x=w((h,c,b)=>{Promise.all(f.current[c].splice(0).map(([d,v])=>v)).then(()=>{var d;(d=p.current.shift())==null||d()}).then(()=>b(c))});return s.exports.useMemo(()=>({children:n,register:a,unregister:l,onStart:m,onStop:x,wait:u,chains:f}),[a,l,n,m,x,f,u])}function Ft(){}let Dt=["beforeEnter","afterEnter","beforeLeave","afterLeave"];function Re(e){var t;let r={};for(let n of Dt)r[n]=(t=e[n])!=null?t:Ft;return r}function kt(e){let t=s.exports.useRef(Re(e));return s.exports.useEffect(()=>{t.current=Re(e)},[e]),t}let At="div",Me=X.RenderStrategy,He=D(function(e,t){let{beforeEnter:r,afterEnter:n,beforeLeave:o,afterLeave:i,enter:l,enterFrom:a,enterTo:p,entered:u,leave:f,leaveFrom:m,leaveTo:x,...h}=e,c=s.exports.useRef(null),b=B(c,t),d=h.unmount?F.Unmount:F.Hidden,{show:v,appear:R,initial:_}=$t(),[L,C]=s.exports.useState(v?"visible":"hidden"),I=Nt(),{register:S,unregister:O}=I,P=s.exports.useRef(null);s.exports.useEffect(()=>S(c),[S,c]),s.exports.useEffect(()=>{if(d===F.Hidden&&!!c.current){if(v&&L!=="visible"){C("visible");return}return y(L,{hidden:()=>O(c),visible:()=>S(c)})}},[L,c,S,O,v,d]);let Y=j({enter:U(l),enterFrom:U(a),enterTo:U(p),entered:U(u),leave:U(f),leaveFrom:U(m),leaveTo:U(x)}),z=kt({beforeEnter:r,afterEnter:n,beforeLeave:o,afterLeave:i}),oe=be();s.exports.useEffect(()=>{if(oe&&L==="visible"&&c.current===null)throw new Error("Did you forget to passthrough the `ref` to the actual DOM node?")},[c,L,oe]);let le=_&&!R,Ve=(()=>!oe||le||P.current===v?"idle":v?"enter":"leave")(),Ue=w(k=>y(k,{enter:()=>z.current.beforeEnter(),leave:()=>z.current.beforeLeave(),idle:()=>{}})),qe=w(k=>y(k,{enter:()=>z.current.afterEnter(),leave:()=>z.current.afterLeave(),idle:()=>{}})),Z=je(()=>{C("hidden"),O(c)},I);It({container:c,classes:Y,direction:Ve,onStart:j(k=>{Z.onStart(c,k,Ue)}),onStop:j(k=>{Z.onStop(c,k,qe),k==="leave"&&!re(Z)&&(C("hidden"),O(c))})}),s.exports.useEffect(()=>{!le||(d===F.Hidden?P.current=null:P.current=v)},[v,le,L]);let Be=h,ze={ref:b};return g(ne.Provider,{value:Z,children:g(ke,{value:y(L,{visible:M.Open,hidden:M.Closed}),children:H({ourProps:ze,theirProps:Be,defaultTag:At,features:Me,visible:L==="visible",name:"Transition.Child"})})})}),ve=D(function(e,t){let{show:r,appear:n=!1,unmount:o,...i}=e,l=s.exports.useRef(null),a=B(l,t);be();let p=ge();if(r===void 0&&p!==null&&(r=y(p,{[M.Open]:!0,[M.Closed]:!1})),![!0,!1].includes(r))throw new Error("A <Transition /> is used but it is missing a `show={true | false}` prop.");let[u,f]=s.exports.useState(r?"visible":"hidden"),m=je(()=>{f("hidden")}),[x,h]=s.exports.useState(!0),c=s.exports.useRef([r]);T(()=>{x!==!1&&c.current[c.current.length-1]!==r&&(c.current.push(r),h(!1))},[c,r]);let b=s.exports.useMemo(()=>({show:r,appear:n,initial:x}),[r,n,x]);s.exports.useEffect(()=>{if(r)f("visible");else if(!re(m))f("hidden");else{let v=l.current;if(!v)return;let R=v.getBoundingClientRect();R.x===0&&R.y===0&&R.width===0&&R.height===0&&f("hidden")}},[r,m]);let d={unmount:o};return g(ne.Provider,{value:m,children:g(te.Provider,{value:b,children:H({ourProps:{...d,as:s.exports.Fragment,children:N.createElement(He,{ref:a,...d,...i})},theirProps:{},defaultTag:s.exports.Fragment,features:Me,visible:u==="visible",name:"Transition"})})})}),jt=D(function(e,t){let r=s.exports.useContext(te)!==null,n=ge()!==null;return g(pe,{children:!r&&n?N.createElement(ve,{ref:t,...e}):N.createElement(He,{ref:t,...e})})}),Mt=Object.assign(ve,{Child:jt,Root:ve});function Ht({title:e,titleId:t,...r},n){return A("svg",{...Object.assign({xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 24 24",fill:"currentColor","aria-hidden":"true",ref:n,"aria-labelledby":t},r),children:[e?g("title",{id:t,children:e}):null,g("path",{fillRule:"evenodd",d:"M19.916 4.626a.75.75 0 01.208 1.04l-9 13.5a.75.75 0 01-1.154.114l-6-6a.75.75 0 011.06-1.06l5.353 5.353 8.493-12.739a.75.75 0 011.04-.208z",clipRule:"evenodd"})]})}const _t=s.exports.forwardRef(Ht),Vt=_t;function Ut({title:e,titleId:t,...r},n){return A("svg",{...Object.assign({xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 24 24",fill:"currentColor","aria-hidden":"true",ref:n,"aria-labelledby":t},r),children:[e?g("title",{id:t,children:e}):null,g("path",{fillRule:"evenodd",d:"M12.53 16.28a.75.75 0 01-1.06 0l-7.5-7.5a.75.75 0 011.06-1.06L12 14.69l6.97-6.97a.75.75 0 111.06 1.06l-7.5 7.5z",clipRule:"evenodd"})]})}const qt=s.exports.forwardRef(Ut),Bt=qt,zt=["base","xl"],Q=({label:e,options:t,name:r,size:n="base",value:o=t[0],block:i=!1,labelHidden:l=!1,...a})=>g(W,{...a,children:({open:p})=>A(pe,{children:[g(W.Label,{className:V("block","font-medium","text-gray-700",{"sr-only":l}),children:e}),A("div",{className:"relative mt-1",children:[A(W.Button,{className:V("relative","cursor-default","rounded-lg","border","border-gray-300","bg-white","p-3","pl-3","pr-10","text-left","transition","hover:shadow-lg","hover:shadow-gray-200",`text-${n}`,{"w-full":i}),children:[A("span",{className:"flex items-center",children:[(o==null?void 0:o.image)&&g("img",{src:o.image.src,alt:"",className:"h-6 w-6 flex-shrink-0 rounded-full object-cover"}),g("span",{className:V({"ml-3":o.image},"block","truncate"),children:o.label})]}),g("span",{className:"pointer-events-none absolute inset-y-0 right-0 ml-2 flex items-center pr-2",children:g(Bt,{className:"h-5 w-5 text-gray-400","aria-hidden":"true"})})]}),g(Mt,{show:p,as:s.exports.Fragment,leave:"transition ease-in duration-100",leaveFrom:"opacity-100",leaveTo:"opacity-0",children:g(W.Options,{className:V("absolute","z-10","mt-1","max-h-56","overflow-auto","rounded-lg","bg-white","py-1","shadow-lg","ring-1","ring-black","ring-opacity-5","focus:outline-none",`text-${n}`,{"w-full":i}),children:t.map((u,f)=>g(W.Option,{className:({active:m})=>V(m?"text-white bg-so-color-accent-2-primary-500":"text-gray-900","relative cursor-default select-none py-2 pl-3 pr-12"),value:u,children:({selected:m,active:x})=>A(pe,{children:[A("div",{className:"flex items-center",children:[(u==null?void 0:u.image)&&g("img",{src:u.image.src,alt:"",className:"h-6 w-6 flex-shrink-0 rounded-full object-cover"}),g("span",{className:V(x?"font-semibold":"font-normal","truncate",{"ml-3":o.image}),children:u.label})]}),m&&g("span",{className:V("absolute inset-y-0 right-0 flex items-center pr-4"),children:g(Vt,{className:"h-5 w-5","aria-hidden":"true"})})]})},f))})})]})]})});try{Q.displayName="SoSelect",Q.__docgenInfo={description:"",displayName:"SoSelect",props:{label:{defaultValue:null,description:"The select's label elements",name:"label",required:!0,type:{name:"string"}},options:{defaultValue:null,description:"Options available for selection",name:"options",required:!0,type:{name:"SoSelectItem[]"}},value:{defaultValue:{value:"options[0]"},description:"The selected/current value",name:"value",required:!1,type:{name:"SoSelectItem"}},onChange:{defaultValue:null,description:"Emits the selected value on change",name:"onChange",required:!1,type:{name:"(value: SoSelectItem) => void"}},block:{defaultValue:{value:"false"},description:"Render full width",name:"block",required:!1,type:{name:"boolean"}},labelHidden:{defaultValue:{value:"false"},description:"If true, the label is visually hidden. It will still be available to screenreaders.",name:"labelHidden",required:!1,type:{name:"boolean"}},size:{defaultValue:{value:"base"},description:"Visual size of the button",name:"size",required:!1,type:{name:"string"}},disabled:{defaultValue:null,description:"",name:"disabled",required:!1,type:{name:"boolean"}},name:{defaultValue:null,description:"",name:"name",required:!1,type:{name:"string"}}}},typeof STORYBOOK_REACT_CLASSES<"u"&&(STORYBOOK_REACT_CLASSES["src/components/select/Select.tsx#SoSelect"]={docgenInfo:Q.__docgenInfo,name:"SoSelect",path:"src/components/select/Select.tsx#SoSelect"})}catch{}const Yt={parameters:{storySource:{source:`import { ComponentStory, ComponentMeta } from '@storybook/react';
import { useState } from 'react';

import { SoSelect, SoSelectProps, SO_SELECT_SIZES } from './Select';

export default {
	component: SoSelect,
	argTypes: {
		block: {
			defaultValue: false,
			description: 'If true, the control will be rendered with 100% width',
			control: { type: 'boolean' },
		},
		labelHidden: {
			defaultValue: false,
			description: 'If true, the label is only available to screenreaders, but visually hidden.',
			control: { type: 'boolean' },
		},
		size: {
			defaultValue: 'base',
			options: SO_SELECT_SIZES,
			control: { type: 'select' },
		},
	},
} as ComponentMeta<typeof SoSelect>;

// const Template: ComponentStory<typeof SoSelect> = (args) => <SoSelect {...args} />;
const Template: ComponentStory<typeof SoSelect> = (args: SoSelectProps) => {
	const options: SoSelectProps['options'] = args?.options || [
		{
			label: 'Option 1',
		},
		{
			label: 'Option 2',
		},
		{
			label: 'Option 3',
		},
	];

	const [value, setValue] = useState(options[0]);

	args = {
		label: 'Select Label',
		value,
		options,
		...args,
		onChange: (selectedItem) => {
			setValue(selectedItem);
		},
	};

	return <SoSelect {...args} />;
};

export const Standard: typeof Template = Template.bind({});
export const WithImages: typeof Template = Template.bind({});
WithImages.args = {
	label: 'Country Selector Example',
	options: [
		{
			label: 'Option 1',
			image: {
				src: '/public/ch.svg',
			},
		},
		{
			label: 'Option 2',
			image: {
				src: '/public/ch.svg',
			},
		},
		{
			label: 'Option 3',
			image: {
				src: '/public/ch.svg',
			},
		},
	],
};
`,locationsMap:{standard:{startLoc:{col:50,line:28},endLoc:{col:1,line:54},startBody:{col:50,line:28},endBody:{col:1,line:54}},"with-images":{startLoc:{col:50,line:28},endLoc:{col:1,line:54},startBody:{col:50,line:28},endBody:{col:1,line:54}}}}},component:Q,argTypes:{block:{defaultValue:!1,description:"If true, the control will be rendered with 100% width",control:{type:"boolean"}},labelHidden:{defaultValue:!1,description:"If true, the label is only available to screenreaders, but visually hidden.",control:{type:"boolean"}},size:{defaultValue:"base",options:zt,control:{type:"select"}}}},_e=e=>{const t=(e==null?void 0:e.options)||[{label:"Option 1"},{label:"Option 2"},{label:"Option 3"}],[r,n]=s.exports.useState(t[0]);return e={label:"Select Label",value:r,options:t,...e,onChange:o=>{n(o)}},g(Q,{...e})},Zt=_e.bind({}),Wt=_e.bind({});Wt.args={label:"Country Selector Example",options:[{label:"Option 1",image:{src:"/public/ch.svg"}},{label:"Option 2",image:{src:"/public/ch.svg"}},{label:"Option 3",image:{src:"/public/ch.svg"}}]};const Jt=["Standard","WithImages"];export{Zt as Standard,Wt as WithImages,Jt as __namedExportsOrder,Yt as default};
//# sourceMappingURL=Select.stories.fe318e00.js.map
