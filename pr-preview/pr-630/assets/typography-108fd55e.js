import{r as pe}from"./index-c013ead5.js";import{g as fe}from"./_commonjsHelpers-725317a4.js";var ne={exports:{}},T={};/**
 * @license React
 * react-jsx-runtime.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var ge=pe,be=Symbol.for("react.element"),ve=Symbol.for("react.fragment"),me=Object.prototype.hasOwnProperty,he=ge.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner,xe={key:!0,ref:!0,__self:!0,__source:!0};function ae(e,r,o){var t,s={},a=null,n=null;o!==void 0&&(a=""+o),r.key!==void 0&&(a=""+r.key),r.ref!==void 0&&(n=r.ref);for(t in r)me.call(r,t)&&!xe.hasOwnProperty(t)&&(s[t]=r[t]);if(e&&e.defaultProps)for(t in r=e.defaultProps,r)s[t]===void 0&&(s[t]=r[t]);return{$$typeof:be,type:e,key:a,ref:n,props:s,_owner:he.current}}T.Fragment=ve;T.jsx=ae;T.jsxs=ae;ne.exports=T;var $=ne.exports;const or=$.Fragment,ye=$.jsx,nr=$.jsxs;function we(){for(var e=0,r,o,t="";e<arguments.length;)(r=arguments[e++])&&(o=ie(r))&&(t&&(t+=" "),t+=o);return t}function ie(e){if(typeof e=="string")return e;for(var r,o="",t=0;t<e.length;t++)e[t]&&(r=ie(e[t]))&&(o&&(o+=" "),o+=r);return o}var U="-";function Ce(e){var r=Me(e),o=e.conflictingClassGroups,t=e.conflictingClassGroupModifiers,s=t===void 0?{}:t;function a(i){var d=i.split(U);return d[0]===""&&d.length!==1&&d.shift(),se(d,r)||ke(i)}function n(i,d){var c=o[i]||[];return d&&s[i]?[].concat(c,s[i]):c}return{getClassGroupId:a,getConflictingClassGroupIds:n}}function se(e,r){var n;if(e.length===0)return r.classGroupId;var o=e[0],t=r.nextPart.get(o),s=t?se(e.slice(1),t):void 0;if(s)return s;if(r.validators.length!==0){var a=e.join(U);return(n=r.validators.find(function(i){var d=i.validator;return d(a)}))==null?void 0:n.classGroupId}}var ee=/^\[(.+)\]$/;function ke(e){if(ee.test(e)){var r=ee.exec(e)[1],o=r==null?void 0:r.substring(0,r.indexOf(":"));if(o)return"arbitrary.."+o}}function Me(e){var r=e.theme,o=e.prefix,t={nextPart:new Map,validators:[]},s=Se(Object.entries(e.classGroups),o);return s.forEach(function(a){var n=a[0],i=a[1];V(i,t,n,r)}),t}function V(e,r,o,t){e.forEach(function(s){if(typeof s=="string"){var a=s===""?r:re(r,s);a.classGroupId=o;return}if(typeof s=="function"){if(Ae(s)){V(s(t),r,o,t);return}r.validators.push({validator:s,classGroupId:o});return}Object.entries(s).forEach(function(n){var i=n[0],d=n[1];V(d,re(r,i),o,t)})})}function re(e,r){var o=e;return r.split(U).forEach(function(t){o.nextPart.has(t)||o.nextPart.set(t,{nextPart:new Map,validators:[]}),o=o.nextPart.get(t)}),o}function Ae(e){return e.isThemeGetter}function Se(e,r){return r?e.map(function(o){var t=o[0],s=o[1],a=s.map(function(n){return typeof n=="string"?r+n:typeof n=="object"?Object.fromEntries(Object.entries(n).map(function(i){var d=i[0],c=i[1];return[r+d,c]})):n});return[t,a]}):e}function Ie(e){if(e<1)return{get:function(){},set:function(){}};var r=0,o=new Map,t=new Map;function s(a,n){o.set(a,n),r++,r>e&&(r=0,t=o,o=new Map)}return{get:function(n){var i=o.get(n);if(i!==void 0)return i;if((i=t.get(n))!==void 0)return s(n,i),i},set:function(n,i){o.has(n)?o.set(n,i):s(n,i)}}}var le="!";function ze(e){var r=e.separator||":",o=r.length===1,t=r[0],s=r.length;return function(n){for(var i=[],d=0,c=0,g,f=0;f<n.length;f++){var b=n[f];if(d===0){if(b===t&&(o||n.slice(f,f+s)===r)){i.push(n.slice(c,f)),c=f+s;continue}if(b==="/"){g=f;continue}}b==="["?d++:b==="]"&&d--}var h=i.length===0?n:n.substring(c),x=h.startsWith(le),v=x?h.substring(1):h,y=g&&g>c?g-c:void 0;return{modifiers:i,hasImportantModifier:x,baseClassName:v,maybePostfixModifierPosition:y}}}function Ge(e){if(e.length<=1)return e;var r=[],o=[];return e.forEach(function(t){var s=t[0]==="[";s?(r.push.apply(r,o.sort().concat([t])),o=[]):o.push(t)}),r.push.apply(r,o.sort()),r}function _e(e){return{cache:Ie(e.cacheSize),splitModifiers:ze(e),...Ce(e)}}var Ee=/\s+/;function Pe(e,r){var o=r.splitModifiers,t=r.getClassGroupId,s=r.getConflictingClassGroupIds,a=new Set;return e.trim().split(Ee).map(function(n){var i=o(n),d=i.modifiers,c=i.hasImportantModifier,g=i.baseClassName,f=i.maybePostfixModifierPosition,b=t(f?g.substring(0,f):g),h=!!f;if(!b){if(!f)return{isTailwindClass:!1,originalClassName:n};if(b=t(g),!b)return{isTailwindClass:!1,originalClassName:n};h=!1}var x=Ge(d).join(":"),v=c?x+le:x;return{isTailwindClass:!0,modifierId:v,classGroupId:b,originalClassName:n,hasPostfixModifier:h}}).reverse().filter(function(n){if(!n.isTailwindClass)return!0;var i=n.modifierId,d=n.classGroupId,c=n.hasPostfixModifier,g=i+d;return a.has(g)?!1:(a.add(g),s(d,c).forEach(function(f){return a.add(i+f)}),!0)}).reverse().map(function(n){return n.originalClassName}).join(" ")}function Re(){for(var e=arguments.length,r=new Array(e),o=0;o<e;o++)r[o]=arguments[o];var t,s,a,n=i;function i(c){var g=r[0],f=r.slice(1),b=f.reduce(function(h,x){return x(h)},g());return t=_e(b),s=t.cache.get,a=t.cache.set,n=d,d(c)}function d(c){var g=s(c);if(g)return g;var f=Pe(c,t);return a(c,f),f}return function(){return n(we.apply(null,arguments))}}function u(e){var r=function(t){return t[e]||[]};return r.isThemeGetter=!0,r}var de=/^\[(?:([a-z-]+):)?(.+)\]$/i,je=/^\d+\/\d+$/,Te=new Set(["px","full","screen"]),Oe=/^(\d+(\.\d+)?)?(xs|sm|md|lg|xl)$/,Ne=/\d+(%|px|r?em|[sdl]?v([hwib]|min|max)|pt|pc|in|cm|mm|cap|ch|ex|r?lh|cq(w|h|i|b|min|max))|\b(calc|min|max|clamp)\(.+\)|^0$/,Le=/^-?((\d+)?\.?(\d+)[a-z]+|0)_-?((\d+)?\.?(\d+)[a-z]+|0)/;function w(e){return A(e)||Te.has(e)||je.test(e)||q(e)}function q(e){return S(e,"length",Ue)}function We(e){return S(e,"size",ue)}function Fe(e){return S(e,"position",ue)}function Ve(e){return S(e,"url",Be)}function j(e){return S(e,"number",A)}function A(e){return!Number.isNaN(Number(e))}function qe(e){return e.endsWith("%")&&A(e.slice(0,-1))}function G(e){return te(e)||S(e,"number",te)}function l(e){return de.test(e)}function _(){return!0}function M(e){return Oe.test(e)}function $e(e){return S(e,"",He)}function S(e,r,o){var t=de.exec(e);return t?t[1]?t[1]===r:o(t[2]):!1}function Ue(e){return Ne.test(e)}function ue(){return!1}function Be(e){return e.startsWith("url(")}function te(e){return Number.isInteger(Number(e))}function He(e){return Le.test(e)}function Ze(){var e=u("colors"),r=u("spacing"),o=u("blur"),t=u("brightness"),s=u("borderColor"),a=u("borderRadius"),n=u("borderSpacing"),i=u("borderWidth"),d=u("contrast"),c=u("grayscale"),g=u("hueRotate"),f=u("invert"),b=u("gap"),h=u("gradientColorStops"),x=u("gradientColorStopPositions"),v=u("inset"),y=u("margin"),k=u("opacity"),C=u("padding"),B=u("saturate"),O=u("scale"),H=u("sepia"),Z=u("skew"),J=u("space"),X=u("translate"),N=function(){return["auto","contain","none"]},L=function(){return["auto","hidden","clip","visible","scroll"]},W=function(){return["auto",l,r]},p=function(){return[l,r]},Y=function(){return["",w]},E=function(){return["auto",A,l]},K=function(){return["bottom","center","left","left-bottom","left-top","right","right-bottom","right-top","top"]},P=function(){return["solid","dashed","dotted","double","none"]},Q=function(){return["normal","multiply","screen","overlay","darken","lighten","color-dodge","color-burn","hard-light","soft-light","difference","exclusion","hue","saturation","color","luminosity","plus-lighter"]},F=function(){return["start","end","center","between","around","evenly","stretch"]},I=function(){return["","0",l]},D=function(){return["auto","avoid","all","avoid-page","page","left","right","column"]},z=function(){return[A,j]},R=function(){return[A,l]};return{cacheSize:500,theme:{colors:[_],spacing:[w],blur:["none","",M,l],brightness:z(),borderColor:[e],borderRadius:["none","","full",M,l],borderSpacing:p(),borderWidth:Y(),contrast:z(),grayscale:I(),hueRotate:R(),invert:I(),gap:p(),gradientColorStops:[e],gradientColorStopPositions:[qe,q],inset:W(),margin:W(),opacity:z(),padding:p(),saturate:z(),scale:z(),sepia:I(),skew:R(),space:p(),translate:p()},classGroups:{aspect:[{aspect:["auto","square","video",l]}],container:["container"],columns:[{columns:[M]}],"break-after":[{"break-after":D()}],"break-before":[{"break-before":D()}],"break-inside":[{"break-inside":["auto","avoid","avoid-page","avoid-column"]}],"box-decoration":[{"box-decoration":["slice","clone"]}],box:[{box:["border","content"]}],display:["block","inline-block","inline","flex","inline-flex","table","inline-table","table-caption","table-cell","table-column","table-column-group","table-footer-group","table-header-group","table-row-group","table-row","flow-root","grid","inline-grid","contents","list-item","hidden"],float:[{float:["right","left","none"]}],clear:[{clear:["left","right","both","none"]}],isolation:["isolate","isolation-auto"],"object-fit":[{object:["contain","cover","fill","none","scale-down"]}],"object-position":[{object:[].concat(K(),[l])}],overflow:[{overflow:L()}],"overflow-x":[{"overflow-x":L()}],"overflow-y":[{"overflow-y":L()}],overscroll:[{overscroll:N()}],"overscroll-x":[{"overscroll-x":N()}],"overscroll-y":[{"overscroll-y":N()}],position:["static","fixed","absolute","relative","sticky"],inset:[{inset:[v]}],"inset-x":[{"inset-x":[v]}],"inset-y":[{"inset-y":[v]}],start:[{start:[v]}],end:[{end:[v]}],top:[{top:[v]}],right:[{right:[v]}],bottom:[{bottom:[v]}],left:[{left:[v]}],visibility:["visible","invisible","collapse"],z:[{z:["auto",G]}],basis:[{basis:W()}],"flex-direction":[{flex:["row","row-reverse","col","col-reverse"]}],"flex-wrap":[{flex:["wrap","wrap-reverse","nowrap"]}],flex:[{flex:["1","auto","initial","none",l]}],grow:[{grow:I()}],shrink:[{shrink:I()}],order:[{order:["first","last","none",G]}],"grid-cols":[{"grid-cols":[_]}],"col-start-end":[{col:["auto",{span:["full",G]},l]}],"col-start":[{"col-start":E()}],"col-end":[{"col-end":E()}],"grid-rows":[{"grid-rows":[_]}],"row-start-end":[{row:["auto",{span:[G]},l]}],"row-start":[{"row-start":E()}],"row-end":[{"row-end":E()}],"grid-flow":[{"grid-flow":["row","col","dense","row-dense","col-dense"]}],"auto-cols":[{"auto-cols":["auto","min","max","fr",l]}],"auto-rows":[{"auto-rows":["auto","min","max","fr",l]}],gap:[{gap:[b]}],"gap-x":[{"gap-x":[b]}],"gap-y":[{"gap-y":[b]}],"justify-content":[{justify:["normal"].concat(F())}],"justify-items":[{"justify-items":["start","end","center","stretch"]}],"justify-self":[{"justify-self":["auto","start","end","center","stretch"]}],"align-content":[{content:["normal"].concat(F(),["baseline"])}],"align-items":[{items:["start","end","center","baseline","stretch"]}],"align-self":[{self:["auto","start","end","center","stretch","baseline"]}],"place-content":[{"place-content":[].concat(F(),["baseline"])}],"place-items":[{"place-items":["start","end","center","baseline","stretch"]}],"place-self":[{"place-self":["auto","start","end","center","stretch"]}],p:[{p:[C]}],px:[{px:[C]}],py:[{py:[C]}],ps:[{ps:[C]}],pe:[{pe:[C]}],pt:[{pt:[C]}],pr:[{pr:[C]}],pb:[{pb:[C]}],pl:[{pl:[C]}],m:[{m:[y]}],mx:[{mx:[y]}],my:[{my:[y]}],ms:[{ms:[y]}],me:[{me:[y]}],mt:[{mt:[y]}],mr:[{mr:[y]}],mb:[{mb:[y]}],ml:[{ml:[y]}],"space-x":[{"space-x":[J]}],"space-x-reverse":["space-x-reverse"],"space-y":[{"space-y":[J]}],"space-y-reverse":["space-y-reverse"],w:[{w:["auto","min","max","fit",l,r]}],"min-w":[{"min-w":["min","max","fit",l,w]}],"max-w":[{"max-w":["0","none","full","min","max","fit","prose",{screen:[M]},M,l]}],h:[{h:[l,r,"auto","min","max","fit"]}],"min-h":[{"min-h":["min","max","fit",l,w]}],"max-h":[{"max-h":[l,r,"min","max","fit"]}],"font-size":[{text:["base",M,q]}],"font-smoothing":["antialiased","subpixel-antialiased"],"font-style":["italic","not-italic"],"font-weight":[{font:["thin","extralight","light","normal","medium","semibold","bold","extrabold","black",j]}],"font-family":[{font:[_]}],"fvn-normal":["normal-nums"],"fvn-ordinal":["ordinal"],"fvn-slashed-zero":["slashed-zero"],"fvn-figure":["lining-nums","oldstyle-nums"],"fvn-spacing":["proportional-nums","tabular-nums"],"fvn-fraction":["diagonal-fractions","stacked-fractons"],tracking:[{tracking:["tighter","tight","normal","wide","wider","widest",l]}],"line-clamp":[{"line-clamp":["none",A,j]}],leading:[{leading:["none","tight","snug","normal","relaxed","loose",l,w]}],"list-image":[{"list-image":["none",l]}],"list-style-type":[{list:["none","disc","decimal",l]}],"list-style-position":[{list:["inside","outside"]}],"placeholder-color":[{placeholder:[e]}],"placeholder-opacity":[{"placeholder-opacity":[k]}],"text-alignment":[{text:["left","center","right","justify","start","end"]}],"text-color":[{text:[e]}],"text-opacity":[{"text-opacity":[k]}],"text-decoration":["underline","overline","line-through","no-underline"],"text-decoration-style":[{decoration:[].concat(P(),["wavy"])}],"text-decoration-thickness":[{decoration:["auto","from-font",w]}],"underline-offset":[{"underline-offset":["auto",l,w]}],"text-decoration-color":[{decoration:[e]}],"text-transform":["uppercase","lowercase","capitalize","normal-case"],"text-overflow":["truncate","text-ellipsis","text-clip"],indent:[{indent:p()}],"vertical-align":[{align:["baseline","top","middle","bottom","text-top","text-bottom","sub","super",l]}],whitespace:[{whitespace:["normal","nowrap","pre","pre-line","pre-wrap","break-spaces"]}],break:[{break:["normal","words","all","keep"]}],hyphens:[{hyphens:["none","manual","auto"]}],content:[{content:["none",l]}],"bg-attachment":[{bg:["fixed","local","scroll"]}],"bg-clip":[{"bg-clip":["border","padding","content","text"]}],"bg-opacity":[{"bg-opacity":[k]}],"bg-origin":[{"bg-origin":["border","padding","content"]}],"bg-position":[{bg:[].concat(K(),[Fe])}],"bg-repeat":[{bg:["no-repeat",{repeat:["","x","y","round","space"]}]}],"bg-size":[{bg:["auto","cover","contain",We]}],"bg-image":[{bg:["none",{"gradient-to":["t","tr","r","br","b","bl","l","tl"]},Ve]}],"bg-color":[{bg:[e]}],"gradient-from-pos":[{from:[x]}],"gradient-via-pos":[{via:[x]}],"gradient-to-pos":[{to:[x]}],"gradient-from":[{from:[h]}],"gradient-via":[{via:[h]}],"gradient-to":[{to:[h]}],rounded:[{rounded:[a]}],"rounded-s":[{"rounded-s":[a]}],"rounded-e":[{"rounded-e":[a]}],"rounded-t":[{"rounded-t":[a]}],"rounded-r":[{"rounded-r":[a]}],"rounded-b":[{"rounded-b":[a]}],"rounded-l":[{"rounded-l":[a]}],"rounded-ss":[{"rounded-ss":[a]}],"rounded-se":[{"rounded-se":[a]}],"rounded-ee":[{"rounded-ee":[a]}],"rounded-es":[{"rounded-es":[a]}],"rounded-tl":[{"rounded-tl":[a]}],"rounded-tr":[{"rounded-tr":[a]}],"rounded-br":[{"rounded-br":[a]}],"rounded-bl":[{"rounded-bl":[a]}],"border-w":[{border:[i]}],"border-w-x":[{"border-x":[i]}],"border-w-y":[{"border-y":[i]}],"border-w-s":[{"border-s":[i]}],"border-w-e":[{"border-e":[i]}],"border-w-t":[{"border-t":[i]}],"border-w-r":[{"border-r":[i]}],"border-w-b":[{"border-b":[i]}],"border-w-l":[{"border-l":[i]}],"border-opacity":[{"border-opacity":[k]}],"border-style":[{border:[].concat(P(),["hidden"])}],"divide-x":[{"divide-x":[i]}],"divide-x-reverse":["divide-x-reverse"],"divide-y":[{"divide-y":[i]}],"divide-y-reverse":["divide-y-reverse"],"divide-opacity":[{"divide-opacity":[k]}],"divide-style":[{divide:P()}],"border-color":[{border:[s]}],"border-color-x":[{"border-x":[s]}],"border-color-y":[{"border-y":[s]}],"border-color-t":[{"border-t":[s]}],"border-color-r":[{"border-r":[s]}],"border-color-b":[{"border-b":[s]}],"border-color-l":[{"border-l":[s]}],"divide-color":[{divide:[s]}],"outline-style":[{outline:[""].concat(P())}],"outline-offset":[{"outline-offset":[l,w]}],"outline-w":[{outline:[w]}],"outline-color":[{outline:[e]}],"ring-w":[{ring:Y()}],"ring-w-inset":["ring-inset"],"ring-color":[{ring:[e]}],"ring-opacity":[{"ring-opacity":[k]}],"ring-offset-w":[{"ring-offset":[w]}],"ring-offset-color":[{"ring-offset":[e]}],shadow:[{shadow:["","inner","none",M,$e]}],"shadow-color":[{shadow:[_]}],opacity:[{opacity:[k]}],"mix-blend":[{"mix-blend":Q()}],"bg-blend":[{"bg-blend":Q()}],filter:[{filter:["","none"]}],blur:[{blur:[o]}],brightness:[{brightness:[t]}],contrast:[{contrast:[d]}],"drop-shadow":[{"drop-shadow":["","none",M,l]}],grayscale:[{grayscale:[c]}],"hue-rotate":[{"hue-rotate":[g]}],invert:[{invert:[f]}],saturate:[{saturate:[B]}],sepia:[{sepia:[H]}],"backdrop-filter":[{"backdrop-filter":["","none"]}],"backdrop-blur":[{"backdrop-blur":[o]}],"backdrop-brightness":[{"backdrop-brightness":[t]}],"backdrop-contrast":[{"backdrop-contrast":[d]}],"backdrop-grayscale":[{"backdrop-grayscale":[c]}],"backdrop-hue-rotate":[{"backdrop-hue-rotate":[g]}],"backdrop-invert":[{"backdrop-invert":[f]}],"backdrop-opacity":[{"backdrop-opacity":[k]}],"backdrop-saturate":[{"backdrop-saturate":[B]}],"backdrop-sepia":[{"backdrop-sepia":[H]}],"border-collapse":[{border:["collapse","separate"]}],"border-spacing":[{"border-spacing":[n]}],"border-spacing-x":[{"border-spacing-x":[n]}],"border-spacing-y":[{"border-spacing-y":[n]}],"table-layout":[{table:["auto","fixed"]}],caption:[{caption:["top","bottom"]}],transition:[{transition:["none","all","","colors","opacity","shadow","transform",l]}],duration:[{duration:R()}],ease:[{ease:["linear","in","out","in-out",l]}],delay:[{delay:R()}],animate:[{animate:["none","spin","ping","pulse","bounce",l]}],transform:[{transform:["","gpu","none"]}],scale:[{scale:[O]}],"scale-x":[{"scale-x":[O]}],"scale-y":[{"scale-y":[O]}],rotate:[{rotate:[G,l]}],"translate-x":[{"translate-x":[X]}],"translate-y":[{"translate-y":[X]}],"skew-x":[{"skew-x":[Z]}],"skew-y":[{"skew-y":[Z]}],"transform-origin":[{origin:["center","top","top-right","right","bottom-right","bottom","bottom-left","left","top-left",l]}],accent:[{accent:["auto",e]}],appearance:["appearance-none"],cursor:[{cursor:["auto","default","pointer","wait","text","move","help","not-allowed","none","context-menu","progress","cell","crosshair","vertical-text","alias","copy","no-drop","grab","grabbing","all-scroll","col-resize","row-resize","n-resize","e-resize","s-resize","w-resize","ne-resize","nw-resize","se-resize","sw-resize","ew-resize","ns-resize","nesw-resize","nwse-resize","zoom-in","zoom-out",l]}],"caret-color":[{caret:[e]}],"pointer-events":[{"pointer-events":["none","auto"]}],resize:[{resize:["none","y","x",""]}],"scroll-behavior":[{scroll:["auto","smooth"]}],"scroll-m":[{"scroll-m":p()}],"scroll-mx":[{"scroll-mx":p()}],"scroll-my":[{"scroll-my":p()}],"scroll-ms":[{"scroll-ms":p()}],"scroll-me":[{"scroll-me":p()}],"scroll-mt":[{"scroll-mt":p()}],"scroll-mr":[{"scroll-mr":p()}],"scroll-mb":[{"scroll-mb":p()}],"scroll-ml":[{"scroll-ml":p()}],"scroll-p":[{"scroll-p":p()}],"scroll-px":[{"scroll-px":p()}],"scroll-py":[{"scroll-py":p()}],"scroll-ps":[{"scroll-ps":p()}],"scroll-pe":[{"scroll-pe":p()}],"scroll-pt":[{"scroll-pt":p()}],"scroll-pr":[{"scroll-pr":p()}],"scroll-pb":[{"scroll-pb":p()}],"scroll-pl":[{"scroll-pl":p()}],"snap-align":[{snap:["start","end","center","align-none"]}],"snap-stop":[{snap:["normal","always"]}],"snap-type":[{snap:["none","x","y","both"]}],"snap-strictness":[{snap:["mandatory","proximity"]}],touch:[{touch:["auto","none","pinch-zoom","manipulation",{pan:["x","left","right","y","up","down"]}]}],select:[{select:["none","text","all","auto"]}],"will-change":[{"will-change":["auto","scroll","contents","transform",l]}],fill:[{fill:[e,"none"]}],"stroke-w":[{stroke:[w,j]}],stroke:[{stroke:[e,"none"]}],sr:["sr-only","not-sr-only"]},conflictingClassGroups:{overflow:["overflow-x","overflow-y"],overscroll:["overscroll-x","overscroll-y"],inset:["inset-x","inset-y","start","end","top","right","bottom","left"],"inset-x":["right","left"],"inset-y":["top","bottom"],flex:["basis","grow","shrink"],gap:["gap-x","gap-y"],p:["px","py","ps","pe","pt","pr","pb","pl"],px:["pr","pl"],py:["pt","pb"],m:["mx","my","ms","me","mt","mr","mb","ml"],mx:["mr","ml"],my:["mt","mb"],"font-size":["leading"],"fvn-normal":["fvn-ordinal","fvn-slashed-zero","fvn-figure","fvn-spacing","fvn-fraction"],"fvn-ordinal":["fvn-normal"],"fvn-slashed-zero":["fvn-normal"],"fvn-figure":["fvn-normal"],"fvn-spacing":["fvn-normal"],"fvn-fraction":["fvn-normal"],rounded:["rounded-s","rounded-e","rounded-t","rounded-r","rounded-b","rounded-l","rounded-ss","rounded-se","rounded-ee","rounded-es","rounded-tl","rounded-tr","rounded-br","rounded-bl"],"rounded-s":["rounded-ss","rounded-es"],"rounded-e":["rounded-se","rounded-ee"],"rounded-t":["rounded-tl","rounded-tr"],"rounded-r":["rounded-tr","rounded-br"],"rounded-b":["rounded-br","rounded-bl"],"rounded-l":["rounded-tl","rounded-bl"],"border-spacing":["border-spacing-x","border-spacing-y"],"border-w":["border-w-s","border-w-e","border-w-t","border-w-r","border-w-b","border-w-l"],"border-w-x":["border-w-r","border-w-l"],"border-w-y":["border-w-t","border-w-b"],"border-color":["border-color-t","border-color-r","border-color-b","border-color-l"],"border-color-x":["border-color-r","border-color-l"],"border-color-y":["border-color-t","border-color-b"],"scroll-m":["scroll-mx","scroll-my","scroll-ms","scroll-me","scroll-mt","scroll-mr","scroll-mb","scroll-ml"],"scroll-mx":["scroll-mr","scroll-ml"],"scroll-my":["scroll-mt","scroll-mb"],"scroll-p":["scroll-px","scroll-py","scroll-ps","scroll-pe","scroll-pt","scroll-pr","scroll-pb","scroll-pl"],"scroll-px":["scroll-pr","scroll-pl"],"scroll-py":["scroll-pt","scroll-pb"]},conflictingClassGroupModifiers:{"font-size":["leading"]}}}var Je=Re(Ze),ce={exports:{}};/*!
	Copyright (c) 2018 Jed Watson.
	Licensed under the MIT License (MIT), see
	http://jedwatson.github.io/classnames
*/(function(e){(function(){var r={}.hasOwnProperty;function o(){for(var t=[],s=0;s<arguments.length;s++){var a=arguments[s];if(a){var n=typeof a;if(n==="string"||n==="number")t.push(a);else if(Array.isArray(a)){if(a.length){var i=o.apply(null,a);i&&t.push(i)}}else if(n==="object"){if(a.toString!==Object.prototype.toString&&!a.toString.toString().includes("[native code]")){t.push(a.toString());continue}for(var d in a)r.call(a,d)&&a[d]&&t.push(d)}}}return t.join(" ")}e.exports?(o.default=o,e.exports=o):window.classNames=o})()})(ce);var Xe=ce.exports;const Ye=fe(Xe),Ke={"5xl":"text-5xl","4xl":"text-4xl","3xl":"text-3xl","2xl":"text-2xl",xl:"text-xl",lg:"text-lg",md:"text-base",sm:"text-sm",xs:"text-xs"},Qe={normal:"font-normal",medium:"font-medium",semibold:"font-semibold",bold:"font-bold"},De={background:"text-background",foreground:"text-foreground","si-yellow":"text-si-yellow",primary:"text-primary","primary-foreground":"text-primary-foreground",secondary:"text-secondary","secondary-foreground":"text-secondary-foreground",accent:"text-accent","accent-foreground":"text-accent-foreground",destructive:"text-destructive","destructive-foreground":"text-destructive-foreground",muted:"text-muted","muted-foreground":"text-muted-foreground",card:"text-card","card-foreground":"text-card-foreground",popover:"text-popover","popover-foreground":"text-popover-foreground"},er={none:"leading-none",tight:"leading-tight",snug:"leading-snug",normal:"leading-normal",relaxed:"leading-relaxed",loose:"leading-loose"};function oe({as:e,size:r="md",weight:o="normal",color:t=void 0,lineHeight:s="normal",className:a,children:n,...i}){return ye(e||"p",{className:Je(Ye(Ke[r],Qe[o],De[t]||"",er[s],a)),...i,children:n})}try{oe.displayName="Typography",oe.__docgenInfo={description:"",displayName:"Typography",props:{as:{defaultValue:null,description:"",name:"as",required:!1,type:{name:"enum",value:[{value:'"div"'},{value:'"h1"'},{value:'"h2"'},{value:'"h3"'},{value:'"h4"'},{value:'"h5"'},{value:'"h6"'},{value:'"p"'},{value:'"span"'}]}},size:{defaultValue:{value:"md"},description:"",name:"size",required:!1,type:{name:"enum",value:[{value:'"xs"'},{value:'"sm"'},{value:'"md"'},{value:'"lg"'},{value:'"xl"'},{value:'"2xl"'},{value:'"3xl"'},{value:'"4xl"'},{value:'"5xl"'}]}},weight:{defaultValue:{value:"normal"},description:"",name:"weight",required:!1,type:{name:"enum",value:[{value:'"normal"'},{value:'"medium"'},{value:'"semibold"'},{value:'"bold"'}]}},color:{defaultValue:{value:"undefined"},description:"",name:"color",required:!1,type:{name:"enum",value:[{value:'"foreground"'},{value:'"background"'},{value:'"si-yellow"'},{value:'"primary"'},{value:'"primary-foreground"'},{value:'"secondary"'},{value:'"secondary-foreground"'},{value:'"destructive"'},{value:'"destructive-foreground"'},{value:'"muted"'},{value:'"muted-foreground"'},{value:'"accent"'},{value:'"accent-foreground"'},{value:'"popover"'},{value:'"popover-foreground"'},{value:'"card"'},{value:'"card-foreground"'}]}},lineHeight:{defaultValue:{value:"normal"},description:"",name:"lineHeight",required:!1,type:{name:"enum",value:[{value:'"none"'},{value:'"normal"'},{value:'"tight"'},{value:'"snug"'},{value:'"relaxed"'},{value:'"loose"'}]}}}}}catch{}export{or as F,oe as T,nr as a,ye as j,Je as t};
//# sourceMappingURL=typography-108fd55e.js.map
