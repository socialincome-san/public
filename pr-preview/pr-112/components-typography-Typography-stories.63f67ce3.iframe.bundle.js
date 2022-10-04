/*! For license information please see components-typography-Typography-stories.63f67ce3.iframe.bundle.js.LICENSE.txt */
(self.webpackChunk_socialincome_ui=self.webpackChunk_socialincome_ui||[]).push([[460],{"./src/components/typography/Typography.stories.tsx":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{"use strict";__webpack_require__.r(__webpack_exports__),__webpack_require__.d(__webpack_exports__,{Overview:()=>Overview,__namedExportsOrder:()=>__namedExportsOrder,default:()=>__WEBPACK_DEFAULT_EXPORT__});__webpack_require__("../node_modules/core-js/modules/es.object.keys.js"),__webpack_require__("../node_modules/core-js/modules/es.array.index-of.js"),__webpack_require__("../node_modules/core-js/modules/es.symbol.js"),__webpack_require__("../node_modules/core-js/modules/es.object.assign.js"),__webpack_require__("../node_modules/core-js/modules/es.function.bind.js");var _Typography__WEBPACK_IMPORTED_MODULE_5__=__webpack_require__("./src/components/typography/Typography.tsx"),react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__=__webpack_require__("../node_modules/react/jsx-runtime.js"),_excluded=["children"];function _objectWithoutProperties(source,excluded){if(null==source)return{};var key,i,target=function _objectWithoutPropertiesLoose(source,excluded){if(null==source)return{};var key,i,target={},sourceKeys=Object.keys(source);for(i=0;i<sourceKeys.length;i++)key=sourceKeys[i],excluded.indexOf(key)>=0||(target[key]=source[key]);return target}(source,excluded);if(Object.getOwnPropertySymbols){var sourceSymbolKeys=Object.getOwnPropertySymbols(source);for(i=0;i<sourceSymbolKeys.length;i++)key=sourceSymbolKeys[i],excluded.indexOf(key)>=0||Object.prototype.propertyIsEnumerable.call(source,key)&&(target[key]=source[key])}return target}const __WEBPACK_DEFAULT_EXPORT__={component:_Typography__WEBPACK_IMPORTED_MODULE_5__.E,argTypes:{size:{options:_Typography__WEBPACK_IMPORTED_MODULE_5__._,control:{type:"select"}}}};var Template=function Template(_ref){var children=_ref.children,args=_objectWithoutProperties(_ref,_excluded);return(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)(_Typography__WEBPACK_IMPORTED_MODULE_5__.E,Object.assign({},args,{children}))};Template.displayName="Template";var Overview=Template.bind({});Overview.args={children:"Text",element:"h1",size:"xl"},Overview.parameters=Object.assign({storySource:{source:"({ children, ...args }) => (\n\t<SoTypography {...args}>{children}</SoTypography>\n)"}},Overview.parameters);var __namedExportsOrder=["Overview"]},"./src/components/typography/Typography.tsx":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{"use strict";__webpack_require__.d(__webpack_exports__,{E:()=>SoTypography,_:()=>SO_TYPOGRAPHY_SIZES});__webpack_require__("../node_modules/core-js/modules/es.object.keys.js"),__webpack_require__("../node_modules/core-js/modules/es.array.index-of.js"),__webpack_require__("../node_modules/core-js/modules/es.symbol.js"),__webpack_require__("../node_modules/core-js/modules/es.object.assign.js");var classnames__WEBPACK_IMPORTED_MODULE_4__=__webpack_require__("../node_modules/classnames/index.js"),classnames__WEBPACK_IMPORTED_MODULE_4___default=__webpack_require__.n(classnames__WEBPACK_IMPORTED_MODULE_4__),react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__=__webpack_require__("../node_modules/react/jsx-runtime.js"),_excluded=["element","size","className","children"];function _objectWithoutProperties(source,excluded){if(null==source)return{};var key,i,target=function _objectWithoutPropertiesLoose(source,excluded){if(null==source)return{};var key,i,target={},sourceKeys=Object.keys(source);for(i=0;i<sourceKeys.length;i++)key=sourceKeys[i],excluded.indexOf(key)>=0||(target[key]=source[key]);return target}(source,excluded);if(Object.getOwnPropertySymbols){var sourceSymbolKeys=Object.getOwnPropertySymbols(source);for(i=0;i<sourceSymbolKeys.length;i++)key=sourceSymbolKeys[i],excluded.indexOf(key)>=0||Object.prototype.propertyIsEnumerable.call(source,key)&&(target[key]=source[key])}return target}var SO_TYPOGRAPHY_SIZES=["xs","sm","base","lg","xl","2xl","3xl","4xl","5xl","6xl","7xl","8xl","9xl"],SoTypography=function SoTypography(_ref){var _ref$element=_ref.element,element=void 0===_ref$element?"p":_ref$element,_ref$size=_ref.size,size=void 0===_ref$size?"base":_ref$size,className=_ref.className,children=_ref.children,props=_objectWithoutProperties(_ref,_excluded),DOMelement=element;return(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)(DOMelement,Object.assign({className:classnames__WEBPACK_IMPORTED_MODULE_4___default()(className,"text-"+size)},props,{children}))};SoTypography.displayName="SoTypography";try{SoTypography.displayName="SoTypography",SoTypography.__docgenInfo={description:"Component to apply different text styles",displayName:"SoTypography",props:{element:{defaultValue:{value:"p"},description:"The DOM element type e.g. h1, h2, h3,..., p",name:"element",required:!1,type:{name:"enum",value:[{value:'"p"'},{value:'"h1"'},{value:'"h2"'},{value:'"h3"'},{value:'"h4"'},{value:'"h5"'},{value:'"h6"'},{value:'"span"'}]}},size:{defaultValue:{value:"base"},description:"The text size from the predefined stack",name:"size",required:!1,type:{name:"enum",value:[{value:'"xs"'},{value:'"sm"'},{value:'"base"'},{value:'"lg"'},{value:'"xl"'},{value:'"2xl"'},{value:'"3xl"'},{value:'"4xl"'},{value:'"5xl"'},{value:'"6xl"'},{value:'"7xl"'},{value:'"8xl"'},{value:'"9xl"'}]}}}},"undefined"!=typeof STORYBOOK_REACT_CLASSES&&(STORYBOOK_REACT_CLASSES["src/components/typography/Typography.tsx#SoTypography"]={docgenInfo:SoTypography.__docgenInfo,name:"SoTypography",path:"src/components/typography/Typography.tsx#SoTypography"})}catch(__react_docgen_typescript_loader_error){}},"../node_modules/classnames/index.js":(module,exports)=>{var __WEBPACK_AMD_DEFINE_RESULT__;!function(){"use strict";var hasOwn={}.hasOwnProperty;function classNames(){for(var classes=[],i=0;i<arguments.length;i++){var arg=arguments[i];if(arg){var argType=typeof arg;if("string"===argType||"number"===argType)classes.push(arg);else if(Array.isArray(arg)){if(arg.length){var inner=classNames.apply(null,arg);inner&&classes.push(inner)}}else if("object"===argType){if(arg.toString!==Object.prototype.toString&&!arg.toString.toString().includes("[native code]")){classes.push(arg.toString());continue}for(var key in arg)hasOwn.call(arg,key)&&arg[key]&&classes.push(key)}}}return classes.join(" ")}module.exports?(classNames.default=classNames,module.exports=classNames):void 0===(__WEBPACK_AMD_DEFINE_RESULT__=function(){return classNames}.apply(exports,[]))||(module.exports=__WEBPACK_AMD_DEFINE_RESULT__)}()},"../node_modules/core-js/modules/es.array.index-of.js":(__unused_webpack_module,__unused_webpack_exports,__webpack_require__)=>{"use strict";var $=__webpack_require__("../node_modules/core-js/internals/export.js"),uncurryThis=__webpack_require__("../node_modules/core-js/internals/function-uncurry-this.js"),$indexOf=__webpack_require__("../node_modules/core-js/internals/array-includes.js").indexOf,arrayMethodIsStrict=__webpack_require__("../node_modules/core-js/internals/array-method-is-strict.js"),nativeIndexOf=uncurryThis([].indexOf),NEGATIVE_ZERO=!!nativeIndexOf&&1/nativeIndexOf([1],1,-0)<0,STRICT_METHOD=arrayMethodIsStrict("indexOf");$({target:"Array",proto:!0,forced:NEGATIVE_ZERO||!STRICT_METHOD},{indexOf:function indexOf(searchElement){var fromIndex=arguments.length>1?arguments[1]:void 0;return NEGATIVE_ZERO?nativeIndexOf(this,searchElement,fromIndex)||0:$indexOf(this,searchElement,fromIndex)}})},"../node_modules/react/cjs/react-jsx-runtime.production.min.js":(__unused_webpack_module,exports,__webpack_require__)=>{"use strict";var f=__webpack_require__("../node_modules/react/index.js"),k=Symbol.for("react.element"),l=Symbol.for("react.fragment"),m=Object.prototype.hasOwnProperty,n=f.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner,p={key:!0,ref:!0,__self:!0,__source:!0};function q(c,a,g){var b,d={},e=null,h=null;for(b in void 0!==g&&(e=""+g),void 0!==a.key&&(e=""+a.key),void 0!==a.ref&&(h=a.ref),a)m.call(a,b)&&!p.hasOwnProperty(b)&&(d[b]=a[b]);if(c&&c.defaultProps)for(b in a=c.defaultProps)void 0===d[b]&&(d[b]=a[b]);return{$$typeof:k,type:c,key:e,ref:h,props:d,_owner:n.current}}exports.Fragment=l,exports.jsx=q,exports.jsxs=q},"../node_modules/react/jsx-runtime.js":(module,__unused_webpack_exports,__webpack_require__)=>{"use strict";module.exports=__webpack_require__("../node_modules/react/cjs/react-jsx-runtime.production.min.js")}}]);