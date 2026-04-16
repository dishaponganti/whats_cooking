const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Disable watchman to avoid EMFILE errors on macOS
config.watchFolders = [];
config.transformer = {
  ...config.transformer,
  getTransformOptions: () => ({
    transform: {
      experimentalImportSupport: false,
      inlineRequires: false,
    },
  }),
};

module.exports = config;
