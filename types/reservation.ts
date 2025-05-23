export type ReservationStatus = 'waiting' | 'washing' | 'ready';

export type TimeSlot = {
  id: string;
  startTime: string; // ISO format
  endTime: string; // ISO format
  dormitory: string;
  isAvailable: boolean;
};

export type Reservation = {
  id: string;
  userId: string;
  timeSlots: TimeSlot[];
  status: ReservationStatus;
  createdAt: string; // ISO format
  updatedAt: string; // ISO format
  paymentStatus: 'pending' | 'completed';
};