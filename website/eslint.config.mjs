import { config as smartiveConfig } from '@smartive/eslint-config';

const config = [
...smartiveConfig('react'),
{
rules: {
// Override Next.js React Compiler rules that are too strict for practical use
'react-hooks/set-state-in-effect': 'off',
'react-hooks/refs': 'off',
'react-hooks/static-components': 'off',
},
},
];

export default config;
