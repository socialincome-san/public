(window.webpackJsonp=window.webpackJsonp||[]).push([[3],{"./src/components/combobox/Combobox.stories.tsx":function(module,__webpack_exports__,__webpack_require__){"use strict";__webpack_require__.r(__webpack_exports__),__webpack_require__.d(__webpack_exports__,"Standard",(function(){return Standard})),__webpack_require__.d(__webpack_exports__,"WithImages",(function(){return WithImages}));__webpack_require__("../node_modules/core-js/modules/es.object.assign.js"),__webpack_require__("../node_modules/core-js/modules/es.function.bind.js"),__webpack_require__("../node_modules/core-js/modules/es.array.is-array.js"),__webpack_require__("../node_modules/core-js/modules/es.symbol.js"),__webpack_require__("../node_modules/core-js/modules/es.symbol.description.js"),__webpack_require__("../node_modules/core-js/modules/es.object.to-string.js"),__webpack_require__("../node_modules/core-js/modules/es.symbol.iterator.js"),__webpack_require__("../node_modules/core-js/modules/es.string.iterator.js"),__webpack_require__("../node_modules/core-js/modules/es.array.iterator.js"),__webpack_require__("../node_modules/core-js/modules/web.dom-collections.iterator.js"),__webpack_require__("../node_modules/core-js/modules/es.array.slice.js"),__webpack_require__("../node_modules/core-js/modules/es.function.name.js"),__webpack_require__("../node_modules/core-js/modules/es.array.from.js");var react=__webpack_require__("../node_modules/react/index.js"),combobox=(__webpack_require__("../node_modules/core-js/modules/es.object.keys.js"),__webpack_require__("../node_modules/core-js/modules/es.array.index-of.js"),__webpack_require__("../node_modules/core-js/modules/es.array.filter.js"),__webpack_require__("../node_modules/core-js/modules/es.array.includes.js"),__webpack_require__("../node_modules/core-js/modules/es.string.includes.js"),__webpack_require__("../node_modules/core-js/modules/es.array.map.js"),__webpack_require__("../node_modules/@headlessui/react/dist/components/combobox/combobox.js")),transition=__webpack_require__("../node_modules/@headlessui/react/dist/components/transitions/transition.js"),ChevronDownIcon=__webpack_require__("../node_modules/@heroicons/react/24/solid/esm/ChevronDownIcon.js"),CheckIcon=__webpack_require__("../node_modules/@heroicons/react/24/solid/esm/CheckIcon.js"),classnames=__webpack_require__("../node_modules/classnames/index.js"),classnames_default=__webpack_require__.n(classnames),jsx_runtime=__webpack_require__("../node_modules/react/jsx-runtime.js"),_excluded=["label","options","name","size","value","openOnFocus","block","labelHidden"];function _slicedToArray(arr,i){return function _arrayWithHoles(arr){if(Array.isArray(arr))return arr}(arr)||function _iterableToArrayLimit(arr,i){var _i=null==arr?null:"undefined"!=typeof Symbol&&arr[Symbol.iterator]||arr["@@iterator"];if(null!=_i){var _s,_e,_x,_r,_arr=[],_n=!0,_d=!1;try{if(_x=(_i=_i.call(arr)).next,0===i){if(Object(_i)!==_i)return;_n=!1}else for(;!(_n=(_s=_x.call(_i)).done)&&(_arr.push(_s.value),_arr.length!==i);_n=!0);}catch(err){_d=!0,_e=err}finally{try{if(!_n&&null!=_i.return&&(_r=_i.return(),Object(_r)!==_r))return}finally{if(_d)throw _e}}return _arr}}(arr,i)||function _unsupportedIterableToArray(o,minLen){if(!o)return;if("string"==typeof o)return _arrayLikeToArray(o,minLen);var n=Object.prototype.toString.call(o).slice(8,-1);"Object"===n&&o.constructor&&(n=o.constructor.name);if("Map"===n||"Set"===n)return Array.from(o);if("Arguments"===n||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n))return _arrayLikeToArray(o,minLen)}(arr,i)||function _nonIterableRest(){throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}()}function _arrayLikeToArray(arr,len){(null==len||len>arr.length)&&(len=arr.length);for(var i=0,arr2=new Array(len);i<len;i++)arr2[i]=arr[i];return arr2}function _objectWithoutProperties(source,excluded){if(null==source)return{};var key,i,target=function _objectWithoutPropertiesLoose(source,excluded){if(null==source)return{};var key,i,target={},sourceKeys=Object.keys(source);for(i=0;i<sourceKeys.length;i++)key=sourceKeys[i],excluded.indexOf(key)>=0||(target[key]=source[key]);return target}(source,excluded);if(Object.getOwnPropertySymbols){var sourceSymbolKeys=Object.getOwnPropertySymbols(source);for(i=0;i<sourceSymbolKeys.length;i++)key=sourceSymbolKeys[i],excluded.indexOf(key)>=0||Object.prototype.propertyIsEnumerable.call(source,key)&&(target[key]=source[key])}return target}var Combobox_SoCombobox=function SoCombobox(_ref){var label=_ref.label,options=_ref.options,_ref$size=(_ref.name,_ref.size),size=void 0===_ref$size?"base":_ref$size,_ref$value=_ref.value,value=void 0===_ref$value?options[0]:_ref$value,_ref$block=(_ref.openOnFocus,_ref.block),block=void 0!==_ref$block&&_ref$block,_ref$labelHidden=_ref.labelHidden,labelHidden=void 0!==_ref$labelHidden&&_ref$labelHidden,props=_objectWithoutProperties(_ref,_excluded),_useState2=_slicedToArray(Object(react.useState)(""),2),query=_useState2[0],setQuery=_useState2[1],filteredOptions=""===query?options:options.filter((function(option){return option.label.toLowerCase().includes(query.toLowerCase())})),inputChange=function inputChange(event){return setQuery(event.target.value)},inputDisplayValue=function inputDisplayValue(option){return(null==option?void 0:option.label)||value.label};return Object(jsx_runtime.jsx)(combobox.a,Object.assign({},props,{children:function children(_ref2){var open=_ref2.open;return Object(jsx_runtime.jsxs)(jsx_runtime.Fragment,{children:[Object(jsx_runtime.jsx)(combobox.a.Label,{className:classnames_default()("block","font-medium","text-gray-700","mb-1",{"sr-only":labelHidden}),children:label}),Object(jsx_runtime.jsxs)("div",{className:classnames_default()("relative","cursor-default","rounded-lg","border","inline-flex","items-center","border-gray-300","bg-white","text-left","transition","hover:shadow-lg","hover:shadow-gray-200","text-"+size,{"w-full":block}),children:[(null==value?void 0:value.image)&&Object(jsx_runtime.jsx)("img",{src:value.image.src,alt:"",className:"ml-3 h-6 w-6 flex-shrink-0 rounded-full object-cover"}),Object(jsx_runtime.jsx)(combobox.a.Input,{className:classnames_default()("border-none","p-3","pl-3","pr-10","bg-transparent","text-gray-900","focus:ring-0","text-"+size,{"w-full":block}),displayValue:inputDisplayValue,onChange:inputChange}),Object(jsx_runtime.jsx)(combobox.a.Button,{className:"absolute inset-y-0 right-0 flex items-center pr-2",children:Object(jsx_runtime.jsx)(ChevronDownIcon.a,{className:"h-5 w-5 text-gray-400","aria-hidden":"true"})})]}),Object(jsx_runtime.jsx)(transition.a,{show:open,as:react.Fragment,leave:"transition ease-in duration-100",leaveFrom:"opacity-100",leaveTo:"opacity-0",afterLeave:function afterLeave(){return setQuery("")},children:Object(jsx_runtime.jsx)(combobox.a.Options,{static:!0,className:classnames_default()("absolute","z-10","mt-1","max-h-56","overflow-auto","rounded-lg","bg-white","py-1","shadow-lg","ring-1","ring-black","ring-opacity-5","focus:outline-none","text-"+size,{"w-full":block}),children:0===filteredOptions.length&&""!==query?Object(jsx_runtime.jsx)("div",{className:"relative cursor-default select-none py-2 px-4 text-gray-700",children:"Nothing found."}):filteredOptions.map((function(option){return Object(jsx_runtime.jsx)(combobox.a.Option,{className:function className(_ref3){var active=_ref3.active;return classnames_default()(active?"text-white bg-so-color-accent-2-primary-500":"text-gray-900","relative cursor-default select-none py-2 pl-3 pr-12")},value:option,children:function children(_ref4){var selected=_ref4.selected,active=_ref4.active;return Object(jsx_runtime.jsxs)(jsx_runtime.Fragment,{children:[Object(jsx_runtime.jsxs)("div",{className:"flex items-center",children:[(null==option?void 0:option.image)&&Object(jsx_runtime.jsx)("img",{src:option.image.src,alt:"",className:"h-6 w-6 flex-shrink-0 rounded-full object-cover"}),Object(jsx_runtime.jsx)("span",{className:classnames_default()(active?"font-semibold":"font-normal","truncate",{"ml-3":value.image}),children:option.label})]}),selected&&Object(jsx_runtime.jsx)("span",{className:classnames_default()("absolute inset-y-0 right-0 flex items-center pr-4"),children:Object(jsx_runtime.jsx)(CheckIcon.a,{className:"h-5 w-5","aria-hidden":"true"})})]})}},option.label)}))})})]})}}))};Combobox_SoCombobox.displayName="SoCombobox";try{Combobox_SoCombobox.displayName="SoCombobox",Combobox_SoCombobox.__docgenInfo={description:"Comboboxes are the foundation of accessible autocompletes and command palettes, complete with robust support for keyboard navigation.\nUse the `SoCombobox` instead of the `SoSelect` whenever you have more than only a couple of options. The Combobox allows a more fine\ngrained search over all options compared to the select.",displayName:"SoCombobox",props:{label:{defaultValue:null,description:"The select's label elements",name:"label",required:!0,type:{name:"string"}},options:{defaultValue:null,description:"Options available for selection",name:"options",required:!0,type:{name:"SoComboboxItem[]"}},value:{defaultValue:{value:"options[0]"},description:"The selected/current value",name:"value",required:!1,type:{name:"SoComboboxItem"}},onChange:{defaultValue:null,description:"Emits the selected value on change",name:"onChange",required:!1,type:{name:"(value: SoComboboxItem) => void"}},openOnFocus:{defaultValue:{value:"true"},description:"If true, the options get visible when the user focuses the text field",name:"openOnFocus",required:!1,type:{name:"boolean"}},block:{defaultValue:{value:"false"},description:"Render full width",name:"block",required:!1,type:{name:"boolean"}},labelHidden:{defaultValue:{value:"false"},description:"If true, the label is visually hidden. It will still be available to screenreaders.",name:"labelHidden",required:!1,type:{name:"boolean"}},size:{defaultValue:{value:"base"},description:"Visual size of the button",name:"size",required:!1,type:{name:"enum",value:[{value:'"base"'},{value:'"xl"'}]}},name:{defaultValue:null,description:"",name:"name",required:!1,type:{name:"string"}},disabled:{defaultValue:null,description:"",name:"disabled",required:!1,type:{name:"boolean"}}}},"undefined"!=typeof STORYBOOK_REACT_CLASSES&&(STORYBOOK_REACT_CLASSES["src/components/combobox/Combobox.tsx#SoCombobox"]={docgenInfo:Combobox_SoCombobox.__docgenInfo,name:"SoCombobox",path:"src/components/combobox/Combobox.tsx#SoCombobox"})}catch(__react_docgen_typescript_loader_error){}function Combobox_stories_slicedToArray(arr,i){return function Combobox_stories_arrayWithHoles(arr){if(Array.isArray(arr))return arr}(arr)||function Combobox_stories_iterableToArrayLimit(arr,i){var _i=null==arr?null:"undefined"!=typeof Symbol&&arr[Symbol.iterator]||arr["@@iterator"];if(null!=_i){var _s,_e,_x,_r,_arr=[],_n=!0,_d=!1;try{if(_x=(_i=_i.call(arr)).next,0===i){if(Object(_i)!==_i)return;_n=!1}else for(;!(_n=(_s=_x.call(_i)).done)&&(_arr.push(_s.value),_arr.length!==i);_n=!0);}catch(err){_d=!0,_e=err}finally{try{if(!_n&&null!=_i.return&&(_r=_i.return(),Object(_r)!==_r))return}finally{if(_d)throw _e}}return _arr}}(arr,i)||function Combobox_stories_unsupportedIterableToArray(o,minLen){if(!o)return;if("string"==typeof o)return Combobox_stories_arrayLikeToArray(o,minLen);var n=Object.prototype.toString.call(o).slice(8,-1);"Object"===n&&o.constructor&&(n=o.constructor.name);if("Map"===n||"Set"===n)return Array.from(o);if("Arguments"===n||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n))return Combobox_stories_arrayLikeToArray(o,minLen)}(arr,i)||function Combobox_stories_nonIterableRest(){throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}()}function Combobox_stories_arrayLikeToArray(arr,len){(null==len||len>arr.length)&&(len=arr.length);for(var i=0,arr2=new Array(len);i<len;i++)arr2[i]=arr[i];return arr2}__webpack_exports__.default={component:Combobox_SoCombobox,argTypes:{block:{defaultValue:!1,description:"If true, the control will be rendered with 100% width",control:{type:"boolean"}},labelHidden:{defaultValue:!1,description:"If true, the label is only available to screenreaders, but visually hidden.",control:{type:"boolean"}},size:{defaultValue:"base",options:["base","xl"],control:{type:"select"}}}};var Combobox_stories_Template=function Template(args){var options=(null==args?void 0:args.options)||[{label:"Option 1"},{label:"Option 2"},{label:"Option 3"}],_useState2=Combobox_stories_slicedToArray(Object(react.useState)(options[0]),2),value=_useState2[0],setValue=_useState2[1],props=Object.assign({label:"Select Label",value:value,options:options},args,{onChange:function onChange(selectedItem){setValue(selectedItem)}});return Object(jsx_runtime.jsx)(Combobox_SoCombobox,Object.assign({},props))};Combobox_stories_Template.displayName="Template";var Standard=Combobox_stories_Template.bind({}),WithImages=Combobox_stories_Template.bind({});WithImages.args={label:"Country Selector Example",options:[{label:"Option 1",image:{src:"ch.svg"}},{label:"Option 2",image:{src:"ch.svg"}},{label:"Option 3",image:{src:"ch.svg"}}]},Standard.parameters=Object.assign({storySource:{source:"(args: Partial<SoComboboxProps>) => {\n\tconst options: SoComboboxProps['options'] = args?.options || [\n\t\t{\n\t\t\tlabel: 'Option 1',\n\t\t},\n\t\t{\n\t\t\tlabel: 'Option 2',\n\t\t},\n\t\t{\n\t\t\tlabel: 'Option 3',\n\t\t},\n\t];\n\n\tconst [value, setValue] = useState(options[0]);\n\n\tconst props: SoComboboxProps = {\n\t\tlabel: 'Select Label',\n\t\tvalue,\n\t\toptions,\n\t\t...args,\n\t\tonChange: (selectedItem) => {\n\t\t\tsetValue(selectedItem);\n\t\t},\n\t};\n\n\treturn <SoCombobox {...props} />;\n}"}},Standard.parameters),WithImages.parameters=Object.assign({storySource:{source:"(args: Partial<SoComboboxProps>) => {\n\tconst options: SoComboboxProps['options'] = args?.options || [\n\t\t{\n\t\t\tlabel: 'Option 1',\n\t\t},\n\t\t{\n\t\t\tlabel: 'Option 2',\n\t\t},\n\t\t{\n\t\t\tlabel: 'Option 3',\n\t\t},\n\t];\n\n\tconst [value, setValue] = useState(options[0]);\n\n\tconst props: SoComboboxProps = {\n\t\tlabel: 'Select Label',\n\t\tvalue,\n\t\toptions,\n\t\t...args,\n\t\tonChange: (selectedItem) => {\n\t\t\tsetValue(selectedItem);\n\t\t},\n\t};\n\n\treturn <SoCombobox {...props} />;\n}"}},WithImages.parameters)}}]);