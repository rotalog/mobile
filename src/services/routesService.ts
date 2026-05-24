import { api } from './api';

export type RouteStatus = 'PLANNED' | 'STARTED' | 'COMPLETED';

export type DeliveryPointStatus = 'PENDING' | 'ARRIVED' | 'COMPLETED' | 'FAILED';

export interface DeliveryPointResponse {
  id: string;
  orderId: string;
  latitude: number;
  longitude: number;
  geofenceRadiusMeters?: number;
  status: DeliveryPointStatus;
  failureReason?: string;
}

export interface RouteResponse {
  id: string;
  supplierId: string;
  driverId: string;
  createdAt: string;
  totalPoints: number;
  deliveredCount: number;
  failedCount: number;
  status: RouteStatus;
  deliveryPoints?: DeliveryPointResponse[];
}

export async function getTodayRoutes() {
  const { data } = await api.get<RouteResponse[]>('/api/v1/routes/today');
  return data;
}

export async function getRoutePoints(routeId: string) {
  const { data } = await api.get<DeliveryPointResponse[]>(`/api/v1/routes/${routeId}/points`);
  return data;
}

export async function startRoute(routeId: string) {
  const { data } = await api.put<RouteResponse>(`/api/v1/routes/${routeId}/start`);
  return data;
}

export async function completeRoute(routeId: string) {
  const { data } = await api.put<RouteResponse>(`/api/v1/routes/${routeId}/complete`);
  return data;
}
