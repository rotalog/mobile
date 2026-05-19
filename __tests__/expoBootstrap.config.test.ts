import fs from 'fs';
import path from 'path';

const rootDir = path.resolve(__dirname, '..');

const readJson = (relativePath: string) =>
  JSON.parse(fs.readFileSync(path.join(rootDir, relativePath), 'utf8'));

const loadBabelConfig = () => {
  const babelModule = require('../babel.config.js');
  const api = { cache: jest.fn() };
  const config = typeof babelModule === 'function' ? babelModule(api) : babelModule;

  return { api, config };
};

describe('Expo bootstrap configuration', () => {
  test('uses Expo app entry and Expo runtime scripts while preserving test and lint scripts', () => {
    const packageJson = readJson('package.json');

    expect(packageJson.main).toBe('expo/AppEntry.js');
    expect(packageJson.scripts).toEqual(
      expect.objectContaining({
        start: 'expo start',
        android: 'expo start --android',
        ios: 'expo start --ios',
        web: 'expo start --web',
      }),
    );
    expect(packageJson.scripts.test).toBeDefined();
    expect(packageJson.scripts.lint).toBeDefined();
  });

  test('uses the Expo Babel preset and the Reanimated plugin', () => {
    const { api, config } = loadBabelConfig();

    expect(api.cache).toHaveBeenCalledWith(true);
    expect(config.presets).toContain('babel-preset-expo');
    expect(config.plugins).toContain('react-native-reanimated/plugin');
  });

  test('uses the Expo TypeScript base config with strict mode and the @ alias', () => {
    const tsconfig = readJson('tsconfig.json');

    expect(tsconfig.extends).toBe('expo/tsconfig.base');
    expect(tsconfig.compilerOptions.strict).toBe(true);
    expect(tsconfig.compilerOptions.baseUrl).toBe('.');
    expect(tsconfig.compilerOptions.paths).toEqual(
      expect.objectContaining({
        '@/*': ['src/*'],
      }),
    );
  });
});
