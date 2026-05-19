import React from 'react';
import { Alert } from 'react-native';
import { act, render, screen, userEvent, waitFor } from '@testing-library/react-native';
import { DriverOccurrenceScreen } from '../src/screens/Driver/DriverOccurrenceScreen';
import { api } from '../src/services/api';

const navigation = { goBack: jest.fn(), navigate: jest.fn(), reset: jest.fn() };
const route = {
  params: {
    ponto: {
      id: 'delivery-1',
      nome: 'Cliente Teste',
    },
  },
};

describe('DriverOccurrenceScreen fail flow', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('sends the selected reason to the fail endpoint and resets to DriverRoute on success', async () => {
    jest.useFakeTimers();

    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    const alertSpy = jest.spyOn(Alert, 'alert');
    (api.put as unknown as jest.Mock).mockResolvedValueOnce({});

    render(<DriverOccurrenceScreen navigation={navigation} route={route} />);

    expect(screen.queryByText('— OBSERVAÇÕES (OPCIONAL)')).toBeNull();
    expect(screen.queryByPlaceholderText('Adicione detalhes relevantes sobre o ocorrido...')).toBeNull();
    expect(screen.queryByText('0/250 caracteres')).toBeNull();

    await user.press(screen.getByText('Local Fechado'));
    await user.press(screen.getByText('CONFIRMAR OCORRÊNCIA'));

    await act(async () => {
      jest.runOnlyPendingTimers();
    });

    await waitFor(() => {
      expect((api.put as unknown as jest.Mock)).toHaveBeenCalledWith(
        '/api/v1/delivery-points/delivery-1/fail',
        {
          reason: 'CLOSED',
        }
      );
      expect(navigation.reset).toHaveBeenCalledWith({
        index: 0,
        routes: [{ name: 'DriverRoute' }],
      });
    });

    expect(navigation.goBack).not.toHaveBeenCalled();
    expect(navigation.navigate).not.toHaveBeenCalled();
    expect(alertSpy).not.toHaveBeenCalled();
  });
});
