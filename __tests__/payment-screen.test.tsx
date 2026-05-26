import React from 'react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { PaymentScreen } from '../src/screens/Payment/PaymentScreen';
import { api } from '../src/services/api';

const mockClearCart = jest.fn();
let latestButtonProps: any;

jest.mock('../src/context/CartContext', () => ({
  useCart: () => ({ clearCart: mockClearCart }),
}));

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
    Button: (props: any) => {
      latestButtonProps = props;
      const { label, onPress, disabled, loading } = props;
      return (
        <TouchableOpacity onPress={onPress} disabled={disabled || loading}>
          <Text>{label}</Text>
        </TouchableOpacity>
      );
    },
  };
});

describe('PaymentScreen', () => {
  const navigation = {
    goBack: jest.fn(),
    reset: jest.fn(),
  };

  const route = {
    params: {
      orderId: 'order-123',
      total: 34.9,
    },
  };

  beforeEach(() => {
    jest.useFakeTimers();
    mockClearCart.mockClear();
    navigation.goBack.mockClear();
    navigation.reset.mockClear();
    latestButtonProps = undefined;
  });

  it('polls payment status through the backend orderId endpoint even when create returns a gateway reference', async () => {
    (api.post as jest.Mock).mockResolvedValue({
      data: {
        orderId: 'order-123',
        supplierId: 'supplier-77',
        method: 'PIX',
        status: 'PENDING',
        gatewayReference: 'gateway-ref-999',
        amount: 34.9,
        dueDate: '2026-05-20',
      },
    });
    (api.get as jest.Mock).mockResolvedValue({
      data: {
        status: 'PENDING',
      },
    });

    render(<PaymentScreen navigation={navigation} route={route} />);

    fireEvent.press(screen.getByText('GERAR CÓDIGO PIX'));

    await waitFor(() => {
      expect(api.post as jest.Mock).toHaveBeenCalledWith('/api/v1/payments/create', {
        orderId: 'order-123',
        method: 'pix',
        amount: 34.9,
      });
    });

    await act(async () => {
      jest.advanceTimersByTime(5000);
    });

    await waitFor(() => {
      expect(api.get as jest.Mock).toHaveBeenCalledWith('/api/v1/payments/order-123');
    });

    expect(api.get as jest.Mock).not.toHaveBeenCalledWith('/api/v1/payments/gateway-ref-999');
  });

  it('does not locally confirm or clear the cart when JÁ PAGUEI is pressed before backend confirmation', async () => {
    (api.post as jest.Mock).mockResolvedValueOnce({
      data: {
        orderId: 'order-123',
        supplierId: 'supplier-77',
        method: 'PIX',
        status: 'PENDING',
        gatewayReference: 'gateway-ref-999',
        amount: 34.9,
        dueDate: '2026-05-20',
      },
    });
    (api.get as jest.Mock).mockResolvedValueOnce({
      data: {
        status: 'PENDING',
      },
    });

    render(<PaymentScreen navigation={navigation} route={route} />);

    fireEvent.press(screen.getByText('GERAR CÓDIGO PIX'));

    expect(await screen.findByText('Aguardando pagamento Pix')).toBeTruthy();

    fireEvent.press(screen.getByText('JÁ PAGUEI'));

    await waitFor(() => {
      expect(api.get as jest.Mock).toHaveBeenCalledWith('/api/v1/payments/order-123');
    });

    expect(mockClearCart).not.toHaveBeenCalled();
    expect(screen.getByText('Aguardando pagamento Pix')).toBeTruthy();
    expect(screen.queryByText('Pedido confirmado!')).toBeNull();
  });

  it('ignores a second immediate submit while the payment creation request is still in flight', async () => {
    let resolveCreate: ((value: unknown) => void) | undefined;
    (api.post as jest.Mock).mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolveCreate = resolve;
        })
    );

    render(<PaymentScreen navigation={navigation} route={route} />);

    await act(async () => {
      latestButtonProps.onPress();
      latestButtonProps.onPress();
    });

    expect(api.post as jest.Mock).toHaveBeenCalledTimes(1);
    expect(api.post as jest.Mock).toHaveBeenCalledWith('/api/v1/payments/create', {
      orderId: 'order-123',
      method: 'pix',
      amount: 34.9,
    });

    resolveCreate?.({
      data: {
        orderId: 'order-123',
        supplierId: 'supplier-77',
        method: 'PIX',
        status: 'PENDING',
        gatewayReference: 'gateway-ref-999',
        amount: 34.9,
        dueDate: '2026-05-20',
      },
    });

    expect(await screen.findByText('Aguardando pagamento Pix')).toBeTruthy();
  });

  it('confirms immediately when payment creation already returns an approved terminal status', async () => {
    (api.post as jest.Mock).mockResolvedValueOnce({
      data: {
        orderId: 'order-123',
        supplierId: 'supplier-77',
        method: 'PIX',
        status: 'APPROVED',
        gatewayReference: 'gateway-ref-999',
        amount: 34.9,
        dueDate: '2026-05-20',
      },
    });

    render(<PaymentScreen navigation={navigation} route={route} />);

    fireEvent.press(screen.getByText('GERAR CÓDIGO PIX'));

    expect(await screen.findByText('Pedido confirmado!')).toBeTruthy();
    expect(screen.queryByText('Aguardando pagamento Pix')).toBeNull();
    expect(mockClearCart).toHaveBeenCalledTimes(1);
    expect(api.get as jest.Mock).not.toHaveBeenCalled();
  });

  it('fails immediately when payment creation already returns a cancelled terminal status', async () => {
    (api.post as jest.Mock).mockResolvedValueOnce({
      data: {
        orderId: 'order-123',
        supplierId: 'supplier-77',
        method: 'PIX',
        status: 'CANCELLED',
        gatewayReference: 'gateway-ref-999',
        amount: 34.9,
        dueDate: '2026-05-20',
      },
    });

    render(<PaymentScreen navigation={navigation} route={route} />);

    fireEvent.press(screen.getByText('GERAR CÓDIGO PIX'));

    expect(await screen.findByText('Pagamento não confirmado')).toBeTruthy();
    expect(screen.queryByText('Aguardando pagamento Pix')).toBeNull();
    expect(mockClearCart).not.toHaveBeenCalled();
    expect(api.get as jest.Mock).not.toHaveBeenCalled();
  });

  it('shows a retry state instead of confirming the order when payment creation fails', async () => {
    (api.post as jest.Mock).mockRejectedValueOnce(new Error('create failed'));

    render(<PaymentScreen navigation={navigation} route={route} />);

    fireEvent.press(screen.getByText('GERAR CÓDIGO PIX'));

    await waitFor(() => {
      expect(api.post as jest.Mock).toHaveBeenCalledWith('/api/v1/payments/create', {
        orderId: 'order-123',
        method: 'pix',
        amount: 34.9,
      });
    });

    expect(await screen.findByText('Pagamento não confirmado')).toBeTruthy();
    expect(screen.getByText('Tente novamente ou escolha outro método.')).toBeTruthy();
    expect(screen.getByText('TENTAR NOVAMENTE')).toBeTruthy();
    expect(screen.queryByText('Pedido confirmado!')).toBeNull();
    expect(mockClearCart).not.toHaveBeenCalled();
    expect(api.get as jest.Mock).not.toHaveBeenCalled();
  });
});
