module.exports = {
  root: true,
  extends: ['@react-native'],
  env: {
    jest: true,
  },
  rules: {
    '@typescript-eslint/no-unused-vars': 'off',
    'react-native/no-inline-styles': 'off',
    'react/no-unstable-nested-components': 'off',
  },
};
