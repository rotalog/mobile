import React from 'react';
import { View, type ViewProps } from 'react-native';

type MapViewProps = ViewProps & {
  children?: React.ReactNode;
};

type MarkerProps = ViewProps & {
  children?: React.ReactNode;
};

type PolylineProps = ViewProps;

export function Marker({ children, ...props }: MarkerProps) {
  return <View {...props}>{children}</View>;
}

export function Polyline(props: PolylineProps) {
  return <View {...props} />;
}

export default function MapView({ children, ...props }: MapViewProps) {
  return <View {...props}>{children}</View>;
}
