import smartive from '@smartive/eslint-config';

const { config: smartiveConfig } = smartive;

/** @type {import('eslint').Linter.Config[]} */
const config = [
  ...smartiveConfig('nextjs', {
    parserOptions: {
      project: './tsconfig.json',
    },
  }),
];

export default config;
