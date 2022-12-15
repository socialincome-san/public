/*! For license information please see 811.a57bf5b0.iframe.bundle.js.LICENSE.txt */
(self.webpackChunk_socialincome_ui=self.webpackChunk_socialincome_ui||[]).push([[811],{"../node_modules/classnames/index.js":(module,exports)=>{var __WEBPACK_AMD_DEFINE_RESULT__;!function(){"use strict";var hasOwn={}.hasOwnProperty;function classNames(){for(var classes=[],i=0;i<arguments.length;i++){var arg=arguments[i];if(arg){var argType=typeof arg;if("string"===argType||"number"===argType)classes.push(arg);else if(Array.isArray(arg)){if(arg.length){var inner=classNames.apply(null,arg);inner&&classes.push(inner)}}else if("object"===argType){if(arg.toString!==Object.prototype.toString&&!arg.toString.toString().includes("[native code]")){classes.push(arg.toString());continue}for(var key in arg)hasOwn.call(arg,key)&&arg[key]&&classes.push(key)}}}return classes.join(" ")}module.exports?(classNames.default=classNames,module.exports=classNames):void 0===(__WEBPACK_AMD_DEFINE_RESULT__=function(){return classNames}.apply(exports,[]))||(module.exports=__WEBPACK_AMD_DEFINE_RESULT__)}()},"../node_modules/core-js/modules/es.array.index-of.js":(__unused_webpack_module,__unused_webpack_exports,__webpack_require__)=>{"use strict";var $=__webpack_require__("../node_modules/core-js/internals/export.js"),uncurryThis=__webpack_require__("../node_modules/core-js/internals/function-uncurry-this.js"),$indexOf=__webpack_require__("../node_modules/core-js/internals/array-includes.js").indexOf,arrayMethodIsStrict=__webpack_require__("../node_modules/core-js/internals/array-method-is-strict.js"),nativeIndexOf=uncurryThis([].indexOf),NEGATIVE_ZERO=!!nativeIndexOf&&1/nativeIndexOf([1],1,-0)<0,STRICT_METHOD=arrayMethodIsStrict("indexOf");$({target:"Array",proto:!0,forced:NEGATIVE_ZERO||!STRICT_METHOD},{indexOf:function indexOf(searchElement){var fromIndex=arguments.length>1?arguments[1]:void 0;return NEGATIVE_ZERO?nativeIndexOf(this,searchElement,fromIndex)||0:$indexOf(this,searchElement,fromIndex)}})},"../node_modules/react/cjs/react-jsx-runtime.production.min.js":(__unused_webpack_module,exports,__webpack_require__)=>{"use strict";var f=__webpack_require__("../node_modules/react/index.js"),k=Symbol.for("react.element"),l=Symbol.for("react.fragment"),m=Object.prototype.hasOwnProperty,n=f.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner,p={key:!0,ref:!0,__self:!0,__source:!0};function q(c,a,g){var b,d={},e=null,h=null;for(b in void 0!==g&&(e=""+g),void 0!==a.key&&(e=""+a.key),void 0!==a.ref&&(h=a.ref),a)m.call(a,b)&&!p.hasOwnProperty(b)&&(d[b]=a[b]);if(c&&c.defaultProps)for(b in a=c.defaultProps)void 0===d[b]&&(d[b]=a[b]);return{$$typeof:k,type:c,key:e,ref:h,props:d,_owner:n.current}}exports.Fragment=l,exports.jsx=q,exports.jsxs=q},"../node_modules/react/jsx-runtime.js":(module,__unused_webpack_exports,__webpack_require__)=>{"use strict";module.exports=__webpack_require__("../node_modules/react/cjs/react-jsx-runtime.production.min.js")},"../node_modules/@headlessui/react/dist/components/keyboard.js":(__unused_webpack___webpack_module__,__webpack_exports__,__webpack_require__)=>{"use strict";__webpack_require__.d(__webpack_exports__,{R:()=>o});var r,o=((r=o||{}).Space=" ",r.Enter="Enter",r.Escape="Escape",r.Backspace="Backspace",r.Delete="Delete",r.ArrowLeft="ArrowLeft",r.ArrowUp="ArrowUp",r.ArrowRight="ArrowRight",r.ArrowDown="ArrowDown",r.Home="Home",r.End="End",r.PageUp="PageUp",r.PageDown="PageDown",r.Tab="Tab",r)},"../node_modules/@headlessui/react/dist/components/transitions/transition.js":(__unused_webpack___webpack_module__,__webpack_exports__,__webpack_require__)=>{"use strict";__webpack_require__.d(__webpack_exports__,{u:()=>We});var react=__webpack_require__("../node_modules/react/index.js"),render=__webpack_require__("../node_modules/@headlessui/react/dist/utils/render.js"),open_closed=__webpack_require__("../node_modules/@headlessui/react/dist/internal/open-closed.js"),match=__webpack_require__("../node_modules/@headlessui/react/dist/utils/match.js"),use_iso_morphic_effect=__webpack_require__("../node_modules/@headlessui/react/dist/hooks/use-iso-morphic-effect.js");function f(){let e=(0,react.useRef)(!1);return(0,use_iso_morphic_effect.e)((()=>(e.current=!0,()=>{e.current=!1})),[]),e}var use_latest_value=__webpack_require__("../node_modules/@headlessui/react/dist/hooks/use-latest-value.js"),use_server_handoff_complete=__webpack_require__("../node_modules/@headlessui/react/dist/hooks/use-server-handoff-complete.js"),use_sync_refs=__webpack_require__("../node_modules/@headlessui/react/dist/hooks/use-sync-refs.js");var disposables=__webpack_require__("../node_modules/@headlessui/react/dist/utils/disposables.js");function transition_f(t,...e){t&&e.length>0&&t.classList.add(...e)}function v(t,...e){t&&e.length>0&&t.classList.remove(...e)}var n,T=((n=T||{}).Ended="ended",n.Cancelled="cancelled",n);function C(t,e,n,d){let o=n?"enter":"leave",s=(0,disposables.k)(),u=void 0!==d?function l(r){let e={called:!1};return(...t)=>{if(!e.called)return e.called=!0,r(...t)}}(d):()=>{};"enter"===o&&(t.removeAttribute("hidden"),t.style.display="");let m=(0,match.E)(o,{enter:()=>e.enter,leave:()=>e.leave}),i=(0,match.E)(o,{enter:()=>e.enterTo,leave:()=>e.leaveTo}),a=(0,match.E)(o,{enter:()=>e.enterFrom,leave:()=>e.leaveFrom});return v(t,...e.enter,...e.enterTo,...e.enterFrom,...e.leave,...e.leaveFrom,...e.leaveTo,...e.entered),transition_f(t,...m,...a),s.nextFrame((()=>{v(t,...a),transition_f(t,...i),function c(t,e){let n=(0,disposables.k)();if(!t)return n.dispose;let{transitionDuration:d,transitionDelay:o}=getComputedStyle(t),[s,u]=[d,o].map((i=>{let[a=0]=i.split(",").filter(Boolean).map((r=>r.includes("ms")?parseFloat(r):1e3*parseFloat(r))).sort(((r,l)=>l-r));return a}));if(s+u!==0){let i=[];i.push(n.addEventListener(t,"transitionrun",(a=>{a.target===a.currentTarget&&(i.splice(0).forEach((r=>r())),i.push(n.addEventListener(t,"transitionend",(r=>{r.target===r.currentTarget&&(e("ended"),i.splice(0).forEach((l=>l())))})),n.addEventListener(t,"transitioncancel",(r=>{r.target===r.currentTarget&&(e("cancelled"),i.splice(0).forEach((l=>l())))}))))})))}else e("ended");return n.add((()=>e("cancelled"))),n.dispose}(t,(r=>("ended"===r&&(v(t,...m),transition_f(t,...e.entered)),u(r))))})),s.dispose}var use_disposables=__webpack_require__("../node_modules/@headlessui/react/dist/hooks/use-disposables.js");function I({container:o,direction:t,classes:s,onStart:a,onStop:u}){let c=f(),d=(0,use_disposables.G)(),r=(0,use_latest_value.E)(t);(0,use_iso_morphic_effect.e)((()=>{let e=(0,disposables.k)();d.add(e.dispose);let n=o.current;if(n&&"idle"!==r.current&&c.current)return e.dispose(),a.current(r.current),e.add(C(n,s.current,"enter"===r.current,(l=>{e.dispose(),(0,match.E)(l,{[T.Ended](){u.current(r.current)},[T.Cancelled]:()=>{}})}))),e.dispose}),[t])}var use_event=__webpack_require__("../node_modules/@headlessui/react/dist/hooks/use-event.js");function x(r=""){return r.split(" ").filter((e=>e.trim().length>1))}let F=(0,react.createContext)(null);F.displayName="TransitionContext";var s,ve=((s=ve||{}).Visible="visible",s.Hidden="hidden",s);let M=(0,react.createContext)(null);function transition_I(r){return"children"in r?transition_I(r.children):r.current.filter((({el:e})=>null!==e.current)).filter((({state:e})=>"visible"===e)).length>0}function ee(r,e){let s=(0,use_latest_value.E)(r),n=(0,react.useRef)([]),m=f(),D=(0,use_disposables.G)(),b=(0,use_event.z)(((l,i=render.l4.Hidden)=>{let t=n.current.findIndex((({el:o})=>o===l));-1!==t&&((0,match.E)(i,{[render.l4.Unmount](){n.current.splice(t,1)},[render.l4.Hidden](){n.current[t].state="hidden"}}),D.microTask((()=>{var o;!transition_I(n)&&m.current&&(null==(o=s.current)||o.call(s))})))})),E=(0,use_event.z)((l=>{let i=n.current.find((({el:t})=>t===l));return i?"visible"!==i.state&&(i.state="visible"):n.current.push({el:l,state:"visible"}),()=>b(l,render.l4.Unmount)})),S=(0,react.useRef)([]),u=(0,react.useRef)(Promise.resolve()),p=(0,react.useRef)({enter:[],leave:[],idle:[]}),d=(0,use_event.z)(((l,i,t)=>{S.current.splice(0),e&&(e.chains.current[i]=e.chains.current[i].filter((([o])=>o!==l))),null==e||e.chains.current[i].push([l,new Promise((o=>{S.current.push(o)}))]),null==e||e.chains.current[i].push([l,new Promise((o=>{Promise.all(p.current[i].map((([f,a])=>a))).then((()=>o()))}))]),"enter"===i?u.current=u.current.then((()=>null==e?void 0:e.wait.current)).then((()=>t(i))):t(i)})),h=(0,use_event.z)(((l,i,t)=>{Promise.all(p.current[i].splice(0).map((([o,f])=>f))).then((()=>{var o;null==(o=S.current.shift())||o()})).then((()=>t(i)))}));return(0,react.useMemo)((()=>({children:n,register:E,unregister:b,onStart:d,onStop:h,wait:u,chains:p})),[E,b,n,d,h,p,u])}function be(){}M.displayName="NestingContext";let Ee=["beforeEnter","afterEnter","beforeLeave","afterLeave"];function te(r){var s;let e={};for(let n of Ee)e[n]=null!=(s=r[n])?s:be;return e}let ne=render.AN.RenderStrategy,re=(0,render.yV)((function(e,s){let{beforeEnter:n,afterEnter:m,beforeLeave:D,afterLeave:b,enter:E,enterFrom:S,enterTo:u,entered:p,leave:d,leaveFrom:h,leaveTo:l,...i}=e,t=(0,react.useRef)(null),o=(0,use_sync_refs.T)(t,s),f=i.unmount?render.l4.Unmount:render.l4.Hidden,{show:a,appear:P,initial:ie}=function Ce(){let r=(0,react.useContext)(F);if(null===r)throw new Error("A <Transition.Child /> is used but it is missing a parent <Transition /> or <Transition.Root />.");return r}(),[v,_]=(0,react.useState)(a?"visible":"hidden"),z=function ge(){let r=(0,react.useContext)(M);if(null===r)throw new Error("A <Transition.Child /> is used but it is missing a parent <Transition /> or <Transition.Root />.");return r}(),{register:N,unregister:V}=z,j=(0,react.useRef)(null);(0,react.useEffect)((()=>N(t)),[N,t]),(0,react.useEffect)((()=>{if(f===render.l4.Hidden&&t.current)return a&&"visible"!==v?void _("visible"):(0,match.E)(v,{hidden:()=>V(t),visible:()=>N(t)})}),[v,t,N,V,a,f]);let oe=(0,use_latest_value.E)({enter:x(E),enterFrom:x(S),enterTo:x(u),entered:x(p),leave:x(d),leaveFrom:x(h),leaveTo:x(l)}),L=function Se(r){let e=(0,react.useRef)(te(r));return(0,react.useEffect)((()=>{e.current=te(r)}),[r]),e}({beforeEnter:n,afterEnter:m,beforeLeave:D,afterLeave:b}),U=(0,use_server_handoff_complete.H)();(0,react.useEffect)((()=>{if(U&&"visible"===v&&null===t.current)throw new Error("Did you forget to passthrough the `ref` to the actual DOM node?")}),[t,v,U]);let k=ie&&!P,se=!U||k||j.current===a?"idle":a?"enter":"leave",le=(0,use_event.z)((C=>(0,match.E)(C,{enter:()=>L.current.beforeEnter(),leave:()=>L.current.beforeLeave(),idle:()=>{}}))),ae=(0,use_event.z)((C=>(0,match.E)(C,{enter:()=>L.current.afterEnter(),leave:()=>L.current.afterLeave(),idle:()=>{}}))),w=ee((()=>{_("hidden"),V(t)}),z);I({container:t,classes:oe,direction:se,onStart:(0,use_latest_value.E)((C=>{w.onStart(t,C,le)})),onStop:(0,use_latest_value.E)((C=>{w.onStop(t,C,ae),"leave"===C&&!transition_I(w)&&(_("hidden"),V(t))}))}),(0,react.useEffect)((()=>{!k||(f===render.l4.Hidden?j.current=null:j.current=a)}),[a,k,v]);let ue=i,de={ref:o};return react.createElement(M.Provider,{value:w},react.createElement(open_closed.up,{value:(0,match.E)(v,{visible:open_closed.ZM.Open,hidden:open_closed.ZM.Closed})},(0,render.sY)({ourProps:de,theirProps:ue,defaultTag:"div",features:ne,visible:"visible"===v,name:"Transition.Child"})))})),q=(0,render.yV)((function(e,s){let{show:n,appear:m=!1,unmount:D,...b}=e,E=(0,react.useRef)(null),S=(0,use_sync_refs.T)(E,s);(0,use_server_handoff_complete.H)();let u=(0,open_closed.oJ)();if(void 0===n&&null!==u&&(n=(0,match.E)(u,{[open_closed.ZM.Open]:!0,[open_closed.ZM.Closed]:!1})),![!0,!1].includes(n))throw new Error("A <Transition /> is used but it is missing a `show={true | false}` prop.");let[p,d]=(0,react.useState)(n?"visible":"hidden"),h=ee((()=>{d("hidden")})),[l,i]=(0,react.useState)(!0),t=(0,react.useRef)([n]);(0,use_iso_morphic_effect.e)((()=>{!1!==l&&t.current[t.current.length-1]!==n&&(t.current.push(n),i(!1))}),[t,n]);let o=(0,react.useMemo)((()=>({show:n,appear:m,initial:l})),[n,m,l]);(0,react.useEffect)((()=>{if(n)d("visible");else if(transition_I(h)){let a=E.current;if(!a)return;let P=a.getBoundingClientRect();0===P.x&&0===P.y&&0===P.width&&0===P.height&&d("hidden")}else d("hidden")}),[n,h]);let f={unmount:D};return react.createElement(M.Provider,{value:h},react.createElement(F.Provider,{value:o},(0,render.sY)({ourProps:{...f,as:react.Fragment,children:react.createElement(re,{ref:S,...f,...b})},theirProps:{},defaultTag:react.Fragment,features:ne,visible:"visible"===p,name:"Transition"})))})),Pe=(0,render.yV)((function(e,s){let n=null!==(0,react.useContext)(F),m=null!==(0,open_closed.oJ)();return react.createElement(react.Fragment,null,!n&&m?react.createElement(q,{ref:s,...e}):react.createElement(re,{ref:s,...e}))})),We=Object.assign(q,{Child:Pe,Root:q})},"../node_modules/@headlessui/react/dist/hooks/use-computed.js":(__unused_webpack___webpack_module__,__webpack_exports__,__webpack_require__)=>{"use strict";__webpack_require__.d(__webpack_exports__,{v:()=>i});var react__WEBPACK_IMPORTED_MODULE_0__=__webpack_require__("../node_modules/react/index.js"),_use_iso_morphic_effect_js__WEBPACK_IMPORTED_MODULE_2__=__webpack_require__("../node_modules/@headlessui/react/dist/hooks/use-iso-morphic-effect.js"),_use_latest_value_js__WEBPACK_IMPORTED_MODULE_1__=__webpack_require__("../node_modules/@headlessui/react/dist/hooks/use-latest-value.js");function i(e,o){let[u,t]=(0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(e),r=(0,_use_latest_value_js__WEBPACK_IMPORTED_MODULE_1__.E)(e);return(0,_use_iso_morphic_effect_js__WEBPACK_IMPORTED_MODULE_2__.e)((()=>t(r.current)),[r,t,...o]),u}},"../node_modules/@headlessui/react/dist/hooks/use-controllable.js":(__unused_webpack___webpack_module__,__webpack_exports__,__webpack_require__)=>{"use strict";__webpack_require__.d(__webpack_exports__,{q:()=>p});var react__WEBPACK_IMPORTED_MODULE_0__=__webpack_require__("../node_modules/react/index.js"),_use_event_js__WEBPACK_IMPORTED_MODULE_1__=__webpack_require__("../node_modules/@headlessui/react/dist/hooks/use-event.js");function p(e,t,u){let[l,s]=(0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(u),i=void 0!==e;return[i?e:l,(0,_use_event_js__WEBPACK_IMPORTED_MODULE_1__.z)((r=>(i||s(r),null==t?void 0:t(r))))]}},"../node_modules/@headlessui/react/dist/hooks/use-disposables.js":(__unused_webpack___webpack_module__,__webpack_exports__,__webpack_require__)=>{"use strict";__webpack_require__.d(__webpack_exports__,{G:()=>p});var react__WEBPACK_IMPORTED_MODULE_0__=__webpack_require__("../node_modules/react/index.js"),_utils_disposables_js__WEBPACK_IMPORTED_MODULE_1__=__webpack_require__("../node_modules/@headlessui/react/dist/utils/disposables.js");function p(){let[e]=(0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(_utils_disposables_js__WEBPACK_IMPORTED_MODULE_1__.k);return(0,react__WEBPACK_IMPORTED_MODULE_0__.useEffect)((()=>()=>e.dispose()),[e]),e}},"../node_modules/@headlessui/react/dist/hooks/use-event.js":(__unused_webpack___webpack_module__,__webpack_exports__,__webpack_require__)=>{"use strict";__webpack_require__.d(__webpack_exports__,{z:()=>o});var react__WEBPACK_IMPORTED_MODULE_0__=__webpack_require__("../node_modules/react/index.js"),_use_latest_value_js__WEBPACK_IMPORTED_MODULE_1__=__webpack_require__("../node_modules/@headlessui/react/dist/hooks/use-latest-value.js");let o=function(t){let e=(0,_use_latest_value_js__WEBPACK_IMPORTED_MODULE_1__.E)(t);return react__WEBPACK_IMPORTED_MODULE_0__.useCallback(((...r)=>e.current(...r)),[e])}},"../node_modules/@headlessui/react/dist/hooks/use-id.js":(__unused_webpack___webpack_module__,__webpack_exports__,__webpack_require__)=>{"use strict";__webpack_require__.d(__webpack_exports__,{M:()=>I});var u,react__WEBPACK_IMPORTED_MODULE_0__=__webpack_require__("../node_modules/react/index.js"),_use_iso_morphic_effect_js__WEBPACK_IMPORTED_MODULE_2__=__webpack_require__("../node_modules/@headlessui/react/dist/hooks/use-iso-morphic-effect.js"),_use_server_handoff_complete_js__WEBPACK_IMPORTED_MODULE_1__=__webpack_require__("../node_modules/@headlessui/react/dist/hooks/use-server-handoff-complete.js");let l=0;function r(){return++l}let I=null!=(u=react__WEBPACK_IMPORTED_MODULE_0__.useId)?u:function(){let n=(0,_use_server_handoff_complete_js__WEBPACK_IMPORTED_MODULE_1__.H)(),[e,o]=react__WEBPACK_IMPORTED_MODULE_0__.useState(n?r:null);return(0,_use_iso_morphic_effect_js__WEBPACK_IMPORTED_MODULE_2__.e)((()=>{null===e&&o(r())}),[e]),null!=e?""+e:void 0}},"../node_modules/@headlessui/react/dist/hooks/use-iso-morphic-effect.js":(__unused_webpack___webpack_module__,__webpack_exports__,__webpack_require__)=>{"use strict";__webpack_require__.d(__webpack_exports__,{e:()=>s});var react__WEBPACK_IMPORTED_MODULE_0__=__webpack_require__("../node_modules/react/index.js");let s=__webpack_require__("../node_modules/@headlessui/react/dist/utils/ssr.js").s?react__WEBPACK_IMPORTED_MODULE_0__.useEffect:react__WEBPACK_IMPORTED_MODULE_0__.useLayoutEffect},"../node_modules/@headlessui/react/dist/hooks/use-latest-value.js":(__unused_webpack___webpack_module__,__webpack_exports__,__webpack_require__)=>{"use strict";__webpack_require__.d(__webpack_exports__,{E:()=>s});var react__WEBPACK_IMPORTED_MODULE_0__=__webpack_require__("../node_modules/react/index.js"),_use_iso_morphic_effect_js__WEBPACK_IMPORTED_MODULE_1__=__webpack_require__("../node_modules/@headlessui/react/dist/hooks/use-iso-morphic-effect.js");function s(e){let r=(0,react__WEBPACK_IMPORTED_MODULE_0__.useRef)(e);return(0,_use_iso_morphic_effect_js__WEBPACK_IMPORTED_MODULE_1__.e)((()=>{r.current=e}),[e]),r}},"../node_modules/@headlessui/react/dist/hooks/use-outside-click.js":(__unused_webpack___webpack_module__,__webpack_exports__,__webpack_require__)=>{"use strict";__webpack_require__.d(__webpack_exports__,{O:()=>L});var react=__webpack_require__("../node_modules/react/index.js"),focus_management=__webpack_require__("../node_modules/@headlessui/react/dist/utils/focus-management.js"),use_latest_value=__webpack_require__("../node_modules/@headlessui/react/dist/hooks/use-latest-value.js");function d(e,r,n){let o=(0,use_latest_value.E)(r);(0,react.useEffect)((()=>{function t(u){o.current(u)}return document.addEventListener(e,t,n),()=>document.removeEventListener(e,t,n)}),[e,n])}function L(s,E,a=!0){let i=(0,react.useRef)(!1);function f(e,l){if(!i.current||e.defaultPrevented)return;let o=function r(t){return"function"==typeof t?r(t()):Array.isArray(t)||t instanceof Set?t:[t]}(s),n=l(e);if(null!==n&&n.ownerDocument.documentElement.contains(n)){for(let r of o){if(null===r)continue;let t=r instanceof HTMLElement?r:r.current;if(null!=t&&t.contains(n))return}return!(0,focus_management.sP)(n,focus_management.tJ.Loose)&&-1!==n.tabIndex&&e.preventDefault(),E(e,n)}}(0,react.useEffect)((()=>{requestAnimationFrame((()=>{i.current=a}))}),[a]);let u=(0,react.useRef)(null);d("mousedown",(e=>{var l,o;i.current&&(u.current=(null==(o=null==(l=e.composedPath)?void 0:l.call(e))?void 0:o[0])||e.target)}),!0),d("click",(e=>{!u.current||(f(e,(()=>u.current)),u.current=null)}),!0),d("blur",(e=>f(e,(()=>window.document.activeElement instanceof HTMLIFrameElement?window.document.activeElement:null))),!0)}},"../node_modules/@headlessui/react/dist/hooks/use-resolve-button-type.js":(__unused_webpack___webpack_module__,__webpack_exports__,__webpack_require__)=>{"use strict";__webpack_require__.d(__webpack_exports__,{f:()=>s});var react__WEBPACK_IMPORTED_MODULE_0__=__webpack_require__("../node_modules/react/index.js"),_use_iso_morphic_effect_js__WEBPACK_IMPORTED_MODULE_1__=__webpack_require__("../node_modules/@headlessui/react/dist/hooks/use-iso-morphic-effect.js");function i(t){var n;if(t.type)return t.type;let e=null!=(n=t.as)?n:"button";return"string"==typeof e&&"button"===e.toLowerCase()?"button":void 0}function s(t,e){let[n,u]=(0,react__WEBPACK_IMPORTED_MODULE_0__.useState)((()=>i(t)));return(0,_use_iso_morphic_effect_js__WEBPACK_IMPORTED_MODULE_1__.e)((()=>{u(i(t))}),[t.type,t.as]),(0,_use_iso_morphic_effect_js__WEBPACK_IMPORTED_MODULE_1__.e)((()=>{n||!e.current||e.current instanceof HTMLButtonElement&&!e.current.hasAttribute("type")&&u("button")}),[n,e]),n}},"../node_modules/@headlessui/react/dist/hooks/use-server-handoff-complete.js":(__unused_webpack___webpack_module__,__webpack_exports__,__webpack_require__)=>{"use strict";__webpack_require__.d(__webpack_exports__,{H:()=>a});var react__WEBPACK_IMPORTED_MODULE_0__=__webpack_require__("../node_modules/react/index.js");let r={serverHandoffComplete:!1};function a(){let[e,f]=(0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(r.serverHandoffComplete);return(0,react__WEBPACK_IMPORTED_MODULE_0__.useEffect)((()=>{!0!==e&&f(!0)}),[e]),(0,react__WEBPACK_IMPORTED_MODULE_0__.useEffect)((()=>{!1===r.serverHandoffComplete&&(r.serverHandoffComplete=!0)}),[]),e}},"../node_modules/@headlessui/react/dist/hooks/use-sync-refs.js":(__unused_webpack___webpack_module__,__webpack_exports__,__webpack_require__)=>{"use strict";__webpack_require__.d(__webpack_exports__,{T:()=>y});var react__WEBPACK_IMPORTED_MODULE_0__=__webpack_require__("../node_modules/react/index.js"),_use_event_js__WEBPACK_IMPORTED_MODULE_1__=__webpack_require__("../node_modules/@headlessui/react/dist/hooks/use-event.js");let u=Symbol();function y(...t){let n=(0,react__WEBPACK_IMPORTED_MODULE_0__.useRef)(t);(0,react__WEBPACK_IMPORTED_MODULE_0__.useEffect)((()=>{n.current=t}),[t]);let c=(0,_use_event_js__WEBPACK_IMPORTED_MODULE_1__.z)((e=>{for(let o of n.current)null!=o&&("function"==typeof o?o(e):o.current=e)}));return t.every((e=>null==e||(null==e?void 0:e[u])))?void 0:c}},"../node_modules/@headlessui/react/dist/internal/hidden.js":(__unused_webpack___webpack_module__,__webpack_exports__,__webpack_require__)=>{"use strict";__webpack_require__.d(__webpack_exports__,{A:()=>s,_:()=>h});var _utils_render_js__WEBPACK_IMPORTED_MODULE_0__=__webpack_require__("../node_modules/@headlessui/react/dist/utils/render.js");var e,s=((e=s||{})[e.None=1]="None",e[e.Focusable=2]="Focusable",e[e.Hidden=4]="Hidden",e);let h=(0,_utils_render_js__WEBPACK_IMPORTED_MODULE_0__.yV)((function(t,o){let{features:e=1,...r}=t,d={ref:o,"aria-hidden":2==(2&e)||void 0,style:{position:"fixed",top:1,left:1,width:1,height:0,padding:0,margin:-1,overflow:"hidden",clip:"rect(0, 0, 0, 0)",whiteSpace:"nowrap",borderWidth:"0",...4==(4&e)&&2!=(2&e)&&{display:"none"}}};return(0,_utils_render_js__WEBPACK_IMPORTED_MODULE_0__.sY)({ourProps:d,theirProps:r,slot:{},defaultTag:"div",name:"Hidden"})}))},"../node_modules/@headlessui/react/dist/internal/open-closed.js":(__unused_webpack___webpack_module__,__webpack_exports__,__webpack_require__)=>{"use strict";__webpack_require__.d(__webpack_exports__,{ZM:()=>p,oJ:()=>s,up:()=>C});var react__WEBPACK_IMPORTED_MODULE_0__=__webpack_require__("../node_modules/react/index.js");let o=(0,react__WEBPACK_IMPORTED_MODULE_0__.createContext)(null);o.displayName="OpenClosedContext";var e,p=((e=p||{})[e.Open=0]="Open",e[e.Closed=1]="Closed",e);function s(){return(0,react__WEBPACK_IMPORTED_MODULE_0__.useContext)(o)}function C({value:t,children:n}){return react__WEBPACK_IMPORTED_MODULE_0__.createElement(o.Provider,{value:t},n)}},"../node_modules/@headlessui/react/dist/utils/bugs.js":(__unused_webpack___webpack_module__,__webpack_exports__,__webpack_require__)=>{"use strict";function r(n){let e=n.parentElement,l=null;for(;e&&!(e instanceof HTMLFieldSetElement);)e instanceof HTMLLegendElement&&(l=e),e=e.parentElement;let t=""===(null==e?void 0:e.getAttribute("disabled"));return(!t||!function i(n){if(!n)return!1;let e=n.previousElementSibling;for(;null!==e;){if(e instanceof HTMLLegendElement)return!1;e=e.previousElementSibling}return!0}(l))&&t}__webpack_require__.d(__webpack_exports__,{P:()=>r})},"../node_modules/@headlessui/react/dist/utils/calculate-active-index.js":(__unused_webpack___webpack_module__,__webpack_exports__,__webpack_require__)=>{"use strict";__webpack_require__.d(__webpack_exports__,{T:()=>a,d:()=>x});var e,a=((e=a||{})[e.First=0]="First",e[e.Previous=1]="Previous",e[e.Next=2]="Next",e[e.Last=3]="Last",e[e.Specific=4]="Specific",e[e.Nothing=5]="Nothing",e);function x(r,n){let t=n.resolveItems();if(t.length<=0)return null;let l=n.resolveActiveIndex(),s=null!=l?l:-1,d=(()=>{switch(r.focus){case 0:return t.findIndex((e=>!n.resolveDisabled(e)));case 1:{let e=t.slice().reverse().findIndex(((i,c,u)=>!(-1!==s&&u.length-c-1>=s)&&!n.resolveDisabled(i)));return-1===e?e:t.length-1-e}case 2:return t.findIndex(((e,i)=>!(i<=s)&&!n.resolveDisabled(e)));case 3:{let e=t.slice().reverse().findIndex((i=>!n.resolveDisabled(i)));return-1===e?e:t.length-1-e}case 4:return t.findIndex((e=>n.resolveId(e)===r.id));case 5:return null;default:!function f(r){throw new Error("Unexpected object: "+r)}(r)}})();return-1===d?l:d}},"../node_modules/@headlessui/react/dist/utils/disposables.js":(__unused_webpack___webpack_module__,__webpack_exports__,__webpack_require__)=>{"use strict";function m(){let n=[],i=[],r={enqueue(e){i.push(e)},addEventListener:(e,t,a,o)=>(e.addEventListener(t,a,o),r.add((()=>e.removeEventListener(t,a,o)))),requestAnimationFrame(...e){let t=requestAnimationFrame(...e);return r.add((()=>cancelAnimationFrame(t)))},nextFrame:(...e)=>r.requestAnimationFrame((()=>r.requestAnimationFrame(...e))),setTimeout(...e){let t=setTimeout(...e);return r.add((()=>clearTimeout(t)))},microTask(...e){let t={current:!0};return function micro_task_t(e){"function"==typeof queueMicrotask?queueMicrotask(e):Promise.resolve().then(e).catch((o=>setTimeout((()=>{throw o}))))}((()=>{t.current&&e[0]()})),r.add((()=>{t.current=!1}))},add:e=>(n.push(e),()=>{let t=n.indexOf(e);if(t>=0){let[a]=n.splice(t,1);a()}}),dispose(){for(let e of n.splice(0))e()},async workQueue(){for(let e of i.splice(0))await e()}};return r}__webpack_require__.d(__webpack_exports__,{k:()=>m})},"../node_modules/@headlessui/react/dist/utils/focus-management.js":(__unused_webpack___webpack_module__,__webpack_exports__,__webpack_require__)=>{"use strict";__webpack_require__.d(__webpack_exports__,{sP:()=>F,tJ:()=>N,z2:()=>S});var _match_js__WEBPACK_IMPORTED_MODULE_1__=__webpack_require__("../node_modules/@headlessui/react/dist/utils/match.js"),_owner_js__WEBPACK_IMPORTED_MODULE_0__=__webpack_require__("../node_modules/@headlessui/react/dist/utils/owner.js");let m=["[contentEditable=true]","[tabindex]","a[href]","area[href]","button:not([disabled])","iframe","input:not([disabled])","select:not([disabled])","textarea:not([disabled])"].map((e=>`${e}:not([tabindex='-1'])`)).join(",");var r,o,n,T=((n=T||{})[n.First=1]="First",n[n.Previous=2]="Previous",n[n.Next=4]="Next",n[n.Last=8]="Last",n[n.WrapAround=16]="WrapAround",n[n.NoScroll=32]="NoScroll",n),M=((o=M||{})[o.Error=0]="Error",o[o.Overflow=1]="Overflow",o[o.Success=2]="Success",o[o.Underflow=3]="Underflow",o),b=((r=b||{})[r.Previous=-1]="Previous",r[r.Next=1]="Next",r);var N=(r=>(r[r.Strict=0]="Strict",r[r.Loose=1]="Loose",r))(N||{});function F(e,t=0){var r;return e!==(null==(r=(0,_owner_js__WEBPACK_IMPORTED_MODULE_0__.r)(e))?void 0:r.body)&&(0,_match_js__WEBPACK_IMPORTED_MODULE_1__.E)(t,{0:()=>e.matches(m),1(){let l=e;for(;null!==l;){if(l.matches(m))return!0;l=l.parentElement}return!1}})}["textarea","input"].join(",");function S(e,t=(r=>r)){return e.slice().sort(((r,l)=>{let o=t(r),s=t(l);if(null===o||null===s)return 0;let n=o.compareDocumentPosition(s);return n&Node.DOCUMENT_POSITION_FOLLOWING?-1:n&Node.DOCUMENT_POSITION_PRECEDING?1:0}))}},"../node_modules/@headlessui/react/dist/utils/form.js":(__unused_webpack___webpack_module__,__webpack_exports__,__webpack_require__)=>{"use strict";function e(n={},r=null,t=[]){for(let[i,o]of Object.entries(n))f(t,s(r,i),o);return t}function s(n,r){return n?n+"["+r+"]":r}function f(n,r,t){if(Array.isArray(t))for(let[i,o]of t.entries())f(n,s(r,i.toString()),o);else t instanceof Date?n.push([r,t.toISOString()]):"boolean"==typeof t?n.push([r,t?"1":"0"]):"string"==typeof t?n.push([r,t]):"number"==typeof t?n.push([r,`${t}`]):null==t?n.push([r,""]):e(t,r,n)}__webpack_require__.d(__webpack_exports__,{t:()=>e})},"../node_modules/@headlessui/react/dist/utils/match.js":(__unused_webpack___webpack_module__,__webpack_exports__,__webpack_require__)=>{"use strict";function u(r,n,...a){if(r in n){let e=n[r];return"function"==typeof e?e(...a):e}let t=new Error(`Tried to handle "${r}" but there is no handler defined. Only defined handlers are: ${Object.keys(n).map((e=>`"${e}"`)).join(", ")}.`);throw Error.captureStackTrace&&Error.captureStackTrace(t,u),t}__webpack_require__.d(__webpack_exports__,{E:()=>u})},"../node_modules/@headlessui/react/dist/utils/owner.js":(__unused_webpack___webpack_module__,__webpack_exports__,__webpack_require__)=>{"use strict";__webpack_require__.d(__webpack_exports__,{r:()=>e});var _ssr_js__WEBPACK_IMPORTED_MODULE_0__=__webpack_require__("../node_modules/@headlessui/react/dist/utils/ssr.js");function e(r){return _ssr_js__WEBPACK_IMPORTED_MODULE_0__.s?null:r instanceof Node?r.ownerDocument:null!=r&&r.hasOwnProperty("current")&&r.current instanceof Node?r.current.ownerDocument:document}},"../node_modules/@headlessui/react/dist/utils/render.js":(__unused_webpack___webpack_module__,__webpack_exports__,__webpack_require__)=>{"use strict";__webpack_require__.d(__webpack_exports__,{AN:()=>S,l4:()=>j,oA:()=>F,sY:()=>$,yV:()=>C});var e,a,react__WEBPACK_IMPORTED_MODULE_0__=__webpack_require__("../node_modules/react/index.js"),_match_js__WEBPACK_IMPORTED_MODULE_1__=__webpack_require__("../node_modules/@headlessui/react/dist/utils/match.js"),S=((a=S||{})[a.None=0]="None",a[a.RenderStrategy=1]="RenderStrategy",a[a.Static=2]="Static",a),j=((e=j||{})[e.Unmount=0]="Unmount",e[e.Hidden=1]="Hidden",e);function $({ourProps:r,theirProps:t,slot:e,defaultTag:a,features:o,visible:n=!0,name:l}){let s=T(t,r);if(n)return p(s,e,a,l);let u=null!=o?o:0;if(2&u){let{static:i=!1,...d}=s;if(i)return p(d,e,a,l)}if(1&u){let{unmount:i=!0,...d}=s;return(0,_match_js__WEBPACK_IMPORTED_MODULE_1__.E)(i?0:1,{0:()=>null,1:()=>p({...d,hidden:!0,style:{display:"none"}},e,a,l)})}return p(s,e,a,l)}function p(r,t={},e,a){let{as:o=e,children:n,refName:l="ref",...s}=m(r,["unmount","static"]),u=void 0!==r.ref?{[l]:r.ref}:{},i="function"==typeof n?n(t):n;s.className&&"function"==typeof s.className&&(s.className=s.className(t));let d={};if(t){let f=!1,y=[];for(let[h,g]of Object.entries(t))"boolean"==typeof g&&(f=!0),!0===g&&y.push(h);f&&(d["data-headlessui-state"]=y.join(" "))}if(o===react__WEBPACK_IMPORTED_MODULE_0__.Fragment&&Object.keys(F(s)).length>0){if(!(0,react__WEBPACK_IMPORTED_MODULE_0__.isValidElement)(i)||Array.isArray(i)&&i.length>1)throw new Error(['Passing props on "Fragment"!',"",`The current component <${a} /> is rendering a "Fragment".`,"However we need to passthrough the following props:",Object.keys(s).map((f=>`  - ${f}`)).join("\n"),"","You can apply a few solutions:",['Add an `as="..."` prop, to ensure that we render an actual element instead of a "Fragment".',"Render a single element as the child so that we can forward the props onto that element."].map((f=>`  - ${f}`)).join("\n")].join("\n"));return(0,react__WEBPACK_IMPORTED_MODULE_0__.cloneElement)(i,Object.assign({},T(i.props,F(m(s,["ref"]))),d,u,function w(...r){return{ref:r.every((t=>null==t))?void 0:t=>{for(let e of r)null!=e&&("function"==typeof e?e(t):e.current=t)}}}(i.ref,u.ref)))}return(0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(o,Object.assign({},m(s,["ref"]),o!==react__WEBPACK_IMPORTED_MODULE_0__.Fragment&&u,o!==react__WEBPACK_IMPORTED_MODULE_0__.Fragment&&d),i)}function T(...r){if(0===r.length)return{};if(1===r.length)return r[0];let t={},e={};for(let o of r)for(let n in o)n.startsWith("on")&&"function"==typeof o[n]?(null!=e[n]||(e[n]=[]),e[n].push(o[n])):t[n]=o[n];if(t.disabled||t["aria-disabled"])return Object.assign(t,Object.fromEntries(Object.keys(e).map((o=>[o,void 0]))));for(let o in e)Object.assign(t,{[o](n,...l){let s=e[o];for(let u of s){if((n instanceof Event||(null==n?void 0:n.nativeEvent)instanceof Event)&&n.defaultPrevented)return;u(n,...l)}}});return t}function C(r){var t;return Object.assign((0,react__WEBPACK_IMPORTED_MODULE_0__.forwardRef)(r),{displayName:null!=(t=r.displayName)?t:r.name})}function F(r){let t=Object.assign({},r);for(let e in t)void 0===t[e]&&delete t[e];return t}function m(r,t=[]){let e=Object.assign({},r);for(let a of t)a in e&&delete e[a];return e}},"../node_modules/@headlessui/react/dist/utils/ssr.js":(__unused_webpack___webpack_module__,__webpack_exports__,__webpack_require__)=>{"use strict";__webpack_require__.d(__webpack_exports__,{s:()=>e});const e="undefined"==typeof window||"undefined"==typeof document},"../node_modules/@heroicons/react/24/solid/esm/CheckIcon.js":(__unused_webpack___webpack_module__,__webpack_exports__,__webpack_require__)=>{"use strict";__webpack_require__.d(__webpack_exports__,{Z:()=>__WEBPACK_DEFAULT_EXPORT__});var react__WEBPACK_IMPORTED_MODULE_0__=__webpack_require__("../node_modules/react/index.js");const __WEBPACK_DEFAULT_EXPORT__=react__WEBPACK_IMPORTED_MODULE_0__.forwardRef((function CheckIcon({title,titleId,...props},svgRef){return react__WEBPACK_IMPORTED_MODULE_0__.createElement("svg",Object.assign({xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 24 24",fill:"currentColor","aria-hidden":"true",ref:svgRef,"aria-labelledby":titleId},props),title?react__WEBPACK_IMPORTED_MODULE_0__.createElement("title",{id:titleId},title):null,react__WEBPACK_IMPORTED_MODULE_0__.createElement("path",{fillRule:"evenodd",d:"M19.916 4.626a.75.75 0 01.208 1.04l-9 13.5a.75.75 0 01-1.154.114l-6-6a.75.75 0 011.06-1.06l5.353 5.353 8.493-12.739a.75.75 0 011.04-.208z",clipRule:"evenodd"}))}))},"../node_modules/@heroicons/react/24/solid/esm/ChevronDownIcon.js":(__unused_webpack___webpack_module__,__webpack_exports__,__webpack_require__)=>{"use strict";__webpack_require__.d(__webpack_exports__,{Z:()=>__WEBPACK_DEFAULT_EXPORT__});var react__WEBPACK_IMPORTED_MODULE_0__=__webpack_require__("../node_modules/react/index.js");const __WEBPACK_DEFAULT_EXPORT__=react__WEBPACK_IMPORTED_MODULE_0__.forwardRef((function ChevronDownIcon({title,titleId,...props},svgRef){return react__WEBPACK_IMPORTED_MODULE_0__.createElement("svg",Object.assign({xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 24 24",fill:"currentColor","aria-hidden":"true",ref:svgRef,"aria-labelledby":titleId},props),title?react__WEBPACK_IMPORTED_MODULE_0__.createElement("title",{id:titleId},title):null,react__WEBPACK_IMPORTED_MODULE_0__.createElement("path",{fillRule:"evenodd",d:"M12.53 16.28a.75.75 0 01-1.06 0l-7.5-7.5a.75.75 0 011.06-1.06L12 14.69l6.97-6.97a.75.75 0 111.06 1.06l-7.5 7.5z",clipRule:"evenodd"}))}))}}]);