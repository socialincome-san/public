const { $schema, ...config } = require('@smartive/prettier-config');

module.exports = {
  plugins: ['prettier-plugin-tailwindcss'],
  ...config,
  tailwindStylesheet: './src/styles/globals.css',
};
