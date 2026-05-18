const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules,
  'react-native-health': path.resolve(__dirname, 'src/mocks/health-stub.js'),
  'react-native-health-connect': path.resolve(__dirname, 'src/mocks/health-stub.js'),
};

module.exports = config;
