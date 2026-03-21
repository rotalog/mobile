module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    ['module-resolver', {
      root: ['./src'],
      alias: {
        '@navigation': './src/navigation',
        '@contexts': './src/contexts',
        '@shared': './src/shared',
        '@buyer': './src/buyer',
        '@driver': './src/driver',
        '@hooks': './src/hooks',
      }
    }]
  ]
};