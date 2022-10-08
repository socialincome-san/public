/*! For license information please see foundations-Typography-stories-mdx.c39568e2.iframe.bundle.js.LICENSE.txt */
(self.webpackChunk_socialincome_ui=self.webpackChunk_socialincome_ui||[]).push([[124],{"../node_modules/@storybook/addon-postcss/node_modules/css-loader/dist/cjs.js??ruleSet[1].rules[7].use[1]!../node_modules/postcss-loader/dist/cjs.js??ruleSet[1].rules[7].use[2]!./src/lib/util/documentation/components/typography-list.css":(module,exports,__webpack_require__)=>{(exports=__webpack_require__("../node_modules/@storybook/addon-postcss/node_modules/css-loader/dist/runtime/api.js")(!1)).push([module.id,".so-docs-typography-list {\n\tgrid-template-columns: auto 1fr;\n}\n",""]),module.exports=exports},"./src/lib/util/documentation/components/typography-list.css":(module,__unused_webpack_exports,__webpack_require__)=>{var api=__webpack_require__("../node_modules/@storybook/addon-postcss/node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js"),content=__webpack_require__("../node_modules/@storybook/addon-postcss/node_modules/css-loader/dist/cjs.js??ruleSet[1].rules[7].use[1]!../node_modules/postcss-loader/dist/cjs.js??ruleSet[1].rules[7].use[2]!./src/lib/util/documentation/components/typography-list.css");"string"==typeof(content=content.__esModule?content.default:content)&&(content=[[module.id,content,""]]);var options={insert:"head",singleton:!1};api(content,options);module.exports=content.locals||{}},"./src/components/typography/Typography.tsx":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{"use strict";__webpack_require__.d(__webpack_exports__,{E:()=>SoTypography,_:()=>SO_TYPOGRAPHY_SIZES});__webpack_require__("../node_modules/core-js/modules/es.object.keys.js"),__webpack_require__("../node_modules/core-js/modules/es.array.index-of.js"),__webpack_require__("../node_modules/core-js/modules/es.symbol.js"),__webpack_require__("../node_modules/core-js/modules/es.object.assign.js");var classnames__WEBPACK_IMPORTED_MODULE_4__=__webpack_require__("../node_modules/classnames/index.js"),classnames__WEBPACK_IMPORTED_MODULE_4___default=__webpack_require__.n(classnames__WEBPACK_IMPORTED_MODULE_4__),react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__=__webpack_require__("../node_modules/react/jsx-runtime.js"),_excluded=["element","size","className","children"];function _objectWithoutProperties(source,excluded){if(null==source)return{};var key,i,target=function _objectWithoutPropertiesLoose(source,excluded){if(null==source)return{};var key,i,target={},sourceKeys=Object.keys(source);for(i=0;i<sourceKeys.length;i++)key=sourceKeys[i],excluded.indexOf(key)>=0||(target[key]=source[key]);return target}(source,excluded);if(Object.getOwnPropertySymbols){var sourceSymbolKeys=Object.getOwnPropertySymbols(source);for(i=0;i<sourceSymbolKeys.length;i++)key=sourceSymbolKeys[i],excluded.indexOf(key)>=0||Object.prototype.propertyIsEnumerable.call(source,key)&&(target[key]=source[key])}return target}var SO_TYPOGRAPHY_SIZES=["xs","sm","base","lg","xl","2xl","3xl","4xl","5xl","6xl","7xl","8xl","9xl"],SoTypography=function SoTypography(_ref){var _ref$element=_ref.element,element=void 0===_ref$element?"p":_ref$element,_ref$size=_ref.size,size=void 0===_ref$size?"base":_ref$size,className=_ref.className,children=_ref.children,props=_objectWithoutProperties(_ref,_excluded),DOMelement=element;return(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)(DOMelement,Object.assign({className:classnames__WEBPACK_IMPORTED_MODULE_4___default()(className,"text-"+size)},props,{children}))};SoTypography.displayName="SoTypography";try{SoTypography.displayName="SoTypography",SoTypography.__docgenInfo={description:"Component to apply different text styles",displayName:"SoTypography",props:{element:{defaultValue:{value:"p"},description:"The DOM element type e.g. h1, h2, h3,..., p",name:"element",required:!1,type:{name:"enum",value:[{value:'"p"'},{value:'"h1"'},{value:'"h2"'},{value:'"h3"'},{value:'"h4"'},{value:'"h5"'},{value:'"h6"'},{value:'"span"'}]}},size:{defaultValue:{value:"base"},description:"The text size from the predefined stack",name:"size",required:!1,type:{name:"enum",value:[{value:'"xs"'},{value:'"sm"'},{value:'"base"'},{value:'"lg"'},{value:'"xl"'},{value:'"2xl"'},{value:'"3xl"'},{value:'"4xl"'},{value:'"5xl"'},{value:'"6xl"'},{value:'"7xl"'},{value:'"8xl"'},{value:'"9xl"'}]}}}},"undefined"!=typeof STORYBOOK_REACT_CLASSES&&(STORYBOOK_REACT_CLASSES["src/components/typography/Typography.tsx#SoTypography"]={docgenInfo:SoTypography.__docgenInfo,name:"SoTypography",path:"src/components/typography/Typography.tsx#SoTypography"})}catch(__react_docgen_typescript_loader_error){}},"./src/foundations/Typography.stories.mdx":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{"use strict";__webpack_require__.r(__webpack_exports__),__webpack_require__.d(__webpack_exports__,{__namedExportsOrder:()=>__namedExportsOrder,__page:()=>__page,default:()=>Typography_stories,typeScale:()=>typeScale});__webpack_require__("../node_modules/core-js/modules/es.object.keys.js"),__webpack_require__("../node_modules/core-js/modules/es.array.index-of.js"),__webpack_require__("../node_modules/core-js/modules/es.symbol.js"),__webpack_require__("../node_modules/core-js/modules/es.function.bind.js"),__webpack_require__("../node_modules/core-js/modules/es.object.assign.js");var react=__webpack_require__("../node_modules/react/index.js"),esm=__webpack_require__("../node_modules/@mdx-js/react/dist/esm.js"),blocks=__webpack_require__("../node_modules/@storybook/addon-docs/dist/esm/blocks/index.js"),browser=__webpack_require__("../node_modules/util-deprecate/browser.js"),browser_default=__webpack_require__.n(browser),ts_dedent_esm=__webpack_require__("../node_modules/ts-dedent/esm/index.js");browser_default()((()=>{}),ts_dedent_esm.C`
    Importing from '@storybook/addon-docs/blocks' is deprecated, import directly from '@storybook/addon-docs' instead:
    
    https://github.com/storybookjs/storybook/blob/next/MIGRATION.md#deprecated-scoped-blocks-imports
`)();__webpack_require__("../node_modules/core-js/modules/es.object.to-string.js"),__webpack_require__("../node_modules/core-js/modules/es.reflect.construct.js"),__webpack_require__("../node_modules/core-js/modules/es.promise.js"),__webpack_require__("../node_modules/core-js/modules/es.symbol.description.js"),__webpack_require__("../node_modules/core-js/modules/es.symbol.iterator.js"),__webpack_require__("../node_modules/core-js/modules/es.array.iterator.js"),__webpack_require__("../node_modules/core-js/modules/es.string.iterator.js"),__webpack_require__("../node_modules/core-js/modules/web.dom-collections.iterator.js"),__webpack_require__("../node_modules/regenerator-runtime/runtime.js"),__webpack_require__("../node_modules/core-js/modules/es.array.concat.js"),__webpack_require__("../node_modules/core-js/modules/es.object.get-prototype-of.js");var utils=__webpack_require__("../node_modules/@storybook/addon-links/dist/esm/utils.js");function _typeof(obj){return _typeof="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(obj){return typeof obj}:function(obj){return obj&&"function"==typeof Symbol&&obj.constructor===Symbol&&obj!==Symbol.prototype?"symbol":typeof obj},_typeof(obj)}var _excluded=["kind","story","children"];function _extends(){return _extends=Object.assign||function(target){for(var i=1;i<arguments.length;i++){var source=arguments[i];for(var key in source)Object.prototype.hasOwnProperty.call(source,key)&&(target[key]=source[key])}return target},_extends.apply(this,arguments)}function _objectWithoutProperties(source,excluded){if(null==source)return{};var key,i,target=function _objectWithoutPropertiesLoose(source,excluded){if(null==source)return{};var key,i,target={},sourceKeys=Object.keys(source);for(i=0;i<sourceKeys.length;i++)key=sourceKeys[i],excluded.indexOf(key)>=0||(target[key]=source[key]);return target}(source,excluded);if(Object.getOwnPropertySymbols){var sourceSymbolKeys=Object.getOwnPropertySymbols(source);for(i=0;i<sourceSymbolKeys.length;i++)key=sourceSymbolKeys[i],excluded.indexOf(key)>=0||Object.prototype.propertyIsEnumerable.call(source,key)&&(target[key]=source[key])}return target}function asyncGeneratorStep(gen,resolve,reject,_next,_throw,key,arg){try{var info=gen[key](arg),value=info.value}catch(error){return void reject(error)}info.done?resolve(value):Promise.resolve(value).then(_next,_throw)}function _asyncToGenerator(fn){return function(){var self=this,args=arguments;return new Promise((function(resolve,reject){var gen=fn.apply(self,args);function _next(value){asyncGeneratorStep(gen,resolve,reject,_next,_throw,"next",value)}function _throw(err){asyncGeneratorStep(gen,resolve,reject,_next,_throw,"throw",err)}_next(void 0)}))}}function _classCallCheck(instance,Constructor){if(!(instance instanceof Constructor))throw new TypeError("Cannot call a class as a function")}function _defineProperties(target,props){for(var i=0;i<props.length;i++){var descriptor=props[i];descriptor.enumerable=descriptor.enumerable||!1,descriptor.configurable=!0,"value"in descriptor&&(descriptor.writable=!0),Object.defineProperty(target,descriptor.key,descriptor)}}function _setPrototypeOf(o,p){return _setPrototypeOf=Object.setPrototypeOf||function _setPrototypeOf(o,p){return o.__proto__=p,o},_setPrototypeOf(o,p)}function _createSuper(Derived){var hasNativeReflectConstruct=function _isNativeReflectConstruct(){if("undefined"==typeof Reflect||!Reflect.construct)return!1;if(Reflect.construct.sham)return!1;if("function"==typeof Proxy)return!0;try{return Boolean.prototype.valueOf.call(Reflect.construct(Boolean,[],(function(){}))),!0}catch(e){return!1}}();return function _createSuperInternal(){var result,Super=_getPrototypeOf(Derived);if(hasNativeReflectConstruct){var NewTarget=_getPrototypeOf(this).constructor;result=Reflect.construct(Super,arguments,NewTarget)}else result=Super.apply(this,arguments);return _possibleConstructorReturn(this,result)}}function _possibleConstructorReturn(self,call){if(call&&("object"===_typeof(call)||"function"==typeof call))return call;if(void 0!==call)throw new TypeError("Derived constructors may only return object or undefined");return function _assertThisInitialized(self){if(void 0===self)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return self}(self)}function _getPrototypeOf(o){return _getPrototypeOf=Object.setPrototypeOf?Object.getPrototypeOf:function _getPrototypeOf(o){return o.__proto__||Object.getPrototypeOf(o)},_getPrototypeOf(o)}var isPlainLeftClick=function isPlainLeftClick(e){return!(0!==e.button||e.altKey||e.ctrlKey||e.metaKey||e.shiftKey)};(function(_PureComponent){!function _inherits(subClass,superClass){if("function"!=typeof superClass&&null!==superClass)throw new TypeError("Super expression must either be null or a function");subClass.prototype=Object.create(superClass&&superClass.prototype,{constructor:{value:subClass,writable:!0,configurable:!0}}),Object.defineProperty(subClass,"prototype",{writable:!1}),superClass&&_setPrototypeOf(subClass,superClass)}(LinkTo,_PureComponent);var _super=_createSuper(LinkTo);function LinkTo(){var _this;_classCallCheck(this,LinkTo);for(var _len=arguments.length,args=new Array(_len),_key=0;_key<_len;_key++)args[_key]=arguments[_key];return(_this=_super.call.apply(_super,[this].concat(args))).state={href:"/"},_this.updateHref=_asyncToGenerator(regeneratorRuntime.mark((function _callee(){var _this$props,kind,story,href;return regeneratorRuntime.wrap((function _callee$(_context){for(;;)switch(_context.prev=_context.next){case 0:return _this$props=_this.props,kind=_this$props.kind,story=_this$props.story,_context.next=3,(0,utils.ew)(kind,story);case 3:href=_context.sent,_this.setState({href});case 5:case"end":return _context.stop()}}),_callee)}))),_this.handleClick=function(){(0,utils.c4)(_this.props)},_this}return function _createClass(Constructor,protoProps,staticProps){return protoProps&&_defineProperties(Constructor.prototype,protoProps),staticProps&&_defineProperties(Constructor,staticProps),Object.defineProperty(Constructor,"prototype",{writable:!1}),Constructor}(LinkTo,[{key:"componentDidMount",value:function componentDidMount(){this.updateHref()}},{key:"componentDidUpdate",value:function componentDidUpdate(prevProps){var _this$props2=this.props,kind=_this$props2.kind,story=_this$props2.story;prevProps.kind===kind&&prevProps.story===story||this.updateHref()}},{key:"render",value:function render(){var _this2=this,_this$props3=this.props,children=(_this$props3.kind,_this$props3.story,_this$props3.children),rest=_objectWithoutProperties(_this$props3,_excluded),href=this.state.href;return react.createElement("a",_extends({href,onClick:function onClick(e){return function cancelled(e){var cb=arguments.length>1&&void 0!==arguments[1]?arguments[1]:function(_e){};isPlainLeftClick(e)&&(e.preventDefault(),cb(e))}(e,_this2.handleClick)}},rest),children)}}]),LinkTo}(react.PureComponent)).defaultProps={kind:null,story:null,children:void 0};var Typography=__webpack_require__("./src/components/typography/Typography.tsx"),jsx_runtime=(__webpack_require__("../node_modules/core-js/modules/es.array.map.js"),__webpack_require__("./src/lib/util/documentation/components/typography-list.css"),__webpack_require__("../node_modules/react/jsx-runtime.js")),DocTypographyItem=function DocTypographyItem(_ref){var title=_ref.title,children=_ref.children,description=_ref.description;return(0,jsx_runtime.jsxs)(jsx_runtime.Fragment,{children:[(0,jsx_runtime.jsx)("figure",{className:"so-docs-typography-item__example text-right","aria-hidden":!0,children}),(0,jsx_runtime.jsxs)("div",{className:"so-docs-typography-item__text",children:[(0,jsx_runtime.jsx)("h2",{className:"so-docs-typography-item__title font-bold",children:title}),description]})]})};try{DocTypographyItem.displayName="DocTypographyItem",DocTypographyItem.__docgenInfo={description:"An util element for visual representation of Typography elements inside Storybook",displayName:"DocTypographyItem",props:{title:{defaultValue:null,description:"",name:"title",required:!0,type:{name:"any"}},description:{defaultValue:null,description:"",name:"description",required:!0,type:{name:"any"}}}},"undefined"!=typeof STORYBOOK_REACT_CLASSES&&(STORYBOOK_REACT_CLASSES["src/lib/util/documentation/components/TypographyItem.tsx#DocTypographyItem"]={docgenInfo:DocTypographyItem.__docgenInfo,name:"DocTypographyItem",path:"src/lib/util/documentation/components/TypographyItem.tsx#DocTypographyItem"})}catch(__react_docgen_typescript_loader_error){}var TypographyList_excluded=["children"];function TypographyList_objectWithoutProperties(source,excluded){if(null==source)return{};var key,i,target=function TypographyList_objectWithoutPropertiesLoose(source,excluded){if(null==source)return{};var key,i,target={},sourceKeys=Object.keys(source);for(i=0;i<sourceKeys.length;i++)key=sourceKeys[i],excluded.indexOf(key)>=0||(target[key]=source[key]);return target}(source,excluded);if(Object.getOwnPropertySymbols){var sourceSymbolKeys=Object.getOwnPropertySymbols(source);for(i=0;i<sourceSymbolKeys.length;i++)key=sourceSymbolKeys[i],excluded.indexOf(key)>=0||Object.prototype.propertyIsEnumerable.call(source,key)&&(target[key]=source[key])}return target}var DocTypographyList=function DocTypographyList(_ref){var items=_ref.items;return(0,jsx_runtime.jsx)("div",{className:"so-docs-typography-list grid gap-y-4 gap-x-8 rounded shadow-sm border p-10",children:items.map((function(_ref2){var children=_ref2.children,itemProps=TypographyList_objectWithoutProperties(_ref2,TypographyList_excluded);return(0,jsx_runtime.jsx)(DocTypographyItem,Object.assign({},itemProps,{children}))}))})};DocTypographyList.displayName="DocTypographyList";try{DocTypographyList.displayName="DocTypographyList",DocTypographyList.__docgenInfo={description:"",displayName:"DocTypographyList",props:{items:{defaultValue:null,description:"",name:"items",required:!0,type:{name:"DocTypographyItemProps[]"}}}},"undefined"!=typeof STORYBOOK_REACT_CLASSES&&(STORYBOOK_REACT_CLASSES["src/lib/util/documentation/components/TypographyList.tsx#DocTypographyList"]={docgenInfo:DocTypographyList.__docgenInfo,name:"DocTypographyList",path:"src/lib/util/documentation/components/TypographyList.tsx#DocTypographyList"})}catch(__react_docgen_typescript_loader_error){}var Typography_stories_excluded=["components"];function Typography_stories_extends(){return Typography_stories_extends=Object.assign?Object.assign.bind():function(target){for(var i=1;i<arguments.length;i++){var source=arguments[i];for(var key in source)Object.prototype.hasOwnProperty.call(source,key)&&(target[key]=source[key])}return target},Typography_stories_extends.apply(this,arguments)}function Typography_stories_objectWithoutProperties(source,excluded){if(null==source)return{};var key,i,target=function Typography_stories_objectWithoutPropertiesLoose(source,excluded){if(null==source)return{};var key,i,target={},sourceKeys=Object.keys(source);for(i=0;i<sourceKeys.length;i++)key=sourceKeys[i],excluded.indexOf(key)>=0||(target[key]=source[key]);return target}(source,excluded);if(Object.getOwnPropertySymbols){var sourceSymbolKeys=Object.getOwnPropertySymbols(source);for(i=0;i<sourceSymbolKeys.length;i++)key=sourceSymbolKeys[i],excluded.indexOf(key)>=0||Object.prototype.propertyIsEnumerable.call(source,key)&&(target[key]=source[key])}return target}var typeScale=[{size:"9xl",title:"Extra Large 9",children:(0,esm.kt)(Typography.E,{size:"9xl",mdxType:"SoTypography"},"9xl")},{size:"8xl",title:"Extra Large 8",children:(0,esm.kt)(Typography.E,{size:"8xl",mdxType:"SoTypography"},"8xl")},{size:"7xl",title:"Extra Large 7",children:(0,esm.kt)(Typography.E,{size:"7xl",mdxType:"SoTypography"},"7xl")},{size:"6xl",title:"Extra Large 6",children:(0,esm.kt)(Typography.E,{size:"6xl",mdxType:"SoTypography"},"6xl")},{size:"5xl",title:"Extra Large 5",children:(0,esm.kt)(Typography.E,{size:"5xl",mdxType:"SoTypography"},"5xl")},{size:"4xl",title:"Extra Large 4",children:(0,esm.kt)(Typography.E,{size:"4xl",mdxType:"SoTypography"},"4xl")},{size:"3xl",title:"Extra Large 3",children:(0,esm.kt)(Typography.E,{size:"3xl",mdxType:"SoTypography"},"3xl")},{size:"2xl",title:"Extra Large 2",children:(0,esm.kt)(Typography.E,{size:"2xl",mdxType:"SoTypography"},"2xl")},{size:"xl",title:"Extra Large",children:(0,esm.kt)(Typography.E,{size:"xl",mdxType:"SoTypography"},"xl")},{size:"lg",title:"Large",children:(0,esm.kt)(Typography.E,{size:"lg",mdxType:"SoTypography"},"lg")},{size:"base",title:"Base",description:"Default size for body text",children:(0,esm.kt)(Typography.E,{size:"base",mdxType:"SoTypography"},"base")},{size:"sm",title:"Small",children:(0,esm.kt)(Typography.E,{size:"sm",mdxType:"SoTypography"},"sm")},{size:"xs",title:"Extra Small",children:(0,esm.kt)(Typography.E,{size:"xs",mdxType:"SoTypography"},"xs")}],layoutProps={typeScale};function MDXContent(_ref){var components=_ref.components,props=Typography_stories_objectWithoutProperties(_ref,Typography_stories_excluded);return(0,esm.kt)("wrapper",Typography_stories_extends({},layoutProps,props,{components,mdxType:"MDXLayout"}),(0,esm.kt)(blocks.Meta,{title:"Foundations/Typography",mdxType:"Meta"}),(0,esm.kt)("h1",null,"Typography"),(0,esm.kt)("p",null,"Social Income uses the ",(0,esm.kt)("a",{parentName:"p",href:"https://lineto.com/typefaces/unica77"},"Unica77"),"\nfont family. The font family is not open-source, therefore the fonts in\nthe source repository can only be used in the context of the Social\nIncome projects."),(0,esm.kt)("p",null,"There is a React component to utilize the typography stack, see\n",(0,esm.kt)("strong",{parentName:"p"},"Components")," > ",(0,esm.kt)("strong",{parentName:"p"},"Typography"),"."),(0,esm.kt)("p",null,(0,esm.kt)("strong",{parentName:"p"},"Font:")," Unica77 (",(0,esm.kt)("inlineCode",{parentName:"p"},"font-family: 'SoSans';"),")"),(0,esm.kt)("p",null,(0,esm.kt)("strong",{parentName:"p"},"Weights:")," 400(regular), 500(medium), 700(bold)"),(0,esm.kt)(DocTypographyList,{items:typeScale,mdxType:"DocTypographyList"}))}MDXContent.displayName="MDXContent",MDXContent.isMDXComponent=!0;var __page=function __page(){throw new Error("Docs-only story")};__page.parameters={docsOnly:!0};var componentMeta={title:"Foundations/Typography",includeStories:["__page"]},mdxStoryNameToKey={};componentMeta.parameters=componentMeta.parameters||{},componentMeta.parameters.docs=Object.assign({},componentMeta.parameters.docs||{},{page:function page(){return(0,esm.kt)(blocks.AddContext,{mdxStoryNameToKey,mdxComponentAnnotations:componentMeta},(0,esm.kt)(MDXContent,null))}});const Typography_stories=componentMeta;var __namedExportsOrder=["typeScale","__page"]},"../node_modules/classnames/index.js":(module,exports)=>{var __WEBPACK_AMD_DEFINE_RESULT__;!function(){"use strict";var hasOwn={}.hasOwnProperty;function classNames(){for(var classes=[],i=0;i<arguments.length;i++){var arg=arguments[i];if(arg){var argType=typeof arg;if("string"===argType||"number"===argType)classes.push(arg);else if(Array.isArray(arg)){if(arg.length){var inner=classNames.apply(null,arg);inner&&classes.push(inner)}}else if("object"===argType){if(arg.toString!==Object.prototype.toString&&!arg.toString.toString().includes("[native code]")){classes.push(arg.toString());continue}for(var key in arg)hasOwn.call(arg,key)&&arg[key]&&classes.push(key)}}}return classes.join(" ")}module.exports?(classNames.default=classNames,module.exports=classNames):void 0===(__WEBPACK_AMD_DEFINE_RESULT__=function(){return classNames}.apply(exports,[]))||(module.exports=__WEBPACK_AMD_DEFINE_RESULT__)}()},"../node_modules/core-js/modules/es.array.index-of.js":(__unused_webpack_module,__unused_webpack_exports,__webpack_require__)=>{"use strict";var $=__webpack_require__("../node_modules/core-js/internals/export.js"),uncurryThis=__webpack_require__("../node_modules/core-js/internals/function-uncurry-this.js"),$indexOf=__webpack_require__("../node_modules/core-js/internals/array-includes.js").indexOf,arrayMethodIsStrict=__webpack_require__("../node_modules/core-js/internals/array-method-is-strict.js"),nativeIndexOf=uncurryThis([].indexOf),NEGATIVE_ZERO=!!nativeIndexOf&&1/nativeIndexOf([1],1,-0)<0,STRICT_METHOD=arrayMethodIsStrict("indexOf");$({target:"Array",proto:!0,forced:NEGATIVE_ZERO||!STRICT_METHOD},{indexOf:function indexOf(searchElement){var fromIndex=arguments.length>1?arguments[1]:void 0;return NEGATIVE_ZERO?nativeIndexOf(this,searchElement,fromIndex)||0:$indexOf(this,searchElement,fromIndex)}})},"../node_modules/react/cjs/react-jsx-runtime.production.min.js":(__unused_webpack_module,exports,__webpack_require__)=>{"use strict";var f=__webpack_require__("../node_modules/react/index.js"),k=Symbol.for("react.element"),l=Symbol.for("react.fragment"),m=Object.prototype.hasOwnProperty,n=f.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner,p={key:!0,ref:!0,__self:!0,__source:!0};function q(c,a,g){var b,d={},e=null,h=null;for(b in void 0!==g&&(e=""+g),void 0!==a.key&&(e=""+a.key),void 0!==a.ref&&(h=a.ref),a)m.call(a,b)&&!p.hasOwnProperty(b)&&(d[b]=a[b]);if(c&&c.defaultProps)for(b in a=c.defaultProps)void 0===d[b]&&(d[b]=a[b]);return{$$typeof:k,type:c,key:e,ref:h,props:d,_owner:n.current}}exports.Fragment=l,exports.jsx=q,exports.jsxs=q},"../node_modules/react/jsx-runtime.js":(module,__unused_webpack_exports,__webpack_require__)=>{"use strict";module.exports=__webpack_require__("../node_modules/react/cjs/react-jsx-runtime.production.min.js")}}]);
//# sourceMappingURL=foundations-Typography-stories-mdx.c39568e2.iframe.bundle.js.map