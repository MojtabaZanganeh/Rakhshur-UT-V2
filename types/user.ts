export type Dormitory = "dormitory-1" | "dormitory-2";
export type UserRole =
  | "user"
  | "admin"
  | "admin-dormitory-1"
  | "admin-dormitory-2";

export type userRegister = {
  first_name: string;
  last_name: string;
  phone: string;
  student_id: string;
  dormitory: Dormitory;
};
export type User = {
  id: string;
  first_name: string;
  last_name: string;
  phone: string;
  student_id: string;
  dormitory: Dormitory;
  role: UserRole;
  token: string;
};
