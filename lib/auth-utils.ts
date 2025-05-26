import { User } from "@/types/user";
import toast from "react-hot-toast";

export async function verifyToken(): Promise<User | null> {
  try {
    const response = await fetch("/api/auth/verify-token", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    const data = await response.json();

    if (response.status !== 200) {
      return null;
    }

    if (data.success) {
      return data.user;
    }
    else {
      toast.error(data.message ?? 'خطا در بررسی توکن')
    }

    return null;
  } catch (error) {
    console.error("خطا در بررسی توکن:", error);
    return null;
  }
}

export function hasAccess(user: User | null, requiredRoles: string[]): boolean {
  if (!user) return false;
  return requiredRoles.includes(user.role);
}

export function getRoleName(role: string): string {
  switch (role) {
    case "admin":
      return "مدیر کل";
    case "admin-dorm1":
      return "مدیر خوابگاه ۱";
    case "admin-dorm2":
      return "مدیر خوابگاه ۲";
    case "user":
      return "کاربر";
    default:
      return "نامشخص";
  }
}
