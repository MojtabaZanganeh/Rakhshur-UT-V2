import { Dormitory } from "./user";

export type ReservationStatus = "pending" | "washing" | "ready" | "finished" | "cancelled";

export interface TimeSlot {
  id: string;
  date?: string;
  start_time: string | Date;
  end_time: string | Date;
  is_active?: boolean;
  is_custom?: boolean;
  capacity?: number;
  capacity_left?: number;
  dormitory?: Dormitory;
}

export interface ValidationErrors {
  start_time?: string;
  end_time?: string;
  [key: string]: string | undefined;
}

export type Reservation = {
  id: string;
  user_id: string;
  user_first_name: string;
  user_last_name: string;
  timeSlots: TimeSlot;
  status: ReservationStatus;
  created_at: string;
  updated_at: string;
  paymentStatus: "pending" | "completed";
};

