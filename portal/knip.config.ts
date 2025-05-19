import type { KnipConfig } from 'knip';
const config: KnipConfig = {
  entry: ['src', 'src/app/api/**'],
  ignore: ['**/graphql/generated.ts', ''],
  ignoreDependencies: ['tailwindcss'], // Ignore tailwindcss because knip doesn't recognize v4 yet
};
export default config;
