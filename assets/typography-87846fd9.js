import{j as le,c as se}from"./index-cabaec6b.js";function ce(){for(var e=0,r,t,o="";e<arguments.length;)(r=arguments[e++])&&(t=te(r))&&(o&&(o+=" "),o+=t);return o}function te(e){if(typeof e=="string")return e;for(var r,t="",o=0;o<e.length;o++)e[o]&&(r=te(e[o]))&&(t&&(t+=" "),t+=r);return t}var F="-";function de(e){var r=pe(e),t=e.conflictingClassGroups,o=e.conflictingClassGroupModifiers,i=o===void 0?{}:o;function l(a){var c=a.split(F);return c[0]===""&&c.length!==1&&c.shift(),oe(c,r)||ue(a)}function n(a,c){var u=t[a]||[];return c&&i[a]?[].concat(u,i[a]):u}return{getClassGroupId:l,getConflictingClassGroupIds:n}}function oe(e,r){var n;if(e.length===0)return r.classGroupId;var t=e[0],o=r.nextPart.get(t),i=o?oe(e.slice(1),o):void 0;if(i)return i;if(r.validators.length!==0){var l=e.join(F);return(n=r.validators.find(function(a){var c=a.validator;return c(l)}))==null?void 0:n.classGroupId}}var Y=/^\[(.+)\]$/;function ue(e){if(Y.test(e)){var r=Y.exec(e)[1],t=r==null?void 0:r.substring(0,r.indexOf(":"));if(t)return"arbitrary.."+t}}function pe(e){var r=e.theme,t=e.prefix,o={nextPart:new Map,validators:[]},i=ge(Object.entries(e.classGroups),t);return i.forEach(function(l){var n=l[0],a=l[1];V(a,o,n,r)}),o}function V(e,r,t,o){e.forEach(function(i){if(typeof i=="string"){var l=i===""?r:D(r,i);l.classGroupId=t;return}if(typeof i=="function"){if(fe(i)){V(i(o),r,t,o);return}r.validators.push({validator:i,classGroupId:t});return}Object.entries(i).forEach(function(n){var a=n[0],c=n[1];V(c,D(r,a),t,o)})})}function D(e,r){var t=e;return r.split(F).forEach(function(o){t.nextPart.has(o)||t.nextPart.set(o,{nextPart:new Map,validators:[]}),t=t.nextPart.get(o)}),t}function fe(e){return e.isThemeGetter}function ge(e,r){return r?e.map(function(t){var o=t[0],i=t[1],l=i.map(function(n){return typeof n=="string"?r+n:typeof n=="object"?Object.fromEntries(Object.entries(n).map(function(a){var c=a[0],u=a[1];return[r+c,u]})):n});return[o,l]}):e}function be(e){if(e<1)return{get:function(){},set:function(){}};var r=0,t=new Map,o=new Map;function i(l,n){t.set(l,n),r++,r>e&&(r=0,o=t,t=new Map)}return{get:function(n){var a=t.get(n);if(a!==void 0)return a;if((a=o.get(n))!==void 0)return i(n,a),a},set:function(n,a){t.has(n)?t.set(n,a):i(n,a)}}}var ne="!";function me(e){var r=e.separator||":",t=r.length===1,o=r[0],i=r.length;return function(n){for(var a=[],c=0,u=0,g,f=0;f<n.length;f++){var b=n[f];if(c===0){if(b===o&&(t||n.slice(f,f+i)===r)){a.push(n.slice(u,f)),u=f+i;continue}if(b==="/"){g=f;continue}}b==="["?c++:b==="]"&&c--}var x=a.length===0?n:n.substring(u),h=x.startsWith(ne),m=h?x.substring(1):x,y=g&&g>u?g-u:void 0;return{modifiers:a,hasImportantModifier:h,baseClassName:m,maybePostfixModifierPosition:y}}}function ve(e){if(e.length<=1)return e;var r=[],t=[];return e.forEach(function(o){var i=o[0]==="[";i?(r.push.apply(r,t.sort().concat([o])),t=[]):t.push(o)}),r.push.apply(r,t.sort()),r}function xe(e){return{cache:be(e.cacheSize),splitModifiers:me(e),...de(e)}}var he=/\s+/;function ye(e,r){var t=r.splitModifiers,o=r.getClassGroupId,i=r.getConflictingClassGroupIds,l=new Set;return e.trim().split(he).map(function(n){var a=t(n),c=a.modifiers,u=a.hasImportantModifier,g=a.baseClassName,f=a.maybePostfixModifierPosition,b=o(f?g.substring(0,f):g),x=!!f;if(!b){if(!f)return{isTailwindClass:!1,originalClassName:n};if(b=o(g),!b)return{isTailwindClass:!1,originalClassName:n};x=!1}var h=ve(c).join(":"),m=u?h+ne:h;return{isTailwindClass:!0,modifierId:m,classGroupId:b,originalClassName:n,hasPostfixModifier:x}}).reverse().filter(function(n){if(!n.isTailwindClass)return!0;var a=n.modifierId,c=n.classGroupId,u=n.hasPostfixModifier,g=a+c;return l.has(g)?!1:(l.add(g),i(c,u).forEach(function(f){return l.add(a+f)}),!0)}).reverse().map(function(n){return n.originalClassName}).join(" ")}function we(){for(var e=arguments.length,r=new Array(e),t=0;t<e;t++)r[t]=arguments[t];var o,i,l,n=a;function a(u){var g=r[0],f=r.slice(1),b=f.reduce(function(x,h){return h(x)},g());return o=xe(b),i=o.cache.get,l=o.cache.set,n=c,c(u)}function c(u){var g=i(u);if(g)return g;var f=ye(u,o);return l(u,f),f}return function(){return n(ce.apply(null,arguments))}}function d(e){var r=function(o){return o[e]||[]};return r.isThemeGetter=!0,r}var ae=/^\[(?:([a-z-]+):)?(.+)\]$/i,Ce=/^\d+\/\d+$/,ke=new Set(["px","full","screen"]),Me=/^(\d+(\.\d+)?)?(xs|sm|md|lg|xl)$/,Ae=/\d+(%|px|r?em|[sdl]?v([hwib]|min|max)|pt|pc|in|cm|mm|cap|ch|ex|r?lh|cq(w|h|i|b|min|max))|\b(calc|min|max|clamp)\(.+\)|^0$/,ze=/^-?((\d+)?\.?(\d+)[a-z]+|0)_-?((\d+)?\.?(\d+)[a-z]+|0)/;function w(e){return A(e)||ke.has(e)||Ce.test(e)||q(e)}function q(e){return z(e,"length",Re)}function Ge(e){return z(e,"size",ie)}function Ie(e){return z(e,"position",ie)}function Se(e){return z(e,"url",Ee)}function N(e){return z(e,"number",A)}function A(e){return!Number.isNaN(Number(e))}function Te(e){return e.endsWith("%")&&A(e.slice(0,-1))}function S(e){return ee(e)||z(e,"number",ee)}function s(e){return ae.test(e)}function T(){return!0}function M(e){return Me.test(e)}function Pe(e){return z(e,"",Ne)}function z(e,r,t){var o=ae.exec(e);return o?o[1]?o[1]===r:t(o[2]):!1}function Re(e){return Ae.test(e)}function ie(){return!1}function Ee(e){return e.startsWith("url(")}function ee(e){return Number.isInteger(Number(e))}function Ne(e){return ze.test(e)}function je(){var e=d("colors"),r=d("spacing"),t=d("blur"),o=d("brightness"),i=d("borderColor"),l=d("borderRadius"),n=d("borderSpacing"),a=d("borderWidth"),c=d("contrast"),u=d("grayscale"),g=d("hueRotate"),f=d("invert"),b=d("gap"),x=d("gradientColorStops"),h=d("gradientColorStopPositions"),m=d("inset"),y=d("margin"),k=d("opacity"),C=d("padding"),$=d("saturate"),j=d("scale"),B=d("sepia"),H=d("skew"),U=d("space"),Z=d("translate"),W=function(){return["auto","contain","none"]},_=function(){return["auto","hidden","clip","visible","scroll"]},L=function(){return["auto",s,r]},p=function(){return[s,r]},J=function(){return["",w]},P=function(){return["auto",A,s]},X=function(){return["bottom","center","left","left-bottom","left-top","right","right-bottom","right-top","top"]},R=function(){return["solid","dashed","dotted","double","none"]},K=function(){return["normal","multiply","screen","overlay","darken","lighten","color-dodge","color-burn","hard-light","soft-light","difference","exclusion","hue","saturation","color","luminosity","plus-lighter"]},O=function(){return["start","end","center","between","around","evenly","stretch"]},G=function(){return["","0",s]},Q=function(){return["auto","avoid","all","avoid-page","page","left","right","column"]},I=function(){return[A,N]},E=function(){return[A,s]};return{cacheSize:500,theme:{colors:[T],spacing:[w],blur:["none","",M,s],brightness:I(),borderColor:[e],borderRadius:["none","","full",M,s],borderSpacing:p(),borderWidth:J(),contrast:I(),grayscale:G(),hueRotate:E(),invert:G(),gap:p(),gradientColorStops:[e],gradientColorStopPositions:[Te,q],inset:L(),margin:L(),opacity:I(),padding:p(),saturate:I(),scale:I(),sepia:G(),skew:E(),space:p(),translate:p()},classGroups:{aspect:[{aspect:["auto","square","video",s]}],container:["container"],columns:[{columns:[M]}],"break-after":[{"break-after":Q()}],"break-before":[{"break-before":Q()}],"break-inside":[{"break-inside":["auto","avoid","avoid-page","avoid-column"]}],"box-decoration":[{"box-decoration":["slice","clone"]}],box:[{box:["border","content"]}],display:["block","inline-block","inline","flex","inline-flex","table","inline-table","table-caption","table-cell","table-column","table-column-group","table-footer-group","table-header-group","table-row-group","table-row","flow-root","grid","inline-grid","contents","list-item","hidden"],float:[{float:["right","left","none"]}],clear:[{clear:["left","right","both","none"]}],isolation:["isolate","isolation-auto"],"object-fit":[{object:["contain","cover","fill","none","scale-down"]}],"object-position":[{object:[].concat(X(),[s])}],overflow:[{overflow:_()}],"overflow-x":[{"overflow-x":_()}],"overflow-y":[{"overflow-y":_()}],overscroll:[{overscroll:W()}],"overscroll-x":[{"overscroll-x":W()}],"overscroll-y":[{"overscroll-y":W()}],position:["static","fixed","absolute","relative","sticky"],inset:[{inset:[m]}],"inset-x":[{"inset-x":[m]}],"inset-y":[{"inset-y":[m]}],start:[{start:[m]}],end:[{end:[m]}],top:[{top:[m]}],right:[{right:[m]}],bottom:[{bottom:[m]}],left:[{left:[m]}],visibility:["visible","invisible","collapse"],z:[{z:["auto",S]}],basis:[{basis:L()}],"flex-direction":[{flex:["row","row-reverse","col","col-reverse"]}],"flex-wrap":[{flex:["wrap","wrap-reverse","nowrap"]}],flex:[{flex:["1","auto","initial","none",s]}],grow:[{grow:G()}],shrink:[{shrink:G()}],order:[{order:["first","last","none",S]}],"grid-cols":[{"grid-cols":[T]}],"col-start-end":[{col:["auto",{span:["full",S]},s]}],"col-start":[{"col-start":P()}],"col-end":[{"col-end":P()}],"grid-rows":[{"grid-rows":[T]}],"row-start-end":[{row:["auto",{span:[S]},s]}],"row-start":[{"row-start":P()}],"row-end":[{"row-end":P()}],"grid-flow":[{"grid-flow":["row","col","dense","row-dense","col-dense"]}],"auto-cols":[{"auto-cols":["auto","min","max","fr",s]}],"auto-rows":[{"auto-rows":["auto","min","max","fr",s]}],gap:[{gap:[b]}],"gap-x":[{"gap-x":[b]}],"gap-y":[{"gap-y":[b]}],"justify-content":[{justify:["normal"].concat(O())}],"justify-items":[{"justify-items":["start","end","center","stretch"]}],"justify-self":[{"justify-self":["auto","start","end","center","stretch"]}],"align-content":[{content:["normal"].concat(O(),["baseline"])}],"align-items":[{items:["start","end","center","baseline","stretch"]}],"align-self":[{self:["auto","start","end","center","stretch","baseline"]}],"place-content":[{"place-content":[].concat(O(),["baseline"])}],"place-items":[{"place-items":["start","end","center","baseline","stretch"]}],"place-self":[{"place-self":["auto","start","end","center","stretch"]}],p:[{p:[C]}],px:[{px:[C]}],py:[{py:[C]}],ps:[{ps:[C]}],pe:[{pe:[C]}],pt:[{pt:[C]}],pr:[{pr:[C]}],pb:[{pb:[C]}],pl:[{pl:[C]}],m:[{m:[y]}],mx:[{mx:[y]}],my:[{my:[y]}],ms:[{ms:[y]}],me:[{me:[y]}],mt:[{mt:[y]}],mr:[{mr:[y]}],mb:[{mb:[y]}],ml:[{ml:[y]}],"space-x":[{"space-x":[U]}],"space-x-reverse":["space-x-reverse"],"space-y":[{"space-y":[U]}],"space-y-reverse":["space-y-reverse"],w:[{w:["auto","min","max","fit",s,r]}],"min-w":[{"min-w":["min","max","fit",s,w]}],"max-w":[{"max-w":["0","none","full","min","max","fit","prose",{screen:[M]},M,s]}],h:[{h:[s,r,"auto","min","max","fit"]}],"min-h":[{"min-h":["min","max","fit",s,w]}],"max-h":[{"max-h":[s,r,"min","max","fit"]}],"font-size":[{text:["base",M,q]}],"font-smoothing":["antialiased","subpixel-antialiased"],"font-style":["italic","not-italic"],"font-weight":[{font:["thin","extralight","light","normal","medium","semibold","bold","extrabold","black",N]}],"font-family":[{font:[T]}],"fvn-normal":["normal-nums"],"fvn-ordinal":["ordinal"],"fvn-slashed-zero":["slashed-zero"],"fvn-figure":["lining-nums","oldstyle-nums"],"fvn-spacing":["proportional-nums","tabular-nums"],"fvn-fraction":["diagonal-fractions","stacked-fractons"],tracking:[{tracking:["tighter","tight","normal","wide","wider","widest",s]}],"line-clamp":[{"line-clamp":["none",A,N]}],leading:[{leading:["none","tight","snug","normal","relaxed","loose",s,w]}],"list-image":[{"list-image":["none",s]}],"list-style-type":[{list:["none","disc","decimal",s]}],"list-style-position":[{list:["inside","outside"]}],"placeholder-color":[{placeholder:[e]}],"placeholder-opacity":[{"placeholder-opacity":[k]}],"text-alignment":[{text:["left","center","right","justify","start","end"]}],"text-color":[{text:[e]}],"text-opacity":[{"text-opacity":[k]}],"text-decoration":["underline","overline","line-through","no-underline"],"text-decoration-style":[{decoration:[].concat(R(),["wavy"])}],"text-decoration-thickness":[{decoration:["auto","from-font",w]}],"underline-offset":[{"underline-offset":["auto",s,w]}],"text-decoration-color":[{decoration:[e]}],"text-transform":["uppercase","lowercase","capitalize","normal-case"],"text-overflow":["truncate","text-ellipsis","text-clip"],indent:[{indent:p()}],"vertical-align":[{align:["baseline","top","middle","bottom","text-top","text-bottom","sub","super",s]}],whitespace:[{whitespace:["normal","nowrap","pre","pre-line","pre-wrap","break-spaces"]}],break:[{break:["normal","words","all","keep"]}],hyphens:[{hyphens:["none","manual","auto"]}],content:[{content:["none",s]}],"bg-attachment":[{bg:["fixed","local","scroll"]}],"bg-clip":[{"bg-clip":["border","padding","content","text"]}],"bg-opacity":[{"bg-opacity":[k]}],"bg-origin":[{"bg-origin":["border","padding","content"]}],"bg-position":[{bg:[].concat(X(),[Ie])}],"bg-repeat":[{bg:["no-repeat",{repeat:["","x","y","round","space"]}]}],"bg-size":[{bg:["auto","cover","contain",Ge]}],"bg-image":[{bg:["none",{"gradient-to":["t","tr","r","br","b","bl","l","tl"]},Se]}],"bg-color":[{bg:[e]}],"gradient-from-pos":[{from:[h]}],"gradient-via-pos":[{via:[h]}],"gradient-to-pos":[{to:[h]}],"gradient-from":[{from:[x]}],"gradient-via":[{via:[x]}],"gradient-to":[{to:[x]}],rounded:[{rounded:[l]}],"rounded-s":[{"rounded-s":[l]}],"rounded-e":[{"rounded-e":[l]}],"rounded-t":[{"rounded-t":[l]}],"rounded-r":[{"rounded-r":[l]}],"rounded-b":[{"rounded-b":[l]}],"rounded-l":[{"rounded-l":[l]}],"rounded-ss":[{"rounded-ss":[l]}],"rounded-se":[{"rounded-se":[l]}],"rounded-ee":[{"rounded-ee":[l]}],"rounded-es":[{"rounded-es":[l]}],"rounded-tl":[{"rounded-tl":[l]}],"rounded-tr":[{"rounded-tr":[l]}],"rounded-br":[{"rounded-br":[l]}],"rounded-bl":[{"rounded-bl":[l]}],"border-w":[{border:[a]}],"border-w-x":[{"border-x":[a]}],"border-w-y":[{"border-y":[a]}],"border-w-s":[{"border-s":[a]}],"border-w-e":[{"border-e":[a]}],"border-w-t":[{"border-t":[a]}],"border-w-r":[{"border-r":[a]}],"border-w-b":[{"border-b":[a]}],"border-w-l":[{"border-l":[a]}],"border-opacity":[{"border-opacity":[k]}],"border-style":[{border:[].concat(R(),["hidden"])}],"divide-x":[{"divide-x":[a]}],"divide-x-reverse":["divide-x-reverse"],"divide-y":[{"divide-y":[a]}],"divide-y-reverse":["divide-y-reverse"],"divide-opacity":[{"divide-opacity":[k]}],"divide-style":[{divide:R()}],"border-color":[{border:[i]}],"border-color-x":[{"border-x":[i]}],"border-color-y":[{"border-y":[i]}],"border-color-t":[{"border-t":[i]}],"border-color-r":[{"border-r":[i]}],"border-color-b":[{"border-b":[i]}],"border-color-l":[{"border-l":[i]}],"divide-color":[{divide:[i]}],"outline-style":[{outline:[""].concat(R())}],"outline-offset":[{"outline-offset":[s,w]}],"outline-w":[{outline:[w]}],"outline-color":[{outline:[e]}],"ring-w":[{ring:J()}],"ring-w-inset":["ring-inset"],"ring-color":[{ring:[e]}],"ring-opacity":[{"ring-opacity":[k]}],"ring-offset-w":[{"ring-offset":[w]}],"ring-offset-color":[{"ring-offset":[e]}],shadow:[{shadow:["","inner","none",M,Pe]}],"shadow-color":[{shadow:[T]}],opacity:[{opacity:[k]}],"mix-blend":[{"mix-blend":K()}],"bg-blend":[{"bg-blend":K()}],filter:[{filter:["","none"]}],blur:[{blur:[t]}],brightness:[{brightness:[o]}],contrast:[{contrast:[c]}],"drop-shadow":[{"drop-shadow":["","none",M,s]}],grayscale:[{grayscale:[u]}],"hue-rotate":[{"hue-rotate":[g]}],invert:[{invert:[f]}],saturate:[{saturate:[$]}],sepia:[{sepia:[B]}],"backdrop-filter":[{"backdrop-filter":["","none"]}],"backdrop-blur":[{"backdrop-blur":[t]}],"backdrop-brightness":[{"backdrop-brightness":[o]}],"backdrop-contrast":[{"backdrop-contrast":[c]}],"backdrop-grayscale":[{"backdrop-grayscale":[u]}],"backdrop-hue-rotate":[{"backdrop-hue-rotate":[g]}],"backdrop-invert":[{"backdrop-invert":[f]}],"backdrop-opacity":[{"backdrop-opacity":[k]}],"backdrop-saturate":[{"backdrop-saturate":[$]}],"backdrop-sepia":[{"backdrop-sepia":[B]}],"border-collapse":[{border:["collapse","separate"]}],"border-spacing":[{"border-spacing":[n]}],"border-spacing-x":[{"border-spacing-x":[n]}],"border-spacing-y":[{"border-spacing-y":[n]}],"table-layout":[{table:["auto","fixed"]}],caption:[{caption:["top","bottom"]}],transition:[{transition:["none","all","","colors","opacity","shadow","transform",s]}],duration:[{duration:E()}],ease:[{ease:["linear","in","out","in-out",s]}],delay:[{delay:E()}],animate:[{animate:["none","spin","ping","pulse","bounce",s]}],transform:[{transform:["","gpu","none"]}],scale:[{scale:[j]}],"scale-x":[{"scale-x":[j]}],"scale-y":[{"scale-y":[j]}],rotate:[{rotate:[S,s]}],"translate-x":[{"translate-x":[Z]}],"translate-y":[{"translate-y":[Z]}],"skew-x":[{"skew-x":[H]}],"skew-y":[{"skew-y":[H]}],"transform-origin":[{origin:["center","top","top-right","right","bottom-right","bottom","bottom-left","left","top-left",s]}],accent:[{accent:["auto",e]}],appearance:["appearance-none"],cursor:[{cursor:["auto","default","pointer","wait","text","move","help","not-allowed","none","context-menu","progress","cell","crosshair","vertical-text","alias","copy","no-drop","grab","grabbing","all-scroll","col-resize","row-resize","n-resize","e-resize","s-resize","w-resize","ne-resize","nw-resize","se-resize","sw-resize","ew-resize","ns-resize","nesw-resize","nwse-resize","zoom-in","zoom-out",s]}],"caret-color":[{caret:[e]}],"pointer-events":[{"pointer-events":["none","auto"]}],resize:[{resize:["none","y","x",""]}],"scroll-behavior":[{scroll:["auto","smooth"]}],"scroll-m":[{"scroll-m":p()}],"scroll-mx":[{"scroll-mx":p()}],"scroll-my":[{"scroll-my":p()}],"scroll-ms":[{"scroll-ms":p()}],"scroll-me":[{"scroll-me":p()}],"scroll-mt":[{"scroll-mt":p()}],"scroll-mr":[{"scroll-mr":p()}],"scroll-mb":[{"scroll-mb":p()}],"scroll-ml":[{"scroll-ml":p()}],"scroll-p":[{"scroll-p":p()}],"scroll-px":[{"scroll-px":p()}],"scroll-py":[{"scroll-py":p()}],"scroll-ps":[{"scroll-ps":p()}],"scroll-pe":[{"scroll-pe":p()}],"scroll-pt":[{"scroll-pt":p()}],"scroll-pr":[{"scroll-pr":p()}],"scroll-pb":[{"scroll-pb":p()}],"scroll-pl":[{"scroll-pl":p()}],"snap-align":[{snap:["start","end","center","align-none"]}],"snap-stop":[{snap:["normal","always"]}],"snap-type":[{snap:["none","x","y","both"]}],"snap-strictness":[{snap:["mandatory","proximity"]}],touch:[{touch:["auto","none","pinch-zoom","manipulation",{pan:["x","left","right","y","up","down"]}]}],select:[{select:["none","text","all","auto"]}],"will-change":[{"will-change":["auto","scroll","contents","transform",s]}],fill:[{fill:[e,"none"]}],"stroke-w":[{stroke:[w,N]}],stroke:[{stroke:[e,"none"]}],sr:["sr-only","not-sr-only"]},conflictingClassGroups:{overflow:["overflow-x","overflow-y"],overscroll:["overscroll-x","overscroll-y"],inset:["inset-x","inset-y","start","end","top","right","bottom","left"],"inset-x":["right","left"],"inset-y":["top","bottom"],flex:["basis","grow","shrink"],gap:["gap-x","gap-y"],p:["px","py","ps","pe","pt","pr","pb","pl"],px:["pr","pl"],py:["pt","pb"],m:["mx","my","ms","me","mt","mr","mb","ml"],mx:["mr","ml"],my:["mt","mb"],"font-size":["leading"],"fvn-normal":["fvn-ordinal","fvn-slashed-zero","fvn-figure","fvn-spacing","fvn-fraction"],"fvn-ordinal":["fvn-normal"],"fvn-slashed-zero":["fvn-normal"],"fvn-figure":["fvn-normal"],"fvn-spacing":["fvn-normal"],"fvn-fraction":["fvn-normal"],rounded:["rounded-s","rounded-e","rounded-t","rounded-r","rounded-b","rounded-l","rounded-ss","rounded-se","rounded-ee","rounded-es","rounded-tl","rounded-tr","rounded-br","rounded-bl"],"rounded-s":["rounded-ss","rounded-es"],"rounded-e":["rounded-se","rounded-ee"],"rounded-t":["rounded-tl","rounded-tr"],"rounded-r":["rounded-tr","rounded-br"],"rounded-b":["rounded-br","rounded-bl"],"rounded-l":["rounded-tl","rounded-bl"],"border-spacing":["border-spacing-x","border-spacing-y"],"border-w":["border-w-s","border-w-e","border-w-t","border-w-r","border-w-b","border-w-l"],"border-w-x":["border-w-r","border-w-l"],"border-w-y":["border-w-t","border-w-b"],"border-color":["border-color-t","border-color-r","border-color-b","border-color-l"],"border-color-x":["border-color-r","border-color-l"],"border-color-y":["border-color-t","border-color-b"],"scroll-m":["scroll-mx","scroll-my","scroll-ms","scroll-me","scroll-mt","scroll-mr","scroll-mb","scroll-ml"],"scroll-mx":["scroll-mr","scroll-ml"],"scroll-my":["scroll-mt","scroll-mb"],"scroll-p":["scroll-px","scroll-py","scroll-ps","scroll-pe","scroll-pt","scroll-pr","scroll-pb","scroll-pl"],"scroll-px":["scroll-pr","scroll-pl"],"scroll-py":["scroll-pt","scroll-pb"]},conflictingClassGroupModifiers:{"font-size":["leading"]}}}var We=we(je);const _e={"5xl":"text-5xl lg:text-6xl lg:tracking-tight xl:text-7xl","4xl":"text-4xl lg:text-4xl lg:tracking-tight xl:text-5xl","3xl":"text-3xl lg:text-3xl lg:tracking-tight","2xl":"text-2xl tracking-tight",xl:"text-xl",lg:"text-lg",md:"text-base",sm:"text-sm",xs:"text-xs"},Le={normal:"font-normal",medium:"font-medium",bold:"font-bold"},Oe={primary:"text-primary","primary-focus":"text-primary-focus","primary-content":"text-primary-content",secondary:"text-secondary","secondary-focus":"text-secondary-focus","secondary-content":"text-secondary-content",accent:"text-accent","accent-focus":"text-accent-focus","accent-content":"text-accent-content",neutral:"text-neutral","neutral-focus":"text-neutral-focus","neutral-content":"text-neutral-content",info:"text-info","info-content":"text-info-content",success:"text-success","success-content":"text-success-content",warning:"text-warning","warning-content":"text-warning-content",error:"text-error","error-content":"text-error-content"},Ve={none:"xs:leading-none sm:leading-none md:leading-none lg:leading-none xl:leading-none",tight:"xs:leading-tight sm:leading-tight md:leading-tight lg:leading-tight xl:leading-tight",snug:"xs:leading-snug sm:leading-snug md:leading-snug lg:leading-snug xl:leading-snug",normal:"xs:leading-normal sm:leading-normal md:leading-normal lg:leading-normal xl:leading-normal",relaxed:"xs:leading-relaxed sm:leading-relaxed md:leading-relaxed lg:leading-relaxed xl:leading-relaxed",loose:"xs:leading-loose sm:leading-loose md:leading-loose lg:leading-loose xl:leading-loose"};function re({as:e,size:r="md",weight:t="normal",color:o="neutral",lineHeight:i="normal",className:l,children:n,...a}){return le(e||"p",{className:We(se(_e[r],Le[t],Oe[o],Ve[i],l)),...a,children:n})}try{re.displayName="Typography",re.__docgenInfo={description:"",displayName:"Typography",props:{as:{defaultValue:null,description:"",name:"as",required:!1,type:{name:"enum",value:[{value:'"div"'},{value:'"h1"'},{value:'"h2"'},{value:'"h3"'},{value:'"h4"'},{value:'"h5"'},{value:'"h6"'},{value:'"p"'},{value:'"span"'}]}},size:{defaultValue:{value:"md"},description:"",name:"size",required:!1,type:{name:"enum",value:[{value:'"xs"'},{value:'"sm"'},{value:'"md"'},{value:'"lg"'},{value:'"xl"'},{value:'"2xl"'},{value:'"3xl"'},{value:'"4xl"'},{value:'"5xl"'}]}},weight:{defaultValue:{value:"normal"},description:"",name:"weight",required:!1,type:{name:"enum",value:[{value:'"normal"'},{value:'"medium"'},{value:'"bold"'}]}},color:{defaultValue:{value:"neutral"},description:"",name:"color",required:!1,type:{name:"enum",value:[{value:'"primary"'},{value:'"primary-focus"'},{value:'"primary-content"'},{value:'"secondary"'},{value:'"secondary-focus"'},{value:'"secondary-content"'},{value:'"accent"'},{value:'"accent-focus"'},{value:'"accent-content"'},{value:'"neutral"'},{value:'"neutral-focus"'},{value:'"neutral-content"'},{value:'"info"'},{value:'"info-content"'},{value:'"success"'},{value:'"success-content"'},{value:'"warning"'},{value:'"warning-content"'},{value:'"error"'},{value:'"error-content"'}]}},lineHeight:{defaultValue:{value:"normal"},description:"",name:"lineHeight",required:!1,type:{name:"enum",value:[{value:'"none"'},{value:'"normal"'},{value:'"tight"'},{value:'"snug"'},{value:'"relaxed"'},{value:'"loose"'}]}}}}}catch{}export{re as T};
//# sourceMappingURL=typography-87846fd9.js.map
