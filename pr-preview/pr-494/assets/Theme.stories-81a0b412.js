import{j as t,a as o}from"./jsx-runtime-de33e161.js";import{R as S,r as u}from"./index-37ba2b57.js";import{d as R}from"./constants-fe73bc72.js";import{c as B}from"./clsx.m-1229b3e0.js";import{t as D}from"./tw-merge-1166cefb.js";import"./_commonjsHelpers-de833af9.js";const q=S.createContext({theme:"light",setTheme:()=>{}}),P=r=>{if(!r.current)return;const e=r.current.closest("[data-theme]");if(e)return e.getAttribute("data-theme")},T=S.forwardRef(({children:r,dataTheme:e,onChange:n,className:m,...a},l)=>{const s=u.useRef(l==null?void 0:l.current),i=P(s),[g,j]=u.useState(e||i||R),x=N=>{n&&n(N),j(N)};return u.useEffect(()=>{e!==g&&e&&x(e)},[e]),t(q.Provider,{value:{theme:g,setTheme:x},children:t("div",{...a,"data-theme":g,className:m,ref:s,children:r})})}),f=T;try{T.displayName="Theme",T.__docgenInfo={description:"",displayName:"Theme",props:{dataTheme:{defaultValue:null,description:"",name:"dataTheme",required:!1,type:{name:"string"}},onChange:{defaultValue:null,description:"",name:"onChange",required:!1,type:{name:"(theme: string) => void"}}}}}catch{}try{f.displayName="Theme",f.__docgenInfo={description:"",displayName:"Theme",props:{dataTheme:{defaultValue:null,description:"",name:"dataTheme",required:!1,type:{name:"string"}},onChange:{defaultValue:null,description:"",name:"onChange",required:!1,type:{name:"(theme: string) => void"}}}}}catch{}const b=({selected:r,children:e,dataTheme:n,className:m,...a})=>{const l=D(m,"border-base-content/20 hover:border-base-content/40 outline-base-content        overflow-hidden rounded-lg border outline-2 outline-offset-2",B({outline:r}));return t("div",{...a,"data-theme":n,className:l,children:t("div",{className:"bg-base-100 text-base-content w-full cursor-pointer font-sans",children:o("div",{className:"grid grid-cols-5 grid-rows-3",children:[t("div",{className:"bg-base-200 col-start-1 row-span-2 row-start-1"}),t("div",{className:"bg-base-300 col-start-1 row-start-3"}),o("div",{className:"bg-base-100 col-span-4 col-start-2 row-span-3 row-start-1 flex flex-col gap-1 p-2",children:[t("div",{className:"font-bold",children:n}),o("div",{className:"flex flex-wrap gap-1",children:[t("div",{className:"bg-primary flex aspect-square w-5 items-center justify-center rounded lg:w-6",children:t("div",{className:"text-primary-content text-sm font-bold",children:"A"})}),t("div",{className:"bg-secondary flex aspect-square w-5 items-center justify-center rounded lg:w-6",children:t("div",{className:"text-primary-content text-sm font-bold",children:"A"})}),t("div",{className:"bg-accent flex aspect-square w-5 items-center justify-center rounded lg:w-6",children:t("div",{className:"text-primary-content text-sm font-bold",children:"A"})}),t("div",{className:"bg-neutral flex aspect-square w-5 items-center justify-center rounded lg:w-6",children:t("div",{className:"text-primary-content text-sm font-bold",children:"A"})})]}),e&&t("div",{className:"my-2",children:e})]})]})})})},p=b;try{b.displayName="ThemeItem",b.__docgenInfo={description:"",displayName:"ThemeItem",props:{dataTheme:{defaultValue:null,description:"",name:"dataTheme",required:!0,type:{name:"string"}},selected:{defaultValue:null,description:"",name:"selected",required:!1,type:{name:"boolean"}}}}}catch{}const V=["light","dark","cupcake","bumblebee","emerald","corporate","synthwave","retro","cyberpunk","valentine","halloween","garden","forest","aqua","lofi","pastel","fantasy","wireframe","black","luxury","dracula","cmyk","autumn","business","acid","lemonade","night","coffee","winter"],y=r=>{const{theme:e,setTheme:n}=u.useContext(q);return u.useEffect(()=>{r&&e!==r&&n(r)},[r]),{theme:e,setTheme:n}},O={title:"Utils/Theme",component:f},c=r=>{const{theme:e,setTheme:n}=y();return o("div",{children:[o("h4",{className:"mb-4",children:["Current Theme: ",e]}),t("div",{className:"flex flex-wrap gap-4",children:V.map((m,a)=>t(p,{dataTheme:m,role:"button","aria-label":"Theme select","aria-pressed":m===e,selected:m===e,tabIndex:0,onClick:()=>{document.getElementsByTagName("html")[0].setAttribute("data-theme",m),window.localStorage.setItem("sb-react-daisyui-preview-theme",m),n(m)}},`theme_${m}_#${a}`))})]})};c.args={};const d=r=>{const{theme:e,setTheme:n}=y("corporate");return t("div",{className:"flex flex-wrap gap-4",children:t(p,{dataTheme:e,role:"button","aria-label":"Theme select",tabIndex:0})})};d.args={};const h=r=>{const{theme:e,setTheme:n}=y();return o("div",{children:[o("h4",{className:"mb-4",children:["Current Theme: ",e]}),t("div",{className:"flex flex-col gap-y-4",children:(a=>{const l=[];for(let s=0;s<a.length;s+=2)l.push(t(p,{dataTheme:a[s],role:"button","aria-label":"Theme select","aria-pressed":a[s]===e,selected:a[s]===e,tabIndex:0,onClick:i=>{i.stopPropagation(),document.getElementsByTagName("html")[0].setAttribute("data-theme",a[s]),window.localStorage.setItem("sb-react-daisyui-preview-theme",a[s]),n(a[s])},children:t(p,{dataTheme:a[s+1],role:"button","aria-label":"Theme select","aria-pressed":a[s+1]===e,selected:a[s+1]===e,tabIndex:0,onClick:i=>{i.stopPropagation(),document.getElementsByTagName("html")[0].setAttribute("data-theme",a[s+1]),window.localStorage.setItem("sb-react-daisyui-preview-theme",a[s+1]),n(a[s+1])}},`theme_${a[s+1]}_#${s+1}`)},`theme_${a[s]}_#${s}`));return t("div",{className:"flex flex-wrap gap-4",children:l})})(V)})]})};h.args={};var v,w,_;c.parameters={...c.parameters,docs:{...(v=c.parameters)==null?void 0:v.docs,source:{originalSource:`args => {
  const {
    theme,
    setTheme
  } = useTheme();
  return <div>
      <h4 className="mb-4">Current Theme: {theme}</h4>
      <div className="flex flex-wrap gap-4">
        {DEFAULT_THEMES.map((t, i) => <ThemeItem key={\`theme_\${t}_#\${i}\`} dataTheme={t} role="button" aria-label="Theme select" aria-pressed={t === theme} selected={t === theme} tabIndex={0} onClick={() => {
        document.getElementsByTagName('html')[0].setAttribute('data-theme', t);
        window.localStorage.setItem('sb-react-daisyui-preview-theme', t);
        setTheme(t);
      }} />)}
      </div>
    </div>;
}`,...(_=(w=c.parameters)==null?void 0:w.docs)==null?void 0:_.source}}};var I,E,C;d.parameters={...d.parameters,docs:{...(I=d.parameters)==null?void 0:I.docs,source:{originalSource:`args => {
  const {
    theme,
    setTheme
  } = useTheme('corporate');
  return <div className="flex flex-wrap gap-4">
      <ThemeItem dataTheme={theme} role="button" aria-label="Theme select" tabIndex={0} />
    </div>;
}`,...(C=(E=d.parameters)==null?void 0:E.docs)==null?void 0:C.source}}};var A,k,$;h.parameters={...h.parameters,docs:{...(A=h.parameters)==null?void 0:A.docs,source:{originalSource:`args => {
  const {
    theme,
    setTheme
  } = useTheme();
  const renderNestedThemes = (themes: readonly string[]) => {
    const nodes: React.ReactNode[] = [];
    for (let i = 0; i < themes.length; i += 2) {
      nodes.push(<ThemeItem key={\`theme_\${themes[i]}_#\${i}\`} dataTheme={themes[i]} role="button" aria-label="Theme select" aria-pressed={themes[i] === theme} selected={themes[i] === theme} tabIndex={0} onClick={e => {
        e.stopPropagation();
        document.getElementsByTagName('html')[0].setAttribute('data-theme', themes[i]);
        window.localStorage.setItem('sb-react-daisyui-preview-theme', themes[i]);
        setTheme(themes[i]);
      }}>
          <ThemeItem key={\`theme_\${themes[i + 1]}_#\${i + 1}\`} dataTheme={themes[i + 1]} role="button" aria-label="Theme select" aria-pressed={themes[i + 1] === theme} selected={themes[i + 1] === theme} tabIndex={0} onClick={e => {
          e.stopPropagation();
          document.getElementsByTagName('html')[0].setAttribute('data-theme', themes[i + 1]);
          window.localStorage.setItem('sb-react-daisyui-preview-theme', themes[i + 1]);
          setTheme(themes[i + 1]);
        }} />
        </ThemeItem>);
    }
    return <div className="flex flex-wrap gap-4">{nodes}</div>;
  };
  return <div>
      <h4 className="mb-4">Current Theme: {theme}</h4>
      <div className="flex flex-col gap-y-4">
        {renderNestedThemes(DEFAULT_THEMES)}
      </div>
    </div>;
}`,...($=(k=h.parameters)==null?void 0:k.docs)==null?void 0:$.source}}};const z=["Default","WithInitialValue","NestedThemes"];export{c as Default,h as NestedThemes,d as WithInitialValue,z as __namedExportsOrder,O as default};
//# sourceMappingURL=Theme.stories-81a0b412.js.map
