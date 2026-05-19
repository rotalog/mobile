import React from 'react';
import ReactTestRenderer, { act } from 'react-test-renderer';

jest.mock(
  'expo-status-bar',
  () => {
    const ReactNative = require('react-native');

    return {
      StatusBar: () => <ReactNative.Text>MockStatusBar</ReactNative.Text>,
    };
  },
  { virtual: true },
);

jest.mock(
  '../src/context/AuthContext',
  () => ({
    AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  }),
  { virtual: true },
);

jest.mock(
  '../src/context/CartContext',
  () => ({
    CartProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  }),
  { virtual: true },
);

jest.mock(
  '../src/navigation/AppNavigator',
  () => {
    const ReactNative = require('react-native');

    return {
      AppNavigator: () => <ReactNative.Text>MockNavigator</ReactNative.Text>,
    };
  },
  { virtual: true },
);

import App from '../App';

describe('App bootstrap', () => {
  test('renders the Expo root app without crashing', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer | undefined;

    await act(async () => {
      renderer = ReactTestRenderer.create(<App />);
    });

    expect(renderer).toBeDefined();
    expect(renderer!.root.findByProps({ children: 'MockStatusBar' })).toBeTruthy();
    expect(renderer!.root.findByProps({ children: 'MockNavigator' })).toBeTruthy();
  });
});
