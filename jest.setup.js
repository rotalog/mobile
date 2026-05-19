jest.mock('react-native-gesture-handler', () => ({}));

jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: {
    getItem: jest.fn(() => Promise.resolve(null)),
    setItem: jest.fn(() => Promise.resolve()),
    removeItem: jest.fn(() => Promise.resolve()),
  },
}));

jest.mock('react-native-maps', () => {
  const React = require('react');
  const { View } = require('react-native');

  const MapView = ({ children, ...props }) => <View {...props}>{children}</View>;
  MapView.Marker = ({ children, ...props }) => <View {...props}>{children}</View>;
  MapView.Polyline = props => <View {...props} />;

  return {
    __esModule: true,
    default: MapView,
    Marker: MapView.Marker,
    Polyline: MapView.Polyline,
  };
});

jest.mock('react-native-signature-canvas', () => {
  const React = require('react');
  const { View } = require('react-native');
  return props => <View {...props} />;
});
