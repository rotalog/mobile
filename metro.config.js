const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (platform === 'web' && moduleName === 'react-native-maps') {
    return context.resolveRequest(
      context,
      path.resolve(__dirname, 'src/shims/react-native-maps.web.tsx'),
      platform
    );
  }

  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
