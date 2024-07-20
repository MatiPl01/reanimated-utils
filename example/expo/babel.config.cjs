/**
 * Don't edit this file directly if you don't have to.
 * Modify the babel config file in the project root directory.
 */
const path = require('path');

const rootDir = path.resolve(__dirname, '../..');
const appDir = path.resolve(__dirname, '../app');

module.exports = function (api) {
  api.cache(true);
  return {
    extends: path.join(rootDir, 'babel.config.cjs'),
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          root: ['./'],
          extensions: ['.ts', '.tsx', '.svg', '.json'],
          // This needs to be mirrored in ../app/tsconfig.json
          alias: {
            '@': path.join(appDir, 'src')
          }
        }
      ]
    ]
  };
};
