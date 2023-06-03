import type { StorybookViteConfig } from '@storybook/builder-vite';
import { mergeConfig } from 'vite';
const config: StorybookViteConfig = {
  stories: ['../src/**/*.stories.mdx', '../src/**/*.stories.@(js|jsx|ts|tsx)'],
  staticDirs: ['../public'],
  addons: ['@storybook/addon-links', '@storybook/addon-essentials',
  // '@storybook/preset-create-react-app',
  '@storybook/addon-interactions', {
    name: '@storybook/addon-postcss',
    options: {
      cssLoaderOptions: {
        // When you have splitted your css over multiple files
        // and use @import('./other-styles.css')
        importLoaders: 1
      },
      postcssLoaderOptions: {
        // When using postCSS 8
        implementation: require('postcss')
      }
    }
  }, '@storybook/addon-mdx-gfm'],
  typescript: {
    check: false,
    checkOptions: {},
    reactDocgen: 'react-docgen-typescript',
    reactDocgenTypescriptOptions: {
      shouldExtractLiteralValuesFromEnum: true,
      propFilter: prop => prop.parent ? !/node_modules/.test(prop.parent.fileName) : true
    }
  },
  framework: {
    name: '@storybook/react-vite',
    options: {}
  },
  features: {
    storyStoreV7: true
  },
  async viteFinal(config) {
    const storybookPathPrefix = process.env.STORYBOOK_PATH_PREFIX;
    let configOverwrite: typeof config = {};

    // Required for subfolder deployments on GitHub pages.
    if (storybookPathPrefix) {
      console.log(`STORYBOOK_PATH_PREFIX set to ${storybookPathPrefix}`);
      configOverwrite = {
        ...configOverwrite,
        base: storybookPathPrefix
      };
    }
    return mergeConfig(config, configOverwrite);
  },
  docs: {
    autodocs: true
  }
};
module.exports = config;