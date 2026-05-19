import * as ImagePicker from 'expo-image-picker';
import React from 'react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { DriverDeliveryScreen } from '../src/screens/Driver/DriverDeliveryScreen';
import { api } from '../src/services/api';

const navigation = { goBack: jest.fn(), navigate: jest.fn() };
const route = {
  params: {
    routeId: 'route-77',
    ponto: {
      id: 'delivery-1',
      nome: 'Cliente Teste',
      documento: '123.456.789-00',
    },
  },
};

const appendMock = jest.fn();
const OriginalFormData = global.FormData;

class MockFormData {
  append(name: string, value: unknown) {
    appendMock(name, value);
  }
}

jest.mock('expo-image-picker', () => ({
  requestCameraPermissionsAsync: jest.fn(async () => ({ status: 'granted' })),
  launchCameraAsync: jest.fn(async () => ({
    canceled: false,
    assets: [{ uri: 'file:///proof.jpg' }],
  })),
}), { virtual: true });

jest.mock('react-native-signature-canvas', () => {
  const React = require('react');
  const { TouchableOpacity, Text } = require('react-native');

  return {
    __esModule: true,
    default: ({ onOK }: { onOK: (value: string) => void }) => (
      <TouchableOpacity onPress={() => onOK('data:image/png;base64,signature')}>
        <Text>CAPTURAR ASSINATURA</Text>
      </TouchableOpacity>
    ),
  };
}, { virtual: true });

jest.mock('../src/components/layout/TopBar', () => {
  const React = require('react');
  const { Text } = require('react-native');

  return {
    TopBar: ({ title }: { title: string }) => <Text>{title}</Text>,
  };
});

jest.mock('../src/components/ui/Button', () => {
  const React = require('react');
  const { TouchableOpacity, Text } = require('react-native');

  return {
    Button: ({ label, onPress, disabled, loading }: any) => (
      <TouchableOpacity onPress={onPress} disabled={disabled || loading}>
        <Text>{label}</Text>
      </TouchableOpacity>
    ),
  };
});

describe('DriverDeliveryScreen proof upload', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
    appendMock.mockClear();
    global.FormData = MockFormData as any;
  });

  afterAll(() => {
    global.FormData = OriginalFormData;
  });

  it('posts multipart proof with required photo even when no signature was captured', async () => {
    (api.post as jest.Mock).mockResolvedValueOnce({});

    render(<DriverDeliveryScreen navigation={navigation} route={route} />);

    fireEvent.press(screen.getByText('Capturar Foto do Comprovante'));

    await waitFor(() => {
      expect(ImagePicker.requestCameraPermissionsAsync).toHaveBeenCalled();
      expect(ImagePicker.launchCameraAsync).toHaveBeenCalledWith({
        quality: 0.7,
        base64: true,
      });
      expect(screen.getByText('Refazer foto')).toBeTruthy();
    });

    fireEvent.press(screen.getByText('FINALIZAR ENTREGA'));
    await act(async () => {
      jest.runAllTimers();
    });

    await waitFor(() => {
      expect(api.post as jest.Mock).toHaveBeenCalledWith(
        '/api/v1/delivery-points/delivery-1/proof',
        expect.any(MockFormData),
        {
          headers: { 'Content-Type': 'multipart/form-data' },
        }
      );
    });

    expect(appendMock).toHaveBeenCalledWith('photo', {
      uri: 'file:///proof.jpg',
      name: 'comprovante.jpg',
      type: 'image/jpeg',
    });
    expect(appendMock.mock.calls.find(([name]) => name === 'signature')).toBeUndefined();
    expect(navigation.goBack).toHaveBeenCalledTimes(1);
    expect(navigation.navigate).not.toHaveBeenCalled();
  });

  it('includes the optional signature part when the driver captured one', async () => {
    (api.post as jest.Mock).mockResolvedValueOnce({});

    render(<DriverDeliveryScreen navigation={navigation} route={route} />);

    fireEvent.press(screen.getByText('Capturar Foto do Comprovante'));

    await waitFor(() => {
      expect(screen.getByText('Refazer foto')).toBeTruthy();
    });

    fireEvent.press(screen.getByText('CAPTURAR ASSINATURA'));

    await waitFor(() => {
      expect(screen.getByText('Assinatura capturada')).toBeTruthy();
    });

    fireEvent.press(screen.getByText('FINALIZAR ENTREGA'));
    await act(async () => {
      jest.runAllTimers();
    });

    await waitFor(() => {
      expect(api.post as jest.Mock).toHaveBeenCalledWith(
        '/api/v1/delivery-points/delivery-1/proof',
        expect.any(MockFormData),
        {
          headers: { 'Content-Type': 'multipart/form-data' },
        }
      );
    });

    expect(appendMock).toHaveBeenCalledWith('photo', {
      uri: 'file:///proof.jpg',
      name: 'comprovante.jpg',
      type: 'image/jpeg',
    });
    expect(appendMock).toHaveBeenCalledWith('signature', 'data:image/png;base64,signature');
    expect(navigation.goBack).toHaveBeenCalledTimes(1);
    expect(navigation.navigate).not.toHaveBeenCalled();
  });
});
