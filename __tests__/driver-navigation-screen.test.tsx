import * as Location from 'expo-location';
import React from 'react';
import { Alert, Linking } from 'react-native';
import { act, fireEvent, render, screen, userEvent, waitFor } from '@testing-library/react-native';
import { DriverNavigationScreen } from '../src/screens/Driver/DriverNavigationScreen';
import { api } from '../src/services/api';

jest.mock('expo-location', () => ({
  Accuracy: { High: 'high' },
  requestForegroundPermissionsAsync: jest.fn(async () => ({ status: 'granted' })),
  getCurrentPositionAsync: jest.fn(async () => ({
    coords: { latitude: -3.101, longitude: -60.011 },
  })),
}));

const navigation = { goBack: jest.fn(), navigate: jest.fn() };
const route = {
  params: {
    ponto: {
      id: 'delivery-1',
      nome: 'Cliente Teste',
      endereco: 'Rua Exemplo, 123',
      volumes: '1 caixa',
      janela: 'Até 12:00',
      urgente: false,
      lat: -3.096,
      lng: -60.02,
    },
  },
};

const flushPendingTimers = async () => {
  await act(async () => {
    jest.runOnlyPendingTimers();
  });
};

describe('DriverNavigationScreen arrive flow', () => {
  it('sends driver latitude and longitude in the arrive request body during check-in', async () => {
    jest.useFakeTimers();

    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    const alertSpy = jest.spyOn(Alert, 'alert');
    (api.put as unknown as jest.Mock).mockResolvedValueOnce({});

    render(<DriverNavigationScreen navigation={navigation} route={route} />);

    await user.press(screen.getByText('FAZER CHECK-IN'));
    await flushPendingTimers();

    await waitFor(() => {
      expect(Location.requestForegroundPermissionsAsync).toHaveBeenCalled();
      expect(Location.getCurrentPositionAsync).toHaveBeenCalledWith({
        accuracy: Location.Accuracy.High,
      });
      expect((api.put as unknown as jest.Mock)).toHaveBeenCalledWith(
        '/api/v1/delivery-points/delivery-1/arrive',
        {
          driverLatitude: -3.101,
          driverLongitude: -60.011,
        }
      );
    });

    expect(screen.getByText('✓ CHECK-IN REALIZADO')).toBeOnTheScreen();
    expect(alertSpy).not.toHaveBeenCalled();
  });

  it('keeps the driver unchecked and shows visible feedback when the arrive request fails', async () => {
    jest.useFakeTimers();

    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    const alertSpy = jest.spyOn(Alert, 'alert');
    (api.put as unknown as jest.Mock).mockRejectedValueOnce(new Error('arrive failed'));

    render(<DriverNavigationScreen navigation={navigation} route={route} />);

    await user.press(screen.getByText('FAZER CHECK-IN'));
    await flushPendingTimers();

    await waitFor(() => {
      expect((api.put as unknown as jest.Mock)).toHaveBeenCalledWith(
        '/api/v1/delivery-points/delivery-1/arrive',
        {
          driverLatitude: -3.101,
          driverLongitude: -60.011,
        }
      );
      expect(alertSpy).toHaveBeenCalledWith(
        'Erro',
        'Não foi possível registrar sua chegada. Tente novamente.'
      );
    });

    expect(screen.getByText('FAZER CHECK-IN')).toBeOnTheScreen();
    expect(screen.queryByText('✓ CHECK-IN REALIZADO')).not.toBeOnTheScreen();
    expect(screen.queryByText('Check-in realizado! Prossiga com a entrega.')).not.toBeOnTheScreen();
  });

  it('prevents duplicate arrive submissions while the first check-in is still pending', async () => {
    jest.useFakeTimers();

    let resolveArrive: ((value: unknown) => void) | undefined;
    (api.put as unknown as jest.Mock).mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveArrive = resolve;
        })
    );

    render(<DriverNavigationScreen navigation={navigation} route={route} />);

    const checkInButton = screen.getByText('FAZER CHECK-IN');

    fireEvent.press(checkInButton);
    fireEvent.press(checkInButton);

    await waitFor(() => {
      expect(Location.requestForegroundPermissionsAsync).toHaveBeenCalledTimes(1);
      expect(Location.getCurrentPositionAsync).toHaveBeenCalledTimes(1);
      expect((api.put as unknown as jest.Mock)).toHaveBeenCalledTimes(1);
    });

    expect(screen.queryByText('✓ CHECK-IN REALIZADO')).not.toBeOnTheScreen();

    await act(async () => {
      resolveArrive?.({});
    });
    await flushPendingTimers();

    expect(screen.getByText('✓ CHECK-IN REALIZADO')).toBeOnTheScreen();
  });

  it('uses destination coordinates instead of placeholder address text when opening external navigation apps', async () => {
    const openUrlSpy = jest.spyOn(Linking, 'openURL').mockResolvedValueOnce(true).mockResolvedValueOnce(true);

    render(
      <DriverNavigationScreen
        navigation={navigation}
        route={{
          params: {
            ponto: {
              id: 'delivery-2',
              nome: 'Cliente sem endereço real',
              endereco: 'Endereço não disponível',
              lat: -3.25,
              lng: -60.12,
            },
          },
        }}
      />
    );

    fireEvent.press(screen.getByText('Google Maps'));
    fireEvent.press(screen.getByText('Waze'));

    expect(openUrlSpy).toHaveBeenNthCalledWith(
      1,
      'https://www.google.com/maps/dir/?api=1&destination=-3.25,-60.12'
    );
    expect(openUrlSpy).toHaveBeenNthCalledWith(
      2,
      'https://waze.com/ul?ll=-3.25,-60.12&navigate=yes'
    );
  });

  it('starts with check-in completed when the incoming point is already arrived', () => {
    render(
      <DriverNavigationScreen
        navigation={navigation}
        route={{
          params: {
            ponto: {
              ...route.params.ponto,
              status: 'ARRIVED',
            },
          },
        }}
      />
    );

    expect(screen.getByText('✓ CHECK-IN REALIZADO')).toBeOnTheScreen();
    expect(screen.getByText('Check-in realizado! Prossiga com a entrega.')).toBeOnTheScreen();
    expect(screen.getByText('CONFIRMAR ENTREGA')).toBeOnTheScreen();
    expect(screen.getByText('REGISTRAR PROBLEMA')).toBeOnTheScreen();
    expect((api.put as unknown as jest.Mock)).not.toHaveBeenCalled();
  });
});
