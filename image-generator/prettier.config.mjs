import smartiveConfig from '@smartive/prettier-config' with { type: 'json' };
import sharedConfig from '../design-system/prettier.config.cjs';

const config = { ...smartiveConfig, ...sharedConfig };

export default config;
