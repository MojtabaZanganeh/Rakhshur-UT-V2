import { Reservation, ReservationStatus, TimeSlot } from '@/types/reservation';
import { toast } from 'sonner';

type FetchOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: any;
  headers?: Record<string, string>;
};

export async function fetchApi<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
  try {
    const { method = 'GET', body, headers = {} } = options;

    const requestOptions: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      credentials: 'include', // Include cookies with request
    };

    if (body) {
      requestOptions.body = JSON.stringify(body);
    }

    const response = await fetch(`/api${endpoint}`, requestOptions);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.message || `Error: ${response.status}`;
      throw new Error(errorMessage);
    }

    return await response.json();
  } catch (error) {
    console.error(`API error for ${endpoint}:`, error);
    toast.error(error instanceof Error ? error.message : 'An error occurred');
    throw error;
  }
}

// Time slots API
export const fetchTimeSlots = (dormitory: string) => 
  fetchApi<{ timeSlots: TimeSlot[] }>(`/timeslots?dormitory=${dormitory}`);

export const reserveTimeSlots = (timeSlotIds: string[]) => 
  fetchApi<{ reservation: Reservation }>('/reservations', {
    method: 'POST',
    body: { timeSlotIds },
  });

// Reservations API
export const fetchUserReservations = () => 
  fetchApi<{ reservations: Reservation[] }>('/reservations');

// Admin API
export const addTimeSlot = (timeSlotData: Omit<TimeSlot, 'id'>) => 
  fetchApi<{ timeSlot: TimeSlot }>('/admin/timeslots', {
    method: 'POST',
    body: timeSlotData,
  });

export const updateReservationStatus = (reservationId: string, status: ReservationStatus) => 
  fetchApi<{ reservation: Reservation }>(`/admin/reservations/${reservationId}`, {
    method: 'PUT',
    body: { status },
  });