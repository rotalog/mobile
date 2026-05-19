import React from 'react';
import ReactTestRenderer, { act } from 'react-test-renderer';

jest.mock(
  '@react-native/new-app-screen',
  () => {
    const ReactNative = require('react-native');

    return {
      NewAppScreen: ({ templateFileName }: { templateFileName: string }) => (
        <ReactNative.Text>{`MockScreen:${templateFileName}`}</ReactNative.Text>
      ),
    };
  },
);

jest.mock(
  'react-native-safe-area-context',
  () => {
    return {
      SafeAreaProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
      useSafeAreaInsets: () => ({
        top: 1,
        right: 2,
        bottom: 3,
        left: 4,
      }),
    };
  },
);

import App from '../src/App';

describe('App bootstrap', () => {
  test('renders the React Native root app without crashing', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer | undefined;

    await act(async () => {
      renderer = ReactTestRenderer.create(<App />);
    });

    expect(renderer).toBeDefined();
    expect(renderer!.root.findByProps({ children: 'MockScreen:App.tsx' })).toBeTruthy();
  });
});
