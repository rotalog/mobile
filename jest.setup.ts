import AsyncStorage from '@react-native-async-storage/async-storage';
import { afterEach, jest } from '@jest/globals';
import type { ReactNode } from 'react';

type MockInsets = { top: number; right: number; bottom: number; left: number };

const mockApiError = (method: string, ...args: unknown[]) => {
  const [url] = args;
  const path = typeof url === 'string' ? url : '[unknown URL]';

  return Promise.reject(new Error(`Unexpected API call in test: ${method} ${path}`));
};

const mockApi = {
  get: jest.fn((...args: unknown[]) => mockApiError('GET', ...args)),
  post: jest.fn((...args: unknown[]) => mockApiError('POST', ...args)),
  put: jest.fn((...args: unknown[]) => mockApiError('PUT', ...args)),
  patch: jest.fn((...args: unknown[]) => mockApiError('PATCH', ...args)),
  delete: jest.fn((...args: unknown[]) => mockApiError('DELETE', ...args)),
  request: jest.fn((...args: unknown[]) => mockApiError('REQUEST', ...args)),
  interceptors: {
    request: { use: jest.fn(), eject: jest.fn() },
    response: { use: jest.fn(), eject: jest.fn() },
  },
};

const resetApiMock = () => {
  mockApi.get.mockReset().mockImplementation((...args: unknown[]) => mockApiError('GET', ...args));
  mockApi.post.mockReset().mockImplementation((...args: unknown[]) => mockApiError('POST', ...args));
  mockApi.put.mockReset().mockImplementation((...args: unknown[]) => mockApiError('PUT', ...args));
  mockApi.patch.mockReset().mockImplementation((...args: unknown[]) => mockApiError('PATCH', ...args));
  mockApi.delete.mockReset().mockImplementation((...args: unknown[]) => mockApiError('DELETE', ...args));
  mockApi.request.mockReset().mockImplementation((...args: unknown[]) => mockApiError('REQUEST', ...args));
  mockApi.interceptors.request.use.mockClear();
  mockApi.interceptors.request.eject.mockClear();
  mockApi.interceptors.response.use.mockClear();
  mockApi.interceptors.response.eject.mockClear();
};

jest.mock('./src/services/api', () => ({
  __esModule: true,
  BASE_URL: 'http://test.invalid',
  api: mockApi,
}));

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

jest.mock('react-native-safe-area-context', () => ({
  SafeAreaProvider: ({ children }: { children?: ReactNode }) => children ?? null,
  SafeAreaConsumer: ({ children }: { children: (insets: MockInsets) => ReactNode }) =>
    children({ top: 0, right: 0, bottom: 0, left: 0 }),
  useSafeAreaInsets: (): MockInsets => ({ top: 0, right: 0, bottom: 0, left: 0 }),
}));

jest.mock('react-native-maps', () => {
  const React = require('react');
  const { View } = require('react-native');

  const buildTestId = (prefix: string, value?: unknown) => {
    if (value == null) {
      return prefix;
    }

    const normalized = String(value)
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    return normalized ? `${prefix}-${normalized}` : prefix;
  };

  const mockMapView = ({
    children,
    testID = 'mock-map-view',
    ...props
  }: {
    children?: ReactNode;
    testID?: string;
    [key: string]: unknown;
  }) => React.createElement(View, { ...props, testID }, children);

  const mockMarker = ({
    children,
    testID,
    identifier,
    title,
    ...props
  }: {
    children?: ReactNode;
    testID?: string;
    identifier?: string;
    title?: string;
    [key: string]: unknown;
  }) =>
    React.createElement(
      View,
      { ...props, testID: testID ?? buildTestId('mock-map-marker', identifier ?? title) },
      children
    );

  const mockPolyline = ({
    children,
    testID = 'mock-map-polyline',
    ...props
  }: {
    children?: ReactNode;
    testID?: string;
    [key: string]: unknown;
  }) => React.createElement(View, { ...props, testID }, children);

  return {
    __esModule: true,
    default: mockMapView,
    Marker: mockMarker,
    Polyline: mockPolyline,
  };
});

afterEach(async () => {
  await AsyncStorage.clear();
  jest.restoreAllMocks();
  jest.clearAllMocks();
  jest.useRealTimers();
  resetApiMock();
});
