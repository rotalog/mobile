import React, { createContext, ReactNode, useCallback, useContext, useState } from 'react';
import { CartItem } from '../hooks/useCart';

export type DeliveryStatus = 'confirmed' | 'route' | 'delivered';

export interface DeliveryOrder {
  id: string;
  items: CartItem[];
  total: number;
  status: DeliveryStatus;
  createdAt: string;
}

interface DeliveryContextData {
  orders: DeliveryOrder[];
  addOrder: (order: Omit<DeliveryOrder, 'status' | 'createdAt'>) => void;
  updateOrderStatus: (id: string, status: DeliveryStatus) => void;
}

const DeliveryContext = createContext<DeliveryContextData>({} as DeliveryContextData);

export function DeliveryProvider({ children }: { children: ReactNode }) {
  const [orders, setOrders] = useState<DeliveryOrder[]>([]);

  const addOrder = useCallback((order: Omit<DeliveryOrder, 'status' | 'createdAt'>) => {
    setOrders(prev => [
      {
        ...order,
        status: 'confirmed',
        createdAt: new Date().toISOString(),
      },
      ...prev,
    ]);
  }, []);

  const updateOrderStatus = useCallback((id: string, status: DeliveryStatus) => {
    setOrders(prev => prev.map(order => order.id === id ? { ...order, status } : order));
  }, []);

  return (
    <DeliveryContext.Provider value={{ orders, addOrder, updateOrderStatus }}>
      {children}
    </DeliveryContext.Provider>
  );
}

export function useDelivery() {
  return useContext(DeliveryContext);
}
