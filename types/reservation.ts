import { Dormitory } from "./user";

export type ReservationStatus = "waiting" | "washing" | "ready";

export interface TimeSlot {
  id: string;
  startTime: string | Date;
  endTime: string | Date;
  isActive?: boolean;
  isCustom?: boolean;
  capacity?: number;
  dormitory?: Dormitory;
}

export interface ValidationErrors {
  startTime?: string;
  endTime?: string;
  [key: string]: string | undefined;
}

export type Reservation = {
  id: string;
  userId: string;
  timeSlots: TimeSlot[];
  status: ReservationStatus;
  createdAt: string;
  updatedAt: string;
  paymentStatus: "pending" | "completed";
};

