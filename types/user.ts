export type Dormitory = 'dormitory-1' | 'dormitory-2';
export type UserRole = 'user' | 'admin';
export type User = {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  studentId: string;
  dormitory: Dormitory;
  role: UserRole;
};