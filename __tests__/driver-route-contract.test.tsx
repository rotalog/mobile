import { Client } from '@stomp/stompjs';
import * as Location from 'expo-location';
import React from 'react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { DriverHistoryScreen } from '../src/screens/Driver/DriverHistoryScreen';
import { DriverRouteScreen } from '../src/screens/Driver/DriverRouteScreen';
import { DriverSummaryScreen } from '../src/screens/Driver/DriverSummaryScreen';
import { api } from '../src/services/api';

const mockStompClients: Array<{
  onConnect?: () => void;
  onDisconnect?: () => void;
  onStompError?: () => void;
  activate: jest.Mock;
  deactivate: jest.Mock;
  publish: jest.Mock;
}> = [];

jest.mock('expo-location', () => ({
  Accuracy: { High: 'high' },
  requestForegroundPermissionsAsync: jest.fn(async () => ({ status: 'granted' })),
  getCurrentPositionAsync: jest.fn(async () => ({
    coords: { latitude: -3.101, longitude: -60.011 },
  })),
}));

jest.mock('@stomp/stompjs', () => ({
  Client: jest.fn().mockImplementation(({ onConnect, onDisconnect, onStompError }: any) => {
    const client = {
      onConnect,
      onDisconnect,
      onStompError,
      activate: jest.fn(() => onConnect?.()),
      deactivate: jest.fn(() => onDisconnect?.()),
      publish: jest.fn(),
    };

    mockStompClients.push(client);
    return client;
  }),
}), { virtual: true });

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

describe('driver route backend contract wiring', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockStompClients.length = 0;
  });

  it('maps driver history from backend route fields and uses origin fallback only when missing', async () => {
    (api.get as jest.Mock).mockResolvedValueOnce({
      data: [
        {
          id: 'route-1',
          createdAt: '2026-05-17T10:30:00.000Z',
          origin: 'Manaus - Centro',
          totalPoints: 5,
          deliveredCount: 3,
          failedCount: 2,
          status: 'STARTED',
        },
        {
          id: 'route-2',
          createdAt: '2026-05-16T09:00:00.000Z',
          totalPoints: 2,
          deliveredCount: 2,
          failedCount: 0,
          status: 'COMPLETED',
        },
      ],
    });

    render(<DriverHistoryScreen navigation={{ goBack: jest.fn() }} />);

    await waitFor(() => {
      expect(api.get as jest.Mock).toHaveBeenCalledWith('/api/v1/routes', {
        params: { year: '2026' },
      });
    });

    expect(await screen.findByText('17 Mai 2026')).toBeTruthy();
    expect(screen.getByText('16 Mai 2026')).toBeTruthy();
    expect(screen.getByText('Manaus - Centro')).toBeTruthy();
    expect(screen.getByText('Origem não disponível')).toBeTruthy();
    expect(screen.getByText('Em andamento')).toBeTruthy();
    expect(screen.getByText('Concluída')).toBeTruthy();
  });

  it('shows an error state instead of mock routes when history loading fails', async () => {
    (api.get as jest.Mock).mockRejectedValueOnce(new Error('history unavailable'));

    render(<DriverHistoryScreen navigation={{ goBack: jest.fn() }} />);

    await waitFor(() => {
      expect(api.get as jest.Mock).toHaveBeenCalledWith('/api/v1/routes', {
        params: { year: '2026' },
      });
    });

    expect(await screen.findByText('Não foi possível carregar o histórico de rotas.')).toBeTruthy();
    expect(screen.queryByText('Manaus - Centro')).toBeNull();
    expect(screen.queryByText('Manaus - Zona Sul')).toBeNull();
  });

  it('prefers an in-progress backend route and advances to the first actionable point instead of a completed stop', async () => {
    const navigation = { navigate: jest.fn() };

    (api.get as jest.Mock)
      .mockResolvedValueOnce({
        data: [
          {
            id: 'route-1',
            totalPoints: 2,
            status: 'COMPLETED',
          },
          {
            id: 'route-2',
            totalPoints: 9,
            status: 'STARTED',
          },
        ],
      })
      .mockResolvedValueOnce({
        data: [
          {
            id: 'point-1',
            orderId: 'order-1',
            latitude: -3.101,
            longitude: -60.011,
            status: 'COMPLETED',
            geofenceRadiusMeters: 75,
            failureReason: null,
          },
          {
            id: 'point-2',
            orderId: 'order-2',
            latitude: -3.102,
            longitude: -60.012,
            status: 'ARRIVED',
          },
          {
            id: 'point-3',
            orderId: 'order-3',
            latitude: -3.103,
            longitude: -60.013,
            status: 'PENDING',
          },
        ],
      });

    render(<DriverRouteScreen navigation={navigation} />);

    await waitFor(() => {
      expect(api.get as jest.Mock).toHaveBeenNthCalledWith(1, '/api/v1/routes/today');
      expect(api.get as jest.Mock).toHaveBeenNthCalledWith(2, '/api/v1/routes/route-2/points');
    });

    expect(await screen.findByText('Parada 1')).toBeTruthy();
    expect(screen.getByText('Entregue')).toBeTruthy();
    expect(screen.getByText('IR PARA PRÓXIMA PARADA')).toBeTruthy();
    expect(screen.queryByText('INICIAR ROTA')).toBeNull();

    fireEvent.press(screen.getByText('IR PARA PRÓXIMA PARADA'));

    expect(navigation.navigate).toHaveBeenCalledWith('DriverNavigation', {
      ponto: expect.objectContaining({ id: 'point-2', routeId: 'route-2', lat: -3.102, lng: -60.012 }),
      index: 1,
      routeId: 'route-2',
    });
    expect(api.put as jest.Mock).not.toHaveBeenCalled();
  });

  it('does not render route progression CTA when the backend returns no valid mapped points', async () => {
    (api.get as jest.Mock)
      .mockResolvedValueOnce({
        data: [
          {
            id: 'route-3',
            totalPoints: 1,
            status: 'PLANNED',
          },
        ],
      })
      .mockResolvedValueOnce({
        data: [
          {
            id: 'point-2',
            orderId: 'order-2',
            status: 'PENDING',
            lat: -3.2,
            lng: -60.2,
          },
        ],
      });

    render(<DriverRouteScreen navigation={{ navigate: jest.fn() }} />);

    await waitFor(() => {
      expect(api.get as jest.Mock).toHaveBeenNthCalledWith(2, '/api/v1/routes/route-3/points');
    });

    expect(await screen.findByText('Nenhuma parada válida disponível para esta rota.')).toBeTruthy();
    expect(screen.queryByText('INICIAR ROTA')).toBeNull();
    expect(screen.queryByText('IR PARA PRÓXIMA PARADA')).toBeNull();
  });

  it('offers route completion when every route point is already completed or failed', async () => {
    const navigation = { navigate: jest.fn() };

    (api.get as jest.Mock)
      .mockResolvedValueOnce({
        data: [
          {
            id: 'route-4',
            totalPoints: 2,
            status: 'STARTED',
          },
        ],
      })
      .mockResolvedValueOnce({
        data: [
          {
            id: 'point-4',
            orderId: 'order-4',
            latitude: -3.101,
            longitude: -60.011,
            status: 'COMPLETED',
          },
          {
            id: 'point-5',
            orderId: 'order-5',
            latitude: -3.102,
            longitude: -60.012,
            status: 'FAILED',
          },
        ],
      });

    render(<DriverRouteScreen navigation={navigation} />);

    await waitFor(() => {
      expect(api.get as jest.Mock).toHaveBeenNthCalledWith(2, '/api/v1/routes/route-4/points');
    });

    expect(await screen.findByText('Parada 1')).toBeTruthy();
    expect(screen.getByText('Parada 2')).toBeTruthy();
    expect(screen.queryByText('INICIAR ROTA')).toBeNull();
    expect(screen.queryByText('IR PARA PRÓXIMA PARADA')).toBeNull();
    expect(screen.getByText('ENCERRAR ROTA')).toBeTruthy();

    fireEvent.press(screen.getByText('ENCERRAR ROTA'));

    expect(navigation.navigate).toHaveBeenCalledWith('DriverSummary', {
      routeId: 'route-4',
    });
  });

  it('updates the route CTA to progression mode and starts GPS sync after a successful route start', async () => {
    jest.useFakeTimers();
    const navigation = { navigate: jest.fn() };

    (api.get as jest.Mock)
      .mockResolvedValueOnce({
        data: [
          {
            id: 'route-5',
            totalPoints: 2,
            status: 'PLANNED',
          },
        ],
      })
      .mockResolvedValueOnce({
        data: [
          {
            id: 'point-5',
            orderId: 'order-5',
            latitude: -3.101,
            longitude: -60.011,
            status: 'PENDING',
          },
        ],
      });
    (api.put as jest.Mock).mockResolvedValueOnce({});

    render(<DriverRouteScreen navigation={navigation} />);

    const startButton = await screen.findByText('INICIAR ROTA');
    fireEvent.press(startButton);

    await waitFor(() => {
      expect(api.put as jest.Mock).toHaveBeenCalledWith('/api/v1/routes/route-5/start');
      expect(Location.requestForegroundPermissionsAsync).toHaveBeenCalled();
      expect(Client).toHaveBeenCalledTimes(1);
    });

    expect(await screen.findByText('IR PARA PRÓXIMA PARADA')).toBeTruthy();
    expect(screen.queryByText('INICIAR ROTA')).toBeNull();

    const firstClient = mockStompClients[0];
    expect(firstClient).toBeDefined();

    await act(async () => {
      jest.advanceTimersByTime(10000);
    });

    await waitFor(() => {
      expect(Location.getCurrentPositionAsync).toHaveBeenCalled();
      expect(firstClient.publish).toHaveBeenCalledTimes(1);
    });
  });

  it('clears the active GPS publisher when the websocket disconnects and does not stack duplicate publishers on reconnect', async () => {
    jest.useFakeTimers();

    (api.get as jest.Mock)
      .mockResolvedValueOnce({
        data: [
          {
            id: 'route-7',
            totalPoints: 1,
            status: 'STARTED',
          },
        ],
      })
      .mockResolvedValueOnce({
        data: [
          {
            id: 'point-7',
            orderId: 'order-7',
            latitude: -3.101,
            longitude: -60.011,
            status: 'PENDING',
          },
        ],
      });

    render(<DriverRouteScreen navigation={{ navigate: jest.fn() }} />);

    await waitFor(() => {
      expect(Client).toHaveBeenCalledTimes(1);
    });

    const firstClient = mockStompClients[0];
    expect(firstClient).toBeDefined();

    await act(async () => {
      jest.advanceTimersByTime(10000);
    });

    await waitFor(() => {
      expect(firstClient.publish).toHaveBeenCalledTimes(1);
    });

    await act(async () => {
      firstClient.onDisconnect?.();
    });

    expect(screen.queryByText('📡 GPS ativo')).toBeNull();

    await act(async () => {
      jest.advanceTimersByTime(20000);
    });

    expect(firstClient.publish).toHaveBeenCalledTimes(1);

    await act(async () => {
      firstClient.onConnect?.();
    });

    await act(async () => {
      jest.advanceTimersByTime(10000);
    });

    await waitFor(() => {
      expect(firstClient.publish).toHaveBeenCalledTimes(2);
      expect(Client).toHaveBeenCalledTimes(1);
    });
  });

  it('accepts backend latitude and longitude fields only when mapping route points', async () => {
    (api.get as jest.Mock)
      .mockResolvedValueOnce({
        data: [
          {
            id: 'route-6',
            totalPoints: 1,
            status: 'PLANNED',
          },
        ],
      })
      .mockResolvedValueOnce({
        data: [
          {
            id: 'point-6',
            orderId: 'order-6',
            status: 'PENDING',
            lat: -3.2,
            lng: -60.2,
          },
        ],
      });

    render(<DriverRouteScreen navigation={{ navigate: jest.fn() }} />);

    await waitFor(() => {
      expect(api.get as jest.Mock).toHaveBeenNthCalledWith(2, '/api/v1/routes/route-6/points');
    });

    expect(await screen.findByText('Nenhuma parada válida disponível para esta rota.')).toBeTruthy();
    expect(screen.queryByText('Parada 1')).toBeNull();
    expect(screen.queryByText('INICIAR ROTA')).toBeNull();
  });

  it('derives summary counts from route points and avoids fabricated route metrics', async () => {
    const navigation = { reset: jest.fn() };
    (api.get as jest.Mock).mockResolvedValueOnce({
      data: [
        { id: 'point-1', status: 'COMPLETED' },
        { id: 'point-2', status: 'FAILED' },
        { id: 'point-3', status: 'PENDING' },
      ],
    });

    render(
      <DriverSummaryScreen
        navigation={navigation}
        route={{ params: { routeId: 'route-55' } }}
      />
    );

    await waitFor(() => {
      expect(api.get as jest.Mock).toHaveBeenCalledWith('/api/v1/routes/route-55/points');
    });

    expect(await screen.findByText('#route-55')).toBeTruthy();
    expect(screen.getByText('3')).toBeTruthy();
    expect(screen.getByText('Concluídas')).toBeTruthy();
    expect(screen.getByText('Falhas')).toBeTruthy();
    expect(screen.getByText('1/3')).toBeTruthy();
    expect(screen.getByText('1 entrega(s) com falha')).toBeTruthy();
    expect(screen.getAllByText('--')).toHaveLength(1);
    expect(screen.queryByText('João Silva')).toBeNull();
    expect(screen.queryByText('São Paulo - Zona Sul')).toBeNull();
    expect(screen.queryByText('84.5 km')).toBeNull();
    expect(screen.queryByText('06h 42m')).toBeNull();
  });

  it('completes the route from summary when routeId is provided and no actionable stops remain', async () => {
    (api.get as jest.Mock).mockResolvedValueOnce({
      data: [
        { id: 'point-1', status: 'COMPLETED' },
        { id: 'point-2', status: 'FAILED' },
      ],
    });
    (api.put as jest.Mock).mockResolvedValueOnce({});
    const navigation = { reset: jest.fn() };

    render(
      <DriverSummaryScreen
        navigation={navigation}
        route={{ params: { routeId: 'route-55' } }}
      />
    );

    await waitFor(() => {
      expect(api.get as jest.Mock).toHaveBeenCalledWith('/api/v1/routes/route-55/points');
    });

    fireEvent.press(screen.getByText('ENCERRAR EXPEDIENTE'));

    await waitFor(() => {
      expect(api.put as jest.Mock).toHaveBeenCalledWith('/api/v1/routes/route-55/complete');
      expect(navigation.reset).toHaveBeenCalledWith({
        index: 0,
        routes: [{ name: 'DriverRoute' }],
      });
    });
  });

  it('blocks route completion from summary when actionable stops still remain', async () => {
    const alertSpy = jest.spyOn(require('react-native').Alert, 'alert').mockImplementation(() => {});
    const navigation = { reset: jest.fn() };
    (api.get as jest.Mock).mockResolvedValueOnce({
      data: [
        { id: 'point-1', status: 'COMPLETED' },
        { id: 'point-2', status: 'ARRIVED' },
      ],
    });

    render(
      <DriverSummaryScreen
        navigation={navigation}
        route={{ params: { routeId: 'route-99' } }}
      />
    );

    await waitFor(() => {
      expect(api.get as jest.Mock).toHaveBeenCalledWith('/api/v1/routes/route-99/points');
    });

    fireEvent.press(screen.getByText('ENCERRAR EXPEDIENTE'));

    await waitFor(() => {
      expect(api.put as jest.Mock).not.toHaveBeenCalled();
      expect(alertSpy).toHaveBeenCalledWith('Atenção', 'Ainda existem paradas pendentes nesta rota.');
      expect(navigation.reset).not.toHaveBeenCalled();
    });
  });

  it('stays on the summary screen and alerts when route completion fails', async () => {
    const alertSpy = jest.spyOn(require('react-native').Alert, 'alert').mockImplementation(() => {});
    const navigation = { reset: jest.fn() };
    (api.get as jest.Mock).mockResolvedValueOnce({
      data: [
        { id: 'point-1', status: 'COMPLETED' },
      ],
    });
    (api.put as jest.Mock).mockRejectedValueOnce(new Error('complete failed'));

    render(
      <DriverSummaryScreen
        navigation={navigation}
        route={{ params: { routeId: 'route-99' } }}
      />
    );

    await waitFor(() => {
      expect(api.get as jest.Mock).toHaveBeenCalledWith('/api/v1/routes/route-99/points');
    });

    fireEvent.press(screen.getByText('ENCERRAR EXPEDIENTE'));

    await waitFor(() => {
      expect(api.put as jest.Mock).toHaveBeenCalledWith('/api/v1/routes/route-99/complete');
      expect(alertSpy).toHaveBeenCalledWith('Erro', 'Não foi possível concluir a rota. Tente novamente.');
      expect(navigation.reset).not.toHaveBeenCalled();
    });
  });

  it('blocks route completion while summary points are still loading', async () => {
    const alertSpy = jest.spyOn(require('react-native').Alert, 'alert').mockImplementation(() => {});
    const navigation = { reset: jest.fn() };
    let resolvePoints: ((value: unknown) => void) | undefined;
    (api.get as jest.Mock).mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolvePoints = resolve;
        })
    );

    render(
      <DriverSummaryScreen
        navigation={navigation}
        route={{ params: { routeId: 'route-loading' } }}
      />
    );

    fireEvent.press(screen.getByText('ENCERRAR EXPEDIENTE'));

    expect(api.put as jest.Mock).not.toHaveBeenCalled();
    expect(alertSpy).toHaveBeenCalledWith('Atenção', 'Aguarde o carregamento dos pontos antes de encerrar o expediente.');
    expect(navigation.reset).not.toHaveBeenCalled();

    resolvePoints?.({
      data: [
        { id: 'point-1', status: 'COMPLETED' },
      ],
    });

    await waitFor(() => {
      expect(api.get as jest.Mock).toHaveBeenCalledWith('/api/v1/routes/route-loading/points');
    });
  });

  it('keeps a distinct summary load-error state and blocks route completion when route points fail to load', async () => {
    const alertSpy = jest.spyOn(require('react-native').Alert, 'alert').mockImplementation(() => {});
    const navigation = { reset: jest.fn() };
    (api.get as jest.Mock).mockRejectedValueOnce(new Error('points unavailable'));

    render(
      <DriverSummaryScreen
        navigation={navigation}
        route={{ params: { routeId: 'route-404' } }}
      />
    );

    await waitFor(() => {
      expect(api.get as jest.Mock).toHaveBeenCalledWith('/api/v1/routes/route-404/points');
    });

    expect(await screen.findByText('Não foi possível carregar os pontos desta rota.')).toBeTruthy();
    expect(screen.queryByText('0/0')).toBeNull();

    fireEvent.press(screen.getByText('ENCERRAR EXPEDIENTE'));

    await waitFor(() => {
      expect(api.put as jest.Mock).not.toHaveBeenCalled();
      expect(alertSpy).toHaveBeenCalledWith('Erro', 'Recarregue os pontos da rota antes de encerrar o expediente.');
      expect(navigation.reset).not.toHaveBeenCalled();
    });
  });

  it('falls back safely from summary when routeId is absent', async () => {
    const navigation = { reset: jest.fn() };

    render(<DriverSummaryScreen navigation={navigation} route={{ params: {} }} />);

    fireEvent.press(screen.getByText('ENCERRAR EXPEDIENTE'));

    await waitFor(() => {
      expect(api.put as jest.Mock).not.toHaveBeenCalled();
      expect(navigation.reset).toHaveBeenCalledWith({
        index: 0,
        routes: [{ name: 'DriverRoute' }],
      });
    });
  });
});
