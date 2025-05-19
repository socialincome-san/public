import { config as smartiveConfig } from '@smartive/eslint-config';

/** @type {import('eslint').Linter.Config[]} */
const config = [
  ...smartiveConfig('nextjs'),
  {
    rules: {
      'react/forbid-component-props': [
        'error',
        {
          forbid: [
            {
              propName: 'className',
              allowedForPatterns: ['Next*', '*Svg', 'Image', 'Radix*'],
              message: 'Avoid using className',
            },
          ],
        },
      ],
      'no-restricted-imports': [
        'error',
        {
          patterns: ['../*'],
        },
      ],
    },
  },
  { ignores: ['.eslintrc.js', '*.config.js'] },
];

export default config;
