import { api } from './api';
import { DeliveryPointResponse } from './routesService';

export type FailureReason =
  | 'CUSTOMER_ABSENT'
  | 'INVALID_ADDRESS'
  | 'VEHICLE_ISSUE'
  | 'OTHER'
  | 'CLOSED'
  | 'ADDRESS_NOT_FOUND'
  | 'REFUSED';

export async function arriveAtDeliveryPoint(
  pointId: string,
  location?: { latitude: number; longitude: number }
) {
  const { data } = await api.put<DeliveryPointResponse>(`/api/v1/delivery-points/${pointId}/arrive`, {
    driverLatitude: location?.latitude,
    driverLongitude: location?.longitude,
  });
  return data;
}

export async function failDeliveryPoint(pointId: string, reason: FailureReason) {
  const { data } = await api.put<DeliveryPointResponse>(`/api/v1/delivery-points/${pointId}/fail`, {
    reason,
  });
  return data;
}
